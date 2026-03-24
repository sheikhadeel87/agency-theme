import mongoose from "mongoose";
import type { NavChildItem, NavItem } from "@/lib/navigation";

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
  /** Homepage blocks without their own settings collection */
  servicesSectionEnabled: boolean;
  portfolioSectionEnabled: boolean;
  blogSectionEnabled: boolean;
  contactSectionEnabled: boolean;
  featuresHighlightsSectionEnabled: boolean;
  /** Primary navbar: labels, hrefs, order, optional dropdown children. */
  navigation: NavItem[];
  createdAt: Date;
  updatedAt: Date;
}

const navChildSchema = new mongoose.Schema<NavChildItem>(
  {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { _id: false }
);

const navItemSchema = new mongoose.Schema<NavItem>(
  {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
    appendDynamicPages: { type: Boolean, default: false },
    children: { type: [navChildSchema], default: undefined },
  },
  { _id: false }
);

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
    servicesSectionEnabled: { type: Boolean, default: true },
    portfolioSectionEnabled: { type: Boolean, default: true },
    blogSectionEnabled: { type: Boolean, default: true },
    contactSectionEnabled: { type: Boolean, default: true },
    featuresHighlightsSectionEnabled: { type: Boolean, default: true },
    navigation: { type: [navItemSchema], default: () => [] },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);
