import mongoose from "mongoose";

export interface ISiteSettings {
  siteName: string;
  logoText: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  mapEmbedUrl: string;
  footerText: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema<ISiteSettings>(
  {
    siteName: { type: String, default: "" },
    logoText: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    footerText: { type: String, default: "" },
    privacyPolicyUrl: { type: String, default: "" },
    termsUrl: { type: String, default: "" },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);
