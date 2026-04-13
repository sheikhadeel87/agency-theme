"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { WhyChooseUsSettings } from "@/models/WhyChooseUsSettings";
import {
  finalizeMetaKeywordsStorage,
  tidyOneLine,
  validateEffectiveSeoBundle,
} from "@/lib/seo-metadata";
import { saveUploadedAdminImage } from "@/lib/upload-image";
import {
  WHY_CHOOSE_US_SECTION_DESCRIPTION_MAX_WORDS,
  countWordsFromHtml,
} from "@/lib/word-count";

export type SaveWhyChooseUsState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

export async function saveWhyChooseUsSettings(
  formData: FormData
): Promise<SaveWhyChooseUsState> {
  try {
    await dbConnect();

    const existing = await WhyChooseUsSettings.findOne().lean();
    const prev = existing as Record<string, unknown> | null;
    const clear1 = formData.get("image1Clear") === "true";
    const clear2 = formData.get("image2Clear") === "true";
    const clear3 = formData.get("image3Clear") === "true";

    let image1Url = clear1 ? "" : str(formData, "image1Url");
    let image2Url = clear2 ? "" : str(formData, "image2Url");
    let image3Url = clear3 ? "" : str(formData, "image3Url");

    const f1 = formData.get("image1");
    const f2 = formData.get("image2");
    const f3 = formData.get("image3");

    if (f1 instanceof File && f1.size > 0) {
      try {
        image1Url = await saveUploadedAdminImage(f1, {
          storageFolder: "why-choose-us",
          idPrefix: "top-left",
        });
      } catch (err) {
        console.error("WhyChooseUs image1 upload error:", err);
      }
    } else if (!clear1 && prev?.image1Url) image1Url = String(prev.image1Url);

    if (f2 instanceof File && f2.size > 0) {
      try {
        image2Url = await saveUploadedAdminImage(f2, {
          storageFolder: "why-choose-us",
          idPrefix: "bottom-left",
        });
      } catch (err) {
        console.error("WhyChooseUs image2 upload error:", err);
      }
    } else if (!clear2 && prev?.image2Url) image2Url = String(prev.image2Url);

    if (f3 instanceof File && f3.size > 0) {
      try {
        image3Url = await saveUploadedAdminImage(f3, {
          storageFolder: "why-choose-us",
          idPrefix: "right",
        });
      } catch (err) {
        console.error("WhyChooseUs image3 upload error:", err);
      }
    } else if (!clear3 && prev?.image3Url) image3Url = String(prev.image3Url);

    const sectionTitle = str(formData, "sectionTitle");
    const sectionDescription = str(formData, "sectionDescription");
    const descWords = countWordsFromHtml(sectionDescription);
    if (descWords > WHY_CHOOSE_US_SECTION_DESCRIPTION_MAX_WORDS) {
      return {
        error: `Description must be at most ${WHY_CHOOSE_US_SECTION_DESCRIPTION_MAX_WORDS} words (currently ${descWords}).`,
      };
    }
    const metaTitle = str(formData, "metaTitle");
    const metaDescription = str(formData, "metaDescription");
    const displayTitle = sectionTitle || "We Make Our customers happy by giving Best services.";
    const seoErr = validateEffectiveSeoBundle({
      metaTitle,
      metaDescription,
      fallbackTitle: displayTitle,
      fallbackDescription: sectionDescription,
    });
    if (seoErr) return { error: seoErr };

    const payload = {
      sectionSubtitle: str(formData, "sectionSubtitle") || "Why Choose Us",
      sectionTitle: displayTitle,
      sectionDescription,
      ctaText: str(formData, "ctaText") || "See How We Work",
      ctaLink: str(formData, "ctaLink") || "/#how-we-work",
      image1Url,
      image2Url,
      image3Url,
      image1Alt: str(formData, "image1Alt"),
      image2Alt: str(formData, "image2Alt"),
      image3Alt: str(formData, "image3Alt"),
      metaTitle: tidyOneLine(metaTitle) || displayTitle,
      metaDescription: tidyOneLine(metaDescription) || sectionDescription,
      metaKeywords: finalizeMetaKeywordsStorage(str(formData, "metaKeywords")),
      isEnabled: bool(formData, "isEnabled"),
    };

    await WhyChooseUsSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
    await recordAdminAudit({
      action: "UPDATE_WHY_CHOOSE_US_SECTION",
      resource: "why-choose-us",
      metadata: { title: payload.sectionTitle },
    });
    try {
      revalidatePath("/");
      revalidatePath("/admin/homepage");
    } catch (e) {
      console.warn("revalidatePath after saveWhyChooseUsSettings:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("saveWhyChooseUsSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save Why Choose Us section.",
    };
  }
}
