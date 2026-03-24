import {
  getPublishedPages,
  getSiteSettings,
  type SiteSettingsData,
} from "@/lib/admin-data";

const emptySiteSettings: SiteSettingsData = {
  _id: "",
  siteName: "",
  logoText: "",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "",
  phone: "",
  address: "",
  mapEmbedUrl: "",
  footerText: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
};

export async function loadPreviewShell() {
  const [raw, dynamicPages] = await Promise.all([getSiteSettings(), getPublishedPages()]);
  return {
    siteSettings: raw ?? emptySiteSettings,
    dynamicPages: dynamicPages.map((p) => ({ title: p.title, slug: p.slug })),
  };
}
