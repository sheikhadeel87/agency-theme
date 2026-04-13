"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import {
  CONTACT_PHONE_INVALID_MESSAGE,
  isValidContactPhone,
} from "@/lib/contact-phone";
import { validateSiteSocialLinks } from "@/lib/social-link-validation";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SaveSiteSettingsState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
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

    const socialLinks = {
      facebook: str(formData, "facebook"),
      twitter: str(formData, "twitter"),
      linkedin: str(formData, "linkedin"),
      instagram: str(formData, "instagram"),
    };
    const socialErr = validateSiteSocialLinks(socialLinks);
    if (socialErr) {
      return { error: socialErr };
    }

    const phone = str(formData, "phone");
    if (phone && !isValidContactPhone(phone)) {
      return { error: CONTACT_PHONE_INVALID_MESSAGE };
    }

    const payload = {
      siteName: str(formData, "siteName"),
      logoText: str(formData, "logoText"),
      logoUrl,
      faviconUrl,
      contactEmail: str(formData, "contactEmail"),
      phone,
      address: str(formData, "address"),
      mapEmbedUrl: str(formData, "mapEmbedUrl"),
      contactSectionTitle: str(formData, "contactSectionTitle"),
      contactSectionDescription: str(formData, "contactSectionDescription"),
      footerText: str(formData, "footerText"),
      privacyPolicyUrl: str(formData, "privacyPolicyUrl"),
      termsUrl: str(formData, "termsUrl"),
      socialLinks,
      servicesSectionEnabled: bool(formData, "servicesSectionEnabled"),
      portfolioSectionEnabled: bool(formData, "portfolioSectionEnabled"),
      blogSectionEnabled: bool(formData, "blogSectionEnabled"),
      contactSectionEnabled: bool(formData, "contactSectionEnabled"),
      featuresHighlightsSectionEnabled: bool(formData, "featuresHighlightsSectionEnabled"),
    };

    await SiteSettings.findOneAndUpdate(
      {},
      { $set: payload },
      { upsert: true, new: true }
    );

    try {
      revalidatePath("/");
      revalidatePath("/admin/site-settings");
      revalidatePath("/blog");
      revalidatePath("/pricing");
    } catch (e) {
      console.warn("revalidatePath after saveSiteSettings:", e);
    }
    await recordAdminAudit({
      action: "UPDATE_SITE_SETTINGS",
      resource: "site-settings",
      metadata: { siteName: payload.siteName },
    });
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

    const phone = str(formData, "phone");
    if (phone && !isValidContactPhone(phone)) {
      return { error: CONTACT_PHONE_INVALID_MESSAGE };
    }

    const payload = {
      contactEmail: str(formData, "contactEmail"),
      phone,
      address: str(formData, "address"),
      mapEmbedUrl: str(formData, "mapEmbedUrl"),
      contactSectionTitle: str(formData, "contactSectionTitle"),
      contactSectionDescription: str(formData, "contactSectionDescription"),
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
    await recordAdminAudit({
      action: "UPDATE_CONTACT_SETTINGS",
      resource: "site-settings",
      metadata: {
        fields: [
          "contactEmail",
          "phone",
          "address",
          "mapEmbedUrl",
          "contactSectionTitle",
          "contactSectionDescription",
        ],
      },
    });
    return { success: true };
  } catch (e) {
    console.error("saveContactSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save contact settings.",
    };
  }
}

export type HomepageSectionModule = "services" | "portfolio" | "blog";

const SECTION_LIVE_FLAG = {
  services: "servicesSectionEnabled",
  portfolio: "portfolioSectionEnabled",
  blog: "blogSectionEnabled",
} as const satisfies Record<HomepageSectionModule, string>;

/** Toggle homepage + nav visibility for services, portfolio, or blog (same fields as Site Settings). */
export async function setHomepageSectionLiveEnabled(
  module: HomepageSectionModule,
  enabled: boolean
): Promise<SaveSiteSettingsState> {
  try {
    await dbConnect();
    const field = SECTION_LIVE_FLAG[module];
    await SiteSettings.findOneAndUpdate(
      {},
      { $set: { [field]: enabled } },
      { upsert: true, new: true }
    );

    try {
      revalidatePath("/");
      revalidatePath("/admin/site-settings");
      revalidatePath("/admin/page-visibility");
      if (module === "services") revalidatePath("/admin/services");
      if (module === "portfolio") revalidatePath("/admin/portfolio");
      if (module === "blog") {
        revalidatePath("/admin/blog");
        revalidatePath("/blog");
      }
    } catch (e) {
      console.warn("revalidatePath after setHomepageSectionLiveEnabled:", e);
    }
    await recordAdminAudit({
      action: "UPDATE_HOMEPAGE_SECTION_LIVE",
      resource: "site-settings",
      resourceId: module,
      metadata: { enabled },
    });
    return { success: true };
  } catch (e) {
    console.error("setHomepageSectionLiveEnabled error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to update section visibility.",
    };
  }
}
