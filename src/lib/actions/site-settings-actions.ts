"use server";

import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

export type SaveSiteSettingsState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

export async function saveSiteSettings(
  formData: FormData
): Promise<SaveSiteSettingsState> {
  try {
    await dbConnect();

    const payload = {
      siteName: str(formData, "siteName"),
      logoText: str(formData, "logoText"),
      logoUrl: str(formData, "logoUrl"),
      faviconUrl: str(formData, "faviconUrl"),
      contactEmail: str(formData, "contactEmail"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      mapEmbedUrl: str(formData, "mapEmbedUrl"),
      footerText: str(formData, "footerText"),
      privacyPolicyUrl: str(formData, "privacyPolicyUrl"),
      termsUrl: str(formData, "termsUrl"),
      socialLinks: {
        facebook: str(formData, "facebook"),
        twitter: str(formData, "twitter"),
        linkedin: str(formData, "linkedin"),
        instagram: str(formData, "instagram"),
      },
    };

    await SiteSettings.findOneAndUpdate(
      {},
      { $set: payload },
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (e) {
    console.error("saveSiteSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save site settings.",
    };
  }
}
