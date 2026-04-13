import { getPublishedPages, getSiteSettings, type SiteSettingsData } from "@/lib/admin-data";
import { getDefaultNavigation } from "@/lib/navigation";

const emptySiteSettings: SiteSettingsData = {
  _id: "",
  footerColumns: [],
  siteName: "",
  logoText: "",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "",
  phone: "",
  address: "",
  mapEmbedUrl: "",
  contactSectionTitle: "",
  contactSectionDescription: "",
  footerText: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
  servicesSectionEnabled: true,
  portfolioSectionEnabled: true,
  blogSectionEnabled: true,
  contactSectionEnabled: true,
  featuresHighlightsSectionEnabled: true,
  navigation: getDefaultNavigation(),
};

export async function loadPreviewShell() {
  const [raw, dynamicPages] = await Promise.all([getSiteSettings(), getPublishedPages()]);
  return {
    siteSettings: raw ?? emptySiteSettings,
    dynamicPages: dynamicPages.map((p) => ({ title: p.title, slug: p.slug })),
  };
}
