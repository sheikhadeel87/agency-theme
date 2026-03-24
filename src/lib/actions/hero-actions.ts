"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Hero } from "@/models/Hero";

export type SaveHeroState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

export async function saveHero(formData: FormData): Promise<SaveHeroState> {
  try {
    await dbConnect();

    const payload = {
      heading: str(formData, "heading"),
      description: str(formData, "description"),
      ctaText: str(formData, "ctaText"),
      ctaLink: str(formData, "ctaLink"),
      badgeText: str(formData, "badgeText"),
      phoneText: str(formData, "phoneText"),
      isEnabled: bool(formData, "isEnabled"),
    };

    await Hero.findOneAndUpdate(
      {},
      { $set: payload },
      { upsert: true, new: true }
    );

    try {
      revalidatePath("/");
      revalidatePath("/admin/homepage");
    } catch (e) {
      console.warn("revalidatePath after saveHero:", e);
    }

    return { success: true };
  } catch (e) {
    console.error("saveHero error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save hero.",
    };
  }
}
