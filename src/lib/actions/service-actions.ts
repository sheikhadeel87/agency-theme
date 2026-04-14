"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { Service } from "@/models/Service";
import type { ServiceStatus } from "@/models/Service";
import {
  finalizeMetaKeywordsStorage,
  tidyOneLine,
  validateEffectiveSeoBundle,
} from "@/lib/seo-metadata";
import {
  countWordsFromHtml,
  SERVICE_DESCRIPTION_MAX_WORDS,
} from "@/lib/word-count";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SaveServiceState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || "service";
}

export async function saveService(formData: FormData): Promise<SaveServiceState> {
  try {
    await dbConnect();

    const id = str(formData, "_id");
    const title = str(formData, "title");
    let slug = str(formData, "slug");
    if (!slug && title) slug = slugify(title);
    if (!slug) slug = `service-${Date.now()}`;

    const status = (formData.get("status")?.toString()?.trim() === "Published"
      ? "Published"
      : "Draft") as ServiceStatus;

    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        imageUrl = await saveUploadedAdminImage(file, {
          storageFolder: "services",
          idPrefix: slug,
        });
      } catch (err) {
        console.error("Service image upload error:", err);
      }
    } else if (id) {
      const existing = await Service.findById(id).lean();
      if (existing && (existing as { imageUrl?: string }).imageUrl) {
        imageUrl = (existing as { imageUrl: string }).imageUrl;
      }
    }

    const description = str(formData, "description");
    const descriptionWords = countWordsFromHtml(description);
    if (descriptionWords > SERVICE_DESCRIPTION_MAX_WORDS) {
      return {
        error: `Description must be at most ${SERVICE_DESCRIPTION_MAX_WORDS} words (currently ${descriptionWords}).`,
      };
    }

    const metaTitle = str(formData, "metaTitle");
    const metaDescription = str(formData, "metaDescription");
    const seoErr = validateEffectiveSeoBundle({
      metaTitle,
      metaDescription,
      fallbackTitle: title,
      fallbackDescription: description,
    });
    if (seoErr) return { error: seoErr };

    const payload = {
      title,
      slug,
      description,
      imageUrl,
      status,
      featuredOnHomepage: bool(formData, "featuredOnHomepage"),
      metaTitle: tidyOneLine(metaTitle) || title,
      metaDescription: tidyOneLine(metaDescription) || description,
      metaKeywords: finalizeMetaKeywordsStorage(str(formData, "metaKeywords")),
    };

    const { isValidObjectId } = await import("mongoose");
    if (id && isValidObjectId(id)) {
      await Service.findByIdAndUpdate(id, { $set: payload }, { new: true });
      await recordAdminAudit({
        action: "UPDATE_SERVICE",
        resource: "service",
        resourceId: id,
        metadata: { title: payload.title, slug: payload.slug },
      });
    } else {
      const created = await Service.create(payload);
      await recordAdminAudit({
        action: "CREATE_SERVICE",
        resource: "service",
        resourceId: String(created._id),
        metadata: { title: payload.title, slug: payload.slug },
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/services");
      revalidatePath("/admin/services");
      const detailSeg =
        payload.slug?.trim() || (id && isValidObjectId(id) ? id : "");
      if (detailSeg) {
        revalidatePath(`/services/${encodeURIComponent(detailSeg)}`);
      }
    } catch (e) {
      console.warn("revalidatePath after saveService:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("saveService error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save service.",
    };
  }
}

export async function deleteService(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) return { error: "Invalid service id." };
    const existing = await Service.findById(id).lean();
    const title = existing ? String((existing as { title?: string }).title ?? "") : "";
    const slug = existing ? String((existing as { slug?: string }).slug ?? "") : "";
    await Service.findByIdAndDelete(id);
    await recordAdminAudit({
      action: "DELETE_SERVICE",
      resource: "service",
      resourceId: id,
      metadata: { title: title || undefined, slug: slug || undefined },
    });
    try {
      revalidatePath("/");
      revalidatePath("/services");
      const seg = slug?.trim() || id;
      if (seg) revalidatePath(`/services/${encodeURIComponent(seg)}`);
      revalidatePath("/admin/services");
    } catch (e) {
      console.warn("revalidatePath after deleteService:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("deleteService error:", e);
    return { error: e instanceof Error ? e.message : "Failed to delete service." };
  }
}
