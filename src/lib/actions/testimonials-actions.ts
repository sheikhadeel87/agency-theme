"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { TestimonialsSettings } from "@/models/TestimonialsSettings";
import { Testimonial } from "@/models/Testimonial";
import { saveUploadedAdminImage } from "@/lib/upload-image";
import { quoteExceedsWordLimit, TESTIMONIAL_QUOTE_MAX_WORDS } from "@/lib/testimonial-quote";

export type SaveTestimonialsSettingsState = { success?: boolean; error?: string };
export type SaveTestimonialState = { success?: boolean; error?: string };
export type DeleteTestimonialState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Save testimonials section settings + SEO (single doc, upsert) */
export async function saveTestimonialsSettings(
  formData: FormData
): Promise<SaveTestimonialsSettingsState> {
  try {
    await dbConnect();
    const sectionTitle = str(formData, "sectionTitle");
    const payload = {
      sectionTitle: sectionTitle || "Client's Testimonials",
      sectionDescription: str(formData, "sectionDescription"),
      metaTitle: str(formData, "metaTitle") || sectionTitle,
      metaDescription: str(formData, "metaDescription") || str(formData, "sectionDescription"),
      metaKeywords: str(formData, "metaKeywords"),
      isEnabled: bool(formData, "isEnabled"),
    };
    await TestimonialsSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
    await recordAdminAudit({
      action: "UPDATE_TESTIMONIALS_SECTION",
      resource: "testimonials-settings",
      metadata: { title: payload.sectionTitle },
    });
    try {
      revalidatePath("/admin/testimonials");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("revalidatePath after saveTestimonialsSettings:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("saveTestimonialsSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save testimonials section.",
    };
  }
}

/** Save a testimonial (create or update) */
export async function saveTestimonial(formData: FormData): Promise<SaveTestimonialState> {
  try {
    await dbConnect();
    const id = str(formData, "_id");
    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        const name = str(formData, "authorName") || "testimonial";
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") || "testimonial";
        imageUrl = await saveUploadedAdminImage(file, {
          storageFolder: "testimonials",
          idPrefix: slug,
          maxBytes: MAX_IMAGE_BYTES,
        });
      } catch (err) {
        console.error("Testimonial image upload error:", err);
      }
    } else if (id) {
      const existing = await Testimonial.findById(id).lean();
      if (existing && (existing as { imageUrl?: string }).imageUrl) {
        imageUrl = (existing as { imageUrl: string }).imageUrl;
      }
    }
    const order = parseInt(formData.get("order")?.toString() ?? "0", 10) || 0;
    const quote = str(formData, "quote");
    if (quoteExceedsWordLimit(quote)) {
      return {
        error: `Quote must be ${TESTIMONIAL_QUOTE_MAX_WORDS} words or fewer.`,
      };
    }
    const payload = {
      quote,
      authorName: str(formData, "authorName"),
      designation: str(formData, "designation"),
      brandName: str(formData, "brandName"),
      imageUrl,
      order,
    };
    if (id) {
      await Testimonial.findByIdAndUpdate(id, { $set: payload }, { new: true });
      await recordAdminAudit({
        action: "UPDATE_TESTIMONIAL",
        resource: "testimonial",
        resourceId: id,
        metadata: { title: payload.authorName },
      });
    } else {
      const created = await Testimonial.create(payload);
      await recordAdminAudit({
        action: "CREATE_TESTIMONIAL",
        resource: "testimonial",
        resourceId: String(created._id),
        metadata: { title: payload.authorName },
      });
    }
    try {
      revalidatePath("/admin/testimonials");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("revalidatePath after saveTestimonial:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("saveTestimonial error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save testimonial.",
    };
  }
}

/** Delete a testimonial */
export async function deleteTestimonial(id: string): Promise<DeleteTestimonialState> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) return { error: "Invalid testimonial id." };
    const existing = await Testimonial.findById(id).lean();
    const authorName = existing
      ? String((existing as { authorName?: string }).authorName ?? "")
      : "";
    await Testimonial.findByIdAndDelete(id);
    await recordAdminAudit({
      action: "DELETE_TESTIMONIAL",
      resource: "testimonial",
      resourceId: id,
      metadata: { title: authorName || undefined },
    });
    try {
      revalidatePath("/admin/testimonials");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("revalidatePath after deleteTestimonial:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("deleteTestimonial error:", e);
    return { error: e instanceof Error ? e.message : "Failed to delete testimonial." };
  }
}
