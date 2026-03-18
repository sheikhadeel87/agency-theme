"use server";

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

export async function savePortfolio(
  formData: FormData
): Promise<SavePortfolioState> {
  try {
    await dbConnect();

    const id = str(formData, "_id");
    const payload = {
      title: str(formData, "title"),
      slug: str(formData, "slug"),
      shortDescription: str(formData, "shortDescription"),
      fullDescription: str(formData, "fullDescription"),
      client: str(formData, "client"),
      categories: arr(formData, "categories"),
      technologyStack: arr(formData, "technologyStack"),
      imageUrl: str(formData, "imageUrl"),
      galleryImages: arr(formData, "galleryImages"),
      projectUrl: str(formData, "projectUrl"),
      status: (formData.get("status")?.toString()?.trim() === "Published"
        ? "Published"
        : "Draft") as "Draft" | "Published",
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
