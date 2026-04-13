"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import {
  finalizeMetaKeywordsStorage,
  tidyOneLine,
  validateOptionalMetaFields,
} from "@/lib/seo-metadata";
import { LegalPageContent } from "@/models/LegalPageContent";

export type SaveLegalPageState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function rawStr(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}

export async function saveLegalPage(formData: FormData): Promise<SaveLegalPageState> {
  const kind = str(formData, "kind").toLowerCase();
  if (kind !== "privacy" && kind !== "terms") {
    return { error: "Invalid document type." };
  }

  try {
    await dbConnect();

    const metaTitle = str(formData, "metaTitle");
    const metaDescription = str(formData, "metaDescription");
    const metaKeywords = str(formData, "metaKeywords");
    const optErr = validateOptionalMetaFields(metaTitle, metaDescription);
    if (optErr) return { error: optErr };

    if (kind === "privacy") {
      await LegalPageContent.findOneAndUpdate(
        {},
        {
          $set: {
            privacyPolicyHtml: str(formData, "content"),
            privacyLastUpdated: str(formData, "lastUpdated").trim(),
            privacyMetaTitle: tidyOneLine(metaTitle),
            privacyMetaDescription: tidyOneLine(metaDescription),
            privacyMetaKeywords: finalizeMetaKeywordsStorage(metaKeywords),
          },
        },
        { upsert: true, new: true }
      );
    } else {
      await LegalPageContent.findOneAndUpdate(
        {},
        {
          $set: {
            termsConditionsHtml: rawStr(formData, "content"),
            termsLastUpdated: str(formData, "lastUpdated").trim(),
            termsMetaTitle: tidyOneLine(metaTitle),
            termsMetaDescription: tidyOneLine(metaDescription),
            termsMetaKeywords: finalizeMetaKeywordsStorage(metaKeywords),
          },
        },
        { upsert: true, new: true }
      );
    }

    try {
      revalidatePath("/privacy-policy");
      revalidatePath("/terms-conditions");
      revalidatePath("/admin/legal");
    } catch (e) {
      console.warn("revalidatePath after saveLegalPage:", e);
    }

    return { success: true };
  } catch (e) {
    console.error("saveLegalPage error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save legal page.",
    };
  }
}
