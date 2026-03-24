"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
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

    if (kind === "privacy") {
      await LegalPageContent.findOneAndUpdate(
        {},
        {
          $set: {
            privacyPolicyHtml: str(formData, "content"),
            privacyLastUpdated: str(formData, "lastUpdated").trim(),
            privacyMetaTitle: str(formData, "metaTitle").trim(),
            privacyMetaDescription: str(formData, "metaDescription").trim(),
            privacyMetaKeywords: str(formData, "metaKeywords").trim(),
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
            termsMetaTitle: str(formData, "metaTitle").trim(),
            termsMetaDescription: str(formData, "metaDescription").trim(),
            termsMetaKeywords: str(formData, "metaKeywords").trim(),
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
