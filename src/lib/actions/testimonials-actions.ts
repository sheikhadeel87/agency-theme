"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { TestimonialsSettings } from "@/models/TestimonialsSettings";
import { Testimonial } from "@/models/Testimonial";

export type SaveTestimonialsSettingsState = { success?: boolean; error?: string };
export type SaveTestimonialState = { success?: boolean; error?: string };
export type DeleteTestimonialState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

async function saveUploadedImage(file: File, prefix: string): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be under 5MB");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const name = `${prefix}-${Date.now()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", "testimonials");
  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, name), Buffer.from(bytes));
  return `/uploads/testimonials/${name}`;
}

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
    };
    await TestimonialsSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
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
        imageUrl = await saveUploadedImage(file, slug);
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
    const payload = {
      quote: str(formData, "quote"),
      authorName: str(formData, "authorName"),
      designation: str(formData, "designation"),
      brandName: str(formData, "brandName"),
      imageUrl,
      order,
    };
    if (id) {
      await Testimonial.findByIdAndUpdate(id, { $set: payload }, { new: true });
    } else {
      await Testimonial.create(payload);
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
    await Testimonial.findByIdAndDelete(id);
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
