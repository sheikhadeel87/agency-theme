import mongoose from "mongoose";
import type { FooterColumn, FooterLinkRow } from "@/lib/footer-links";
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
  /** Homepage Contact section heading (optional; fallback in UI). */
  contactSectionTitle: string;
  /** Homepage Contact section intro under the heading. */
  contactSectionDescription: string;
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
  /** Footer link columns (titles + links). Empty → public site uses code defaults until saved. */
  footerColumns: FooterColumn[];
  createdAt: Date;
  updatedAt: Date;
}

const navChildSchema = new mongoose.Schema<NavChildItem>(
  {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
    sectionKey: { type: String, required: false },
  },
  { _id: false }
);

const footerLinkSchema = new mongoose.Schema<FooterLinkRow>(
  {
    label: { type: String, default: "" },
    href: { type: String, default: "" },
    sectionKey: { type: String, required: false },
    order: { type: Number, default: 1 },
  },
  { _id: false }
);

const footerColumnSchema = new mongoose.Schema<FooterColumn>(
  {
    title: { type: String, default: "" },
    order: { type: Number, default: 1 },
    links: { type: [footerLinkSchema], default: () => [] },
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
    contactSectionTitle: { type: String, default: "" },
    contactSectionDescription: { type: String, default: "" },
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
    footerColumns: { type: [footerColumnSchema], default: () => [] },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);
