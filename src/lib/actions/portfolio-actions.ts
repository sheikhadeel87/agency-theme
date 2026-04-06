"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SavePortfolioState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function arr(formData: FormData, key: string): string[] {
  const raw = formData.get(key)?.toString()?.trim() ?? "";
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
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
    .replace(/^-+|-+$/g, "") || "project";
}

export async function savePortfolio(
  formData: FormData
): Promise<SavePortfolioState> {
  try {
    await dbConnect();

    const id = str(formData, "_id");
    const title = str(formData, "title");
    let slug = str(formData, "slug");
    if (!slug && title) slug = slugify(title);
    if (!slug) slug = `project-${Date.now()}`;

    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        imageUrl = await saveUploadedAdminImage(file, {
          storageFolder: "portfolio",
          idPrefix: slug,
        });
      } catch (err) {
        console.error("Portfolio image upload error:", err);
      }
    } else if (id) {
      const existing = await Portfolio.findById(id).lean();
      if (existing && (existing as { imageUrl?: string }).imageUrl) {
        imageUrl = (existing as { imageUrl: string }).imageUrl;
      }
    }

    const payload = {
      title,
      slug,
      shortDescription: str(formData, "shortDescription"),
      fullDescription: str(formData, "fullDescription"),
      client: str(formData, "client"),
      categories: arr(formData, "categories"),
      technologyStack: arr(formData, "technologyStack"),
      imageUrl,
      galleryImages: arr(formData, "galleryImages"),
      projectUrl: str(formData, "projectUrl"),
      status: (formData.get("status")?.toString()?.trim() === "Published"
        ? "Published"
        : "Draft") as "Draft" | "Published",
      metaTitle: str(formData, "metaTitle") || title,
      metaDescription: str(formData, "metaDescription") || str(formData, "shortDescription"),
      metaKeywords: str(formData, "metaKeywords"),
      featuredOnHomepage: bool(formData, "featuredOnHomepage"),
    };

    const { isValidObjectId } = await import("mongoose");
    if (id && isValidObjectId(id)) {
      await Portfolio.findByIdAndUpdate(id, { $set: payload }, { new: true });
      await recordAdminAudit({
        action: "UPDATE_PORTFOLIO",
        resource: "portfolio",
        resourceId: id,
        metadata: { title: payload.title, slug: payload.slug },
      });
    } else {
      const created = await Portfolio.create(payload);
      await recordAdminAudit({
        action: "CREATE_PORTFOLIO",
        resource: "portfolio",
        resourceId: String(created._id),
        metadata: { title: payload.title, slug: payload.slug },
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin/portfolio");
    } catch (revalErr) {
      console.warn("revalidatePath after savePortfolio:", revalErr);
    }

    return { success: true };
  } catch (e) {
    console.error("savePortfolio error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save portfolio.",
    };
  }
}
