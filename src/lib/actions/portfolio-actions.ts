"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { dbConnect } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";
}

async function saveUploadedImage(file: File, slugBase: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const name = `${slugBase}-${Date.now()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", "portfolio");
  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  const filePath = path.join(dir, name);
  await writeFile(filePath, Buffer.from(bytes));
  return `/uploads/portfolio/${name}`;
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
        imageUrl = await saveUploadedImage(file, slug);
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
    };

    if (id) {
      await Portfolio.findByIdAndUpdate(id, { $set: payload }, { new: true });
    } else {
      await Portfolio.create(payload);
    }

    return { success: true };
  } catch (e) {
    console.error("savePortfolio error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save portfolio.",
    };
  }
}
