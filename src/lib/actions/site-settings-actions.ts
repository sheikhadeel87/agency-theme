"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SaveSiteSettingsState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB for logo/favicon

export async function saveSiteSettings(
  formData: FormData
): Promise<SaveSiteSettingsState> {
  try {
    await dbConnect();

    const existing = await SiteSettings.findOne().lean();
    let logoUrl = str(formData, "logoUrl");
    let faviconUrl = str(formData, "faviconUrl");

    const logoFile = formData.get("logo");
    if (logoFile instanceof File && logoFile.size > 0) {
      try {
        logoUrl = await saveUploadedAdminImage(logoFile, {
          storageFolder: "site",
          idPrefix: "logo",
          maxBytes: MAX_IMAGE_BYTES,
          allowSvgAndIco: true,
        });
      } catch (err) {
        console.error("Logo upload error:", err);
      }
    } else if (existing && (existing as { logoUrl?: string }).logoUrl) {
      logoUrl = (existing as { logoUrl: string }).logoUrl;
    }

    const faviconFile = formData.get("favicon");
    if (faviconFile instanceof File && faviconFile.size > 0) {
      try {
        faviconUrl = await saveUploadedAdminImage(faviconFile, {
          storageFolder: "site",
          idPrefix: "favicon",
          maxBytes: MAX_IMAGE_BYTES,
          allowSvgAndIco: true,
        });
      } catch (err) {
        console.error("Favicon upload error:", err);
      }
    } else if (existing && (existing as { faviconUrl?: string }).faviconUrl) {
      faviconUrl = (existing as { faviconUrl: string }).faviconUrl;
    }

    const payload = {
      siteName: str(formData, "siteName"),
      logoText: str(formData, "logoText"),
      logoUrl,
      faviconUrl,
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

    try {
      revalidatePath("/");
      revalidatePath("/admin/site-settings");
    } catch (e) {
      console.warn("revalidatePath after saveSiteSettings:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("saveSiteSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save site settings.",
    };
  }
}

export type SaveContactSettingsState = {
  success?: boolean;
  error?: string;
};

/** Update only contact & map fields (for Contact admin page) */
export async function saveContactSettings(
  formData: FormData
): Promise<SaveContactSettingsState> {
  try {
    await dbConnect();

    const payload = {
      contactEmail: str(formData, "contactEmail"),
      phone: str(formData, "phone"),
      address: str(formData, "address"),
      mapEmbedUrl: str(formData, "mapEmbedUrl"),
    };

    await SiteSettings.findOneAndUpdate(
      {},
      { $set: payload },
      { upsert: true, new: true }
    );

    try {
      revalidatePath("/");
      revalidatePath("/admin/contact");
    } catch (revalErr) {
      console.warn("revalidatePath after saveContactSettings:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("saveContactSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save contact settings.",
    };
  }
}
