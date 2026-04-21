/**
 * Server-side data layer for admin pages.
 * Replace with real DB calls (e.g. mongoose) when ready.
 */

import { sanitizePlanPrice } from "@/lib/pricing-display";
import type { FooterColumn } from "@/lib/footer-links";
import { mapDocFooterColumns } from "@/lib/footer-links";
import type { NavItem } from "@/lib/navigation";
import type { FeatureHighlightCard } from "@/lib/features-highlights-defaults";
import { normalizeFeatureHighlightCards } from "@/lib/features-highlights-defaults";
import {
  buildNavSectionVisibility,
  type NavSectionVisibility,
} from "@/lib/nav-section-visibility";

export type { NavChildItem, NavItem, PublicNavEntry } from "@/lib/navigation";
export type { NavSectionVisibility };
export { buildNavSectionVisibility };

/** Missing or non-false counts as enabled (legacy documents without the field). */
export function cmsEnabled(value: unknown): boolean {
  return value !== false;
}

export type DashboardModule = {
  title: string;
  href: string;
  icon:
    | "Settings"
    | "Home"
    | "Briefcase"
    | "ImageIcon"
    | "Users"
    | "FileText"
    | "FileStack"
    | "Scale"
    | "MapPin"
    | "DollarSign"
    | "Inbox"
    | "Mail"
    | "Send"
    | "BarChart3"
    | "Eye";
};

export type ServiceItem = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: "Published" | "Draft";
  featuredOnHomepage: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

export type PortfolioProject = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  client: string;
  categories: string[];
  technologyStack: string[];
  imageUrl: string;
  galleryImages: string[];
  projectUrl: string;
  status: "Draft" | "Published";
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  featuredOnHomepage: boolean;
};

export type TeamMember = {
  _id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
  featuredOnHomepage: boolean;
};

export type TeamSettingsData = {
  sectionTitle: string;
  sectionDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
};

export type WhyChooseUsSettingsData = {
  sectionSubtitle: string;
  sectionTitle: string;
  sectionDescription: string;
  ctaText: string;
  ctaLink: string;
  image1Url: string;
  image2Url: string;
  image3Url: string;
  image1Alt: string;
  image2Alt: string;
  image3Alt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
};

export type TestimonialsSettingsData = {
  sectionTitle: string;
  sectionDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
};

export type { FeatureHighlightCard } from "@/lib/features-highlights-defaults";

export type FeaturesHighlightsSettingsData = {
  items: FeatureHighlightCard[];
};

export type TestimonialItem = {
  _id: string;
  quote: string;
  authorName: string;
  designation: string;
  brandName: string;
  imageUrl: string;
  order: number;
};

export type PricingSettingsData = {
  sectionTitle: string;
  sectionDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
};

export type PricingPlanItem = {
  _id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  periodLabel: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  features: string[];
  footnote: string;
  featured: boolean;
  featuredOnHomepage: boolean;
  order: number;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  imageUrl: string;
  is_featured: boolean;
  is_published: boolean;
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
};

export type DynamicPage = {
  _id: string;
  title: string;
  slug: string;
  template: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: "draft" | "published";
  isEnabled: boolean;
};

export type SettingsSection = {
  title: string;
  description: string;
  actionHref: string;
};

export type SiteSettingsData = {
  _id: string;
  /** Persisted footer columns; empty array means “use defaults” on the public site until first save. */
  footerColumns: FooterColumn[];
  siteName: string;
  logoText: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  mapEmbedUrl: string;
  contactSectionTitle: string;
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
  servicesSectionEnabled: boolean;
  portfolioSectionEnabled: boolean;
  blogSectionEnabled: boolean;
  contactSectionEnabled: boolean;
  featuresHighlightsSectionEnabled: boolean;
  navigation: NavItem[];
};

export type { FooterColumn } from "@/lib/footer-links";

export type HeroData = {
  _id: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  badgeText: string;
  phoneText: string;
  isEnabled: boolean;
};

export type HomepageSection = {
  title: string;
  description: string;
  /** Admin route for the Homepage dashboard “Edit” link. */
  actionHref: string;
  /** Button label; defaults to `"Edit"` (Hero uses `"Edit Hero"`). */
  actionLabel?: string;
};

export type LegalSection = {
  title: string;
  description: string;
  actionHref: string;
};

export type LegalPageContentData = {
  /** ISO timestamp for remounting admin editors after save. */
  updatedAtIso: string;
  privacyPolicyHtml: string;
  privacyLastUpdated: string;
  privacyMetaTitle: string;
  privacyMetaDescription: string;
  privacyMetaKeywords: string;
  termsConditionsHtml: string;
  termsLastUpdated: string;
  termsMetaTitle: string;
  termsMetaDescription: string;
  termsMetaKeywords: string;
};

/** Dashboard: list of admin modules (no DB yet) */
export async function getDashboardModules(): Promise<DashboardModule[]> {
  return [
    { title: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    { title: "Page visibility", href: "/admin/page-visibility", icon: "Eye" },
    { title: "Site Settings", href: "/admin/site-settings", icon: "Settings" },
    { title: "Homepage", href: "/admin/homepage", icon: "Home" },
    { title: "Services", href: "/admin/services", icon: "Briefcase" },
    { title: "Portfolio", href: "/admin/portfolio", icon: "ImageIcon" },
    { title: "Team", href: "/admin/team", icon: "Users" },
    { title: "Blog", href: "/admin/blog", icon: "FileText" },
    { title: "Contact & Map", href: "/admin/contact", icon: "MapPin" },
    { title: "Contact messages", href: "/admin/contact-messages", icon: "Inbox" },
    { title: "Newsletter", href: "/admin/newsletter", icon: "Mail" },
    { title: "Send newsletter", href: "/admin/newsletter/send", icon: "Send" },
    { title: "Pricing", href: "/admin/pricing", icon: "DollarSign" },
    { title: "Pages", href: "/admin/pages", icon: "FileStack" },
    { title: "Legal", href: "/admin/legal", icon: "Scale" },
  ];
}

function mapServiceDoc(doc: {
  _id: unknown;
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  featuredOnHomepage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}) {
  return {
    _id: String(doc._id),
    title: doc.title ?? "",
    slug: doc.slug ?? "",
    description: doc.description ?? "",
    imageUrl: doc.imageUrl ?? "",
    status: (doc.status === "Published" ? "Published" : "Draft") as "Published" | "Draft",
    featuredOnHomepage: Boolean(doc.featuredOnHomepage),
    metaTitle: doc.metaTitle ?? "",
    metaDescription: doc.metaDescription ?? "",
    metaKeywords: doc.metaKeywords ?? "",
  };
}

/** Services list from MongoDB */
export async function getServices(): Promise<ServiceItem[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");

  await dbConnect();

  const docs = await Service.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => mapServiceDoc(doc));
}

/** Single service by id */
export async function getServiceById(id: string): Promise<ServiceItem | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");
  const { isValidObjectId } = await import("mongoose");

  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();

  const doc = await Service.findById(id).lean();
  if (!doc) return null;
  return mapServiceDoc(doc);
}

/** Published service by URL slug (public detail page). */
export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const s = slug?.trim();
  if (!s) return null;
  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");
  await dbConnect();
  const doc = await Service.findOne({ slug: s, status: "Published" }).lean();
  if (!doc) return null;
  return mapServiceDoc(doc);
}

/**
 * Published service from a URL segment: match `slug` first, then Mongo `_id`
 * (legacy rows may have an empty slug — homepage still links via id).
 */
export async function getPublishedServiceBySlugOrId(param: string): Promise<ServiceItem | null> {
  const raw = param?.trim();
  if (!raw) return null;
  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");
  const { isValidObjectId } = await import("mongoose");
  await dbConnect();

  const bySlug = await Service.findOne({ slug: raw, status: "Published" }).lean();
  if (bySlug) return mapServiceDoc(bySlug);

  if (isValidObjectId(raw)) {
    const byId = await Service.findOne({ _id: raw, status: "Published" }).lean();
    if (byId) return mapServiceDoc(byId);
  }
  return null;
}

/** All published services (newest first) for `/services` archive. */
export async function getPublishedServices(): Promise<ServiceItem[]> {
  const site = await getSiteSettings();
  if (!cmsEnabled(site?.servicesSectionEnabled)) return [];

  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");
  await dbConnect();
  const docs = await Service.find({ status: "Published" }).sort({ updatedAt: -1 }).lean();
  return docs.map((d) => mapServiceDoc(d));
}

/**
 * Services for the homepage section: max 3 published.
 * Prefers items with featuredOnHomepage (newest first), then fills with latest published.
 */
export async function getHomepageServices(): Promise<ServiceItem[]> {
  const site = await getSiteSettings();
  if (!cmsEnabled(site?.servicesSectionEnabled)) return [];

  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");
  await dbConnect();

  const featured = await Service.find({ status: "Published", featuredOnHomepage: true })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  const picked = featured.map((d) => mapServiceDoc(d));
  const excludeIds = featured.map((d) => d._id);

  if (picked.length < 3) {
    const rest = await Service.find({
      status: "Published",
      ...(excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}),
    })
      .sort({ updatedAt: -1 })
      .limit(3 - picked.length)
      .lean();
    picked.push(...rest.map((d) => mapServiceDoc(d)));
  }

  return picked;
}

function mapPortfolioDoc(doc: {
  _id: unknown;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  client?: string;
  categories?: string[];
  technologyStack?: string[];
  imageUrl?: string;
  galleryImages?: string[];
  projectUrl?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  featuredOnHomepage?: boolean;
}) {
  return {
    _id: String(doc._id),
    title: doc.title ?? "",
    slug: doc.slug ?? "",
    shortDescription: doc.shortDescription ?? "",
    fullDescription: doc.fullDescription ?? "",
    client: doc.client ?? "",
    categories: Array.isArray(doc.categories) ? doc.categories : [],
    technologyStack: Array.isArray(doc.technologyStack) ? doc.technologyStack : [],
    imageUrl: doc.imageUrl ?? "",
    galleryImages: Array.isArray(doc.galleryImages) ? doc.galleryImages : [],
    projectUrl: doc.projectUrl ?? "",
    status: (doc.status === "Published" ? "Published" : "Draft") as "Draft" | "Published",
    metaTitle: doc.metaTitle ?? "",
    metaDescription: doc.metaDescription ?? "",
    metaKeywords: doc.metaKeywords ?? "",
    featuredOnHomepage: Boolean(doc.featuredOnHomepage),
  };
}

/** Portfolio projects from MongoDB */
export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Portfolio } = await import("@/models/Portfolio");

  await dbConnect();

  const docs = await Portfolio.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => mapPortfolioDoc(doc));
}

/** Single portfolio project by id */
export async function getPortfolioProjectById(
  id: string
): Promise<PortfolioProject | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Portfolio } = await import("@/models/Portfolio");
  const { isValidObjectId } = await import("mongoose");

  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();

  const doc = await Portfolio.findById(id).lean();
  if (!doc) return null;
  return mapPortfolioDoc(doc);
}

/** Single portfolio project by slug */
export async function getPortfolioProjectBySlug(
  slug: string
): Promise<PortfolioProject | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Portfolio } = await import("@/models/Portfolio");

  if (!slug?.trim()) return null;
  await dbConnect();

  const doc = await Portfolio.findOne({ slug: slug.trim() }).lean();
  if (!doc) return null;
  return mapPortfolioDoc(doc);
}

/**
 * Up to 3 published portfolio projects for the homepage: featured first (newest), then backfill.
 */
export async function getHomepagePortfolioProjects(): Promise<PortfolioProject[]> {
  const site = await getSiteSettings();
  if (!cmsEnabled(site?.portfolioSectionEnabled)) return [];

  const { dbConnect } = await import("@/lib/db");
  const { Portfolio } = await import("@/models/Portfolio");
  await dbConnect();

  const featured = await Portfolio.find({ status: "Published", featuredOnHomepage: true })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  const picked = featured.map((d) => mapPortfolioDoc(d));
  const excludeIds = featured.map((d) => d._id);

  if (picked.length < 3) {
    const rest = await Portfolio.find({
      status: "Published",
      ...(excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}),
    })
      .sort({ updatedAt: -1 })
      .limit(3 - picked.length)
      .lean();
    picked.push(...rest.map((d) => mapPortfolioDoc(d)));
  }

  return picked;
}

/** All published projects for `/portfolio` archive (newest first). */
export async function getPublishedPortfolioProjects(): Promise<PortfolioProject[]> {
  if (!(await isPortfolioSectionEnabled())) return [];

  const { dbConnect } = await import("@/lib/db");
  const { Portfolio } = await import("@/models/Portfolio");
  await dbConnect();

  const docs = await Portfolio.find({ status: "Published" })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map((d) => mapPortfolioDoc(d));
}

/** Unique category labels derived from a project list (e.g. homepage subset). */
export function portfolioCategoriesFromProjects(projects: PortfolioProject[]): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    for (const c of p.categories ?? []) {
      const t = String(c).trim();
      if (t) set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Unique categories from all portfolio projects */
export async function getPortfolioCategories(): Promise<string[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Portfolio } = await import("@/models/Portfolio");

  await dbConnect();

  const list = await Portfolio.distinct("categories");
  const unique = [...new Set(list)].filter(
    (c): c is string => typeof c === "string" && c.trim() !== ""
  );
  return unique.sort((a, b) => a.localeCompare(b));
}

/** Team section settings (single doc) */
export async function getTeamSettings(): Promise<TeamSettingsData> {
  const { dbConnect } = await import("@/lib/db");
  const { TeamSettings } = await import("@/models/TeamSettings");
  await dbConnect();
  const doc = await TeamSettings.findOne().lean();
  if (!doc) {
    return {
      sectionTitle: "Meet With Our Creative Dedicated Team",
      sectionDescription: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isEnabled: true,
    };
  }
  const d = doc as { sectionTitle?: string; sectionDescription?: string; metaTitle?: string; metaDescription?: string; metaKeywords?: string; isEnabled?: boolean };
  return {
    sectionTitle: d.sectionTitle ?? "",
    sectionDescription: d.sectionDescription ?? "",
    metaTitle: d.metaTitle ?? "",
    metaDescription: d.metaDescription ?? "",
    metaKeywords: d.metaKeywords ?? "",
    isEnabled: cmsEnabled(d.isEnabled),
  };
}

/** Team members from MongoDB */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const { dbConnect } = await import("@/lib/db");
  const { TeamMember } = await import("@/models/TeamMember");
  await dbConnect();
  const docs = await TeamMember.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    _id: String((d as { _id: unknown })._id),
    name: (d as { name?: string }).name ?? "",
    slug: (d as { slug?: string }).slug ?? "",
    role: (d as { role?: string }).role ?? "",
    bio: (d as { bio?: string }).bio ?? "",
    imageUrl: (d as { imageUrl?: string }).imageUrl ?? "",
    order: (d as { order?: number }).order ?? 0,
    featuredOnHomepage: Boolean((d as { featuredOnHomepage?: boolean }).featuredOnHomepage),
  }));
}

/** Single team member by id */
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const { dbConnect } = await import("@/lib/db");
  const { TeamMember } = await import("@/models/TeamMember");
  const { isValidObjectId } = await import("mongoose");
  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();
  const doc = await TeamMember.findById(id).lean();
  if (!doc) return null;
  const d = doc as {
    _id: unknown;
    name?: string;
    slug?: string;
    role?: string;
    bio?: string;
    imageUrl?: string;
    order?: number;
    featuredOnHomepage?: boolean;
  };
  return {
    _id: String(d._id),
    name: d.name ?? "",
    slug: d.slug ?? "",
    role: d.role ?? "",
    bio: d.bio ?? "",
    imageUrl: d.imageUrl ?? "",
    order: d.order ?? 0,
    featuredOnHomepage: Boolean(d.featuredOnHomepage),
  };
}

/** Team member by URL slug (public profile). */
export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  const teamSettings = await getTeamSettings();
  if (!cmsEnabled(teamSettings.isEnabled)) return null;

  const { dbConnect } = await import("@/lib/db");
  const { TeamMember } = await import("@/models/TeamMember");
  const trimmed = slug?.trim();
  if (!trimmed) return null;
  await dbConnect();
  const doc = await TeamMember.findOne({ slug: trimmed }).lean();
  if (!doc) return null;
  const d = doc as {
    _id: unknown;
    name?: string;
    slug?: string;
    role?: string;
    bio?: string;
    imageUrl?: string;
    order?: number;
    featuredOnHomepage?: boolean;
  };
  return {
    _id: String(d._id),
    name: d.name ?? "",
    slug: d.slug ?? "",
    role: d.role ?? "",
    bio: d.bio ?? "",
    imageUrl: d.imageUrl ?? "",
    order: d.order ?? 0,
    featuredOnHomepage: Boolean(d.featuredOnHomepage),
  };
}

/** Resolve public team URL param: slug or legacy MongoDB id. */
export async function getTeamMemberBySlugOrId(param: string): Promise<TeamMember | null> {
  const raw = param?.trim();
  if (!raw) return null;

  const teamSettings = await getTeamSettings();
  if (!cmsEnabled(teamSettings.isEnabled)) return null;

  const { isValidObjectId } = await import("mongoose");
  if (isValidObjectId(raw)) {
    return getTeamMemberById(raw);
  }
  return getTeamMemberBySlug(raw);
}

/** Up to 3 team members for homepage: featured first (newest), then by display order. */
export async function getHomepageTeamMembers(): Promise<TeamMember[]> {
  const teamSettings = await getTeamSettings();
  if (!cmsEnabled(teamSettings.isEnabled)) return [];

  const { dbConnect } = await import("@/lib/db");
  const { TeamMember } = await import("@/models/TeamMember");
  await dbConnect();

  const featured = await TeamMember.find({ featuredOnHomepage: true })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  const picked = featured.map((d) => ({
    _id: String((d as { _id: unknown })._id),
    name: (d as { name?: string }).name ?? "",
    slug: (d as { slug?: string }).slug ?? "",
    role: (d as { role?: string }).role ?? "",
    bio: (d as { bio?: string }).bio ?? "",
    imageUrl: (d as { imageUrl?: string }).imageUrl ?? "",
    order: (d as { order?: number }).order ?? 0,
    featuredOnHomepage: true,
  }));
  const excludeIds = featured.map((d) => d._id);

  if (picked.length < 3) {
    const rest = await TeamMember.find(
      excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}
    )
      .sort({ order: 1 })
      .limit(3 - picked.length)
      .lean();
    picked.push(
      ...rest.map((d) => ({
        _id: String((d as { _id: unknown })._id),
        name: (d as { name?: string }).name ?? "",
        slug: (d as { slug?: string }).slug ?? "",
        role: (d as { role?: string }).role ?? "",
        bio: (d as { bio?: string }).bio ?? "",
        imageUrl: (d as { imageUrl?: string }).imageUrl ?? "",
        order: (d as { order?: number }).order ?? 0,
        featuredOnHomepage: Boolean((d as { featuredOnHomepage?: boolean }).featuredOnHomepage),
      }))
    );
  }

  return picked;
}

/** Why Choose Us section settings (single doc) */
export async function getWhyChooseUsSettings(): Promise<WhyChooseUsSettingsData> {
  const { dbConnect } = await import("@/lib/db");
  const { WhyChooseUsSettings } = await import("@/models/WhyChooseUsSettings");
  await dbConnect();
  const doc = await WhyChooseUsSettings.findOne().lean();
  if (!doc) {
    return {
      sectionSubtitle: "Why Choose Us",
      sectionTitle: "We Make Our customers happy by giving Best services.",
      sectionDescription: "",
      ctaText: "See How We Work",
      ctaLink: "/#how-we-work",
      image1Url: "",
      image2Url: "",
      image3Url: "",
      image1Alt: "",
      image2Alt: "",
      image3Alt: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isEnabled: true,
    };
  }
  const d = doc as Record<string, unknown>;
  const str = (k: string) => (d[k] != null ? String(d[k]) : "");
  return {
    sectionSubtitle: str("sectionSubtitle") || "Why Choose Us",
    sectionTitle: str("sectionTitle") || "We Make Our customers happy by giving Best services.",
    sectionDescription: str("sectionDescription"),
    ctaText: str("ctaText") || "See How We Work",
    ctaLink: str("ctaLink") || "/#how-we-work",
    image1Url: str("image1Url"),
    image2Url: str("image2Url"),
    image3Url: str("image3Url"),
    image1Alt: str("image1Alt"),
    image2Alt: str("image2Alt"),
    image3Alt: str("image3Alt"),
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    metaKeywords: str("metaKeywords"),
    isEnabled: cmsEnabled(d.isEnabled),
  };
}

/** Support section (three homepage cards at /#support), single settings doc */
export async function getFeaturesHighlightsSettings(): Promise<FeaturesHighlightsSettingsData> {
  const { dbConnect } = await import("@/lib/db");
  const { FeaturesHighlightsSettings } = await import("@/models/FeaturesHighlightsSettings");
  await dbConnect();
  const doc = await FeaturesHighlightsSettings.findOne().lean();
  if (!doc) {
    return { items: normalizeFeatureHighlightCards(undefined) };
  }
  const d = doc as { items?: unknown };
  return { items: normalizeFeatureHighlightCards(d.items) };
}

/** Testimonials section settings (single doc) */
export async function getTestimonialsSettings(): Promise<TestimonialsSettingsData> {
  const { dbConnect } = await import("@/lib/db");
  const { TestimonialsSettings } = await import("@/models/TestimonialsSettings");
  await dbConnect();
  const doc = await TestimonialsSettings.findOne().lean();
  if (!doc) {
    return {
      sectionTitle: "Client's Testimonials",
      sectionDescription: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isEnabled: true,
    };
  }
  const d = doc as Record<string, unknown>;
  const str = (k: string) => (d[k] != null ? String(d[k]) : "");
  return {
    sectionTitle: str("sectionTitle") || "Client's Testimonials",
    sectionDescription: str("sectionDescription"),
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    metaKeywords: str("metaKeywords"),
    isEnabled: cmsEnabled(d.isEnabled),
  };
}

/** Testimonials list from MongoDB (no limit — all testimonials returned) */
export async function getTestimonials(): Promise<TestimonialItem[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Testimonial } = await import("@/models/Testimonial");
  await dbConnect();
  const docs = await Testimonial.find().sort({ order: 1 }).lean();
  return docs.map((d) => ({
    _id: String((d as { _id: unknown })._id),
    quote: (d as { quote?: string }).quote ?? "",
    authorName: (d as { authorName?: string }).authorName ?? "",
    designation: (d as { designation?: string }).designation ?? "",
    brandName: (d as { brandName?: string }).brandName ?? "",
    imageUrl: (d as { imageUrl?: string }).imageUrl ?? "",
    order: (d as { order?: number }).order ?? 0,
  }));
}

/** Single testimonial by id */
export async function getTestimonialById(id: string): Promise<TestimonialItem | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Testimonial } = await import("@/models/Testimonial");
  const { isValidObjectId } = await import("mongoose");
  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();
  const doc = await Testimonial.findById(id).lean();
  if (!doc) return null;
  const d = doc as { _id: unknown; quote?: string; authorName?: string; designation?: string; brandName?: string; imageUrl?: string; order?: number };
  return {
    _id: String(d._id),
    quote: d.quote ?? "",
    authorName: d.authorName ?? "",
    designation: d.designation ?? "",
    brandName: d.brandName ?? "",
    imageUrl: d.imageUrl ?? "",
    order: d.order ?? 0,
  };
}

/** Pricing section settings (single doc) */
export async function getPricingSettings(): Promise<PricingSettingsData> {
  const { dbConnect } = await import("@/lib/db");
  const { PricingSettings } = await import("@/models/PricingSettings");
  await dbConnect();
  const doc = await PricingSettings.findOne().lean();
  if (!doc) {
    return {
      sectionTitle: "We Offer Great Affordable Premium Prices.",
      sectionDescription: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isEnabled: true,
    };
  }
  const d = doc as Record<string, unknown>;
  const str = (k: string) => (d[k] != null ? String(d[k]) : "");
  return {
    sectionTitle: str("sectionTitle") || "We Offer Great Affordable Premium Prices.",
    sectionDescription: str("sectionDescription"),
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    metaKeywords: str("metaKeywords"),
    isEnabled: cmsEnabled(d.isEnabled),
  };
}

/** Pricing plans from MongoDB, sorted by order */
export async function getPricingPlans(): Promise<PricingPlanItem[]> {
  const { dbConnect } = await import("@/lib/db");
  const { PricingPlan } = await import("@/models/PricingPlan");
  await dbConnect();
  const docs = await PricingPlan.find().sort({ order: 1 }).lean();
  return docs.map((d) => {
    const doc = d as Record<string, unknown>;
    const arr = doc.features;
    const features = Array.isArray(arr)
      ? arr.map((x) => (x != null ? String(x) : "")).filter(Boolean)
      : [];
    return {
      _id: String(doc._id),
      name: (doc.name != null ? String(doc.name) : "") || "Plan",
      priceMonthly: Number(doc.priceMonthly) || 0,
      priceAnnual: Number(doc.priceAnnual) || 0,
      periodLabel: (doc.periodLabel != null ? String(doc.periodLabel) : "") || "per month",
      subtext: (doc.subtext != null ? String(doc.subtext) : "") || "No credit card required",
      ctaText: (doc.ctaText != null ? String(doc.ctaText) : "") || "Try for free",
      ctaLink: (doc.ctaLink != null ? String(doc.ctaLink) : "") || "",
      features,
      footnote: (doc.footnote != null ? String(doc.footnote) : "") || "7-day free trial",
      featured: Boolean(doc.featured),
      featuredOnHomepage: Boolean(doc.featuredOnHomepage),
      order: Number(doc.order) || 0,
    };
  });
}

/** Single pricing plan by id */
export async function getPricingPlanById(id: string): Promise<PricingPlanItem | null> {
  const { dbConnect } = await import("@/lib/db");
  const { PricingPlan } = await import("@/models/PricingPlan");
  const { isValidObjectId } = await import("mongoose");
  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();
  const doc = await PricingPlan.findById(id).lean();
  if (!doc) return null;
  const d = doc as Record<string, unknown>;
  const arr = d.features;
  const features = Array.isArray(arr)
    ? arr.map((x) => (x != null ? String(x) : "")).filter(Boolean)
    : [];
  return {
    _id: String(d._id),
    name: (d.name != null ? String(d.name) : "") || "Plan",
    priceMonthly: sanitizePlanPrice(d.priceMonthly),
    priceAnnual: sanitizePlanPrice(d.priceAnnual),
    periodLabel: (d.periodLabel != null ? String(d.periodLabel) : "") || "per month",
    subtext: (d.subtext != null ? String(d.subtext) : "") || "No credit card required",
    ctaText: (d.ctaText != null ? String(d.ctaText) : "") || "Try for free",
    ctaLink: (d.ctaLink != null ? String(d.ctaLink) : "") || "",
    features,
    footnote: (d.footnote != null ? String(d.footnote) : "") || "7-day free trial",
    featured: Boolean(d.featured),
    featuredOnHomepage: Boolean(d.featuredOnHomepage),
    order: Number(d.order) || 0,
  };
}

/** Up to 3 pricing plans for homepage: “show on homepage” first by order, then fill by order. */
export async function getHomepagePricingPlans(): Promise<PricingPlanItem[]> {
  const pricingSettings = await getPricingSettings();
  if (!cmsEnabled(pricingSettings.isEnabled)) return [];

  const { dbConnect } = await import("@/lib/db");
  const { PricingPlan } = await import("@/models/PricingPlan");
  await dbConnect();

  const featured = await PricingPlan.find({ featuredOnHomepage: true })
    .sort({ order: 1, updatedAt: -1 })
    .limit(3)
    .lean();

  const mapPlan = (d: Record<string, unknown>): PricingPlanItem => {
    const arr = d.features;
    const features = Array.isArray(arr)
      ? arr.map((x) => (x != null ? String(x) : "")).filter(Boolean)
      : [];
    return {
      _id: String(d._id),
      name: (d.name != null ? String(d.name) : "") || "Plan",
      priceMonthly: sanitizePlanPrice(d.priceMonthly),
      priceAnnual: sanitizePlanPrice(d.priceAnnual),
      periodLabel: (d.periodLabel != null ? String(d.periodLabel) : "") || "per month",
      subtext: (d.subtext != null ? String(d.subtext) : "") || "No credit card required",
      ctaText: (d.ctaText != null ? String(d.ctaText) : "") || "Try for free",
      ctaLink: (d.ctaLink != null ? String(d.ctaLink) : "") || "",
      features,
      footnote: (d.footnote != null ? String(d.footnote) : "") || "7-day free trial",
      featured: Boolean(d.featured),
      featuredOnHomepage: Boolean(d.featuredOnHomepage),
      order: Number(d.order) || 0,
    };
  };

  const picked = featured.map((d) => mapPlan(d as Record<string, unknown>));
  const excludeIds = featured.map((d) => d._id);

  if (picked.length < 3) {
    const rest = await PricingPlan.find(
      excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}
    )
      .sort({ order: 1, updatedAt: -1 })
      .limit(3 - picked.length)
      .lean();
    picked.push(...rest.map((d) => mapPlan(d as Record<string, unknown>)));
  }

  return picked;
}

function mapBlogDoc(doc: {
  _id: unknown;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  author?: string;
  imageUrl?: string;
  is_featured?: boolean;
  is_published?: boolean;
  publishedAt?: Date | null;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: String(doc._id),
    title: doc.title ?? "",
    slug: doc.slug ?? "",
    description: doc.description ?? "",
    content: doc.content ?? "",
    author: doc.author ?? "",
    imageUrl: doc.imageUrl ?? "",
    is_featured: Boolean(doc.is_featured),
    is_published: Boolean(doc.is_published),
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    metaTitle: doc.metaTitle ?? "",
    metaDescription: doc.metaDescription ?? "",
    metaKeywords: doc.metaKeywords ?? "",
    ogImage: doc.ogImage ?? "",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : "",
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : "",
  };
}

/** Blog posts from MongoDB */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Blog } = await import("@/models/Blog");

  await dbConnect();

  const docs = await Blog.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => mapBlogDoc(doc));
}

/**
 * Up to 3 published posts for homepage: is_featured first (newest), then latest published.
 */
export async function getHomepageBlogPosts(): Promise<BlogPost[]> {
  const site = await getSiteSettings();
  if (!cmsEnabled(site?.blogSectionEnabled)) return [];

  const { dbConnect } = await import("@/lib/db");
  const { Blog } = await import("@/models/Blog");
  await dbConnect();

  const featured = await Blog.find({ is_published: true, is_featured: true })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  const picked = featured.map((d) => mapBlogDoc(d));
  const excludeIds = featured.map((d) => d._id);

  if (picked.length < 3) {
    const rest = await Blog.find({
      is_published: true,
      ...(excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {}),
    })
      .sort({ updatedAt: -1 })
      .limit(3 - picked.length)
      .lean();
    picked.push(...rest.map((d) => mapBlogDoc(d)));
  }

  return picked;
}

/** All published posts for /blog archive (newest first). */
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Blog } = await import("@/models/Blog");
  await dbConnect();

  const docs = await Blog.find({ is_published: true })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .lean();
  return docs.map((doc) => mapBlogDoc(doc));
}

/** Single blog post by id */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Blog } = await import("@/models/Blog");
  const { isValidObjectId } = await import("mongoose");

  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();

  const doc = await Blog.findById(id).lean();
  if (!doc) return null;
  return mapBlogDoc(doc);
}

/** Single blog post by slug */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Blog } = await import("@/models/Blog");

  if (!slug?.trim()) return null;
  await dbConnect();

  const doc = await Blog.findOne({ slug: slug.trim() }).lean();
  if (!doc) return null;
  return mapBlogDoc(doc);
}

function mapPageDoc(doc: Record<string, unknown>): DynamicPage {
  const status = doc.status === "published" ? "published" : "draft";
  return {
    _id: String(doc._id),
    title: (doc.title != null ? String(doc.title) : "") || "Untitled",
    slug: (doc.slug != null ? String(doc.slug) : "") || "",
    template: (doc.template != null ? String(doc.template) : "") || "Default",
    content: (doc.content != null ? String(doc.content) : "") || "",
    metaTitle: (doc.metaTitle != null ? String(doc.metaTitle) : "") || "",
    metaDescription: (doc.metaDescription != null ? String(doc.metaDescription) : "") || "",
    metaKeywords: (doc.metaKeywords != null ? String(doc.metaKeywords) : "") || "",
    status,
    isEnabled: cmsEnabled(doc.isEnabled),
  };
}

/** Dynamic pages from MongoDB (all, for admin list) */
export async function getDynamicPages(): Promise<DynamicPage[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Page } = await import("@/models/Page");
  await dbConnect();
  const docs = await Page.find().sort({ updatedAt: -1 }).lean();
  return docs.map((d) => mapPageDoc(d as Record<string, unknown>));
}

/**
 * Published CMS pages for the live site (header “Pages” dropdown, etc.).
 * Excludes drafts and pages with `isEnabled === false` after `mapPageDoc` normalization.
 */
export async function getPublishedPages(): Promise<DynamicPage[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Page } = await import("@/models/Page");
  await dbConnect();
  const docs = await Page.find({ status: "published" }).sort({ updatedAt: -1 }).lean();
  return docs
    .map((d) => mapPageDoc(d as Record<string, unknown>))
    .filter((p) => p.isEnabled === true);
}

/** Single page by id (for admin edit) */
export async function getPageById(id: string): Promise<DynamicPage | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Page } = await import("@/models/Page");
  const { isValidObjectId } = await import("mongoose");
  if (!id || !isValidObjectId(id)) return null;
  await dbConnect();
  const doc = await Page.findById(id).lean();
  if (!doc) return null;
  return mapPageDoc(doc as Record<string, unknown>);
}

/** Single page by slug (for public route; only published) */
export async function getPageBySlug(slug: string): Promise<DynamicPage | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Page } = await import("@/models/Page");
  if (!slug?.trim()) return null;
  await dbConnect();
  const doc = await Page.findOne({ slug: slug.trim(), status: "published" }).lean();
  if (!doc) return null;
  const page = mapPageDoc(doc as Record<string, unknown>);
  if (!page.isEnabled) return null;
  return page;
}

/** Site settings sections (links to edit page) */
export function getSiteSettingsSections(): SettingsSection[] {
  return [
    { title: "Branding", description: "Manage logo, favicon, and site name.", actionHref: "/admin/site-settings/edit" },
    { title: "Contact Info", description: "Manage email, phone, and address shown on the site.", actionHref: "/admin/site-settings/edit" },
    { title: "Social Links", description: "Manage social media profiles displayed on the website.", actionHref: "/admin/site-settings/edit" },
    { title: "Footer & Legal", description: "Footer blurb, newsletter, and custom legal URLs in Site Settings edit.", actionHref: "/admin/site-settings/edit" },
    { title: "Footer links", description: "Column titles, link labels, URLs, order, and tie-ins to page visibility.", actionHref: "/admin/site-settings/footer" },
    { title: "Navigation", description: "Drag-and-drop menu, labels, links, and dropdowns for the site header.", actionHref: "/admin/site-settings/navigation" },
  ];
}

/** Single global site settings document from MongoDB */
export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  const { dbConnect } = await import("@/lib/db");
  const { SiteSettings } = await import("@/models/SiteSettings");

  await dbConnect();

  const doc = await SiteSettings.findOne().lean();
  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  const { mapDocNavigation, getDefaultNavigation } = await import("@/lib/navigation");
  const rawNav = d.navigation;
  const navigation =
    Array.isArray(rawNav) && rawNav.length > 0
      ? mapDocNavigation(rawNav)
      : getDefaultNavigation();

  return {
    _id: String(doc._id),
    footerColumns: mapDocFooterColumns(d.footerColumns),
    siteName: doc.siteName ?? "",
    logoText: doc.logoText ?? "",
    logoUrl: doc.logoUrl ?? "",
    faviconUrl: doc.faviconUrl ?? "",
    contactEmail: doc.contactEmail ?? "",
    phone: doc.phone ?? "",
    address: doc.address ?? "",
    mapEmbedUrl: doc.mapEmbedUrl ?? "",
    contactSectionTitle: doc.contactSectionTitle ?? "",
    contactSectionDescription: doc.contactSectionDescription ?? "",
    footerText: doc.footerText ?? "",
    privacyPolicyUrl: doc.privacyPolicyUrl ?? "",
    termsUrl: doc.termsUrl ?? "",
    socialLinks: {
      facebook: doc.socialLinks?.facebook ?? "",
      twitter: doc.socialLinks?.twitter ?? "",
      linkedin: doc.socialLinks?.linkedin ?? "",
      instagram: doc.socialLinks?.instagram ?? "",
    },
    servicesSectionEnabled: cmsEnabled(d.servicesSectionEnabled),
    portfolioSectionEnabled: cmsEnabled(d.portfolioSectionEnabled),
    blogSectionEnabled: cmsEnabled(d.blogSectionEnabled),
    contactSectionEnabled: cmsEnabled(d.contactSectionEnabled),
    featuresHighlightsSectionEnabled: cmsEnabled(d.featuresHighlightsSectionEnabled),
    navigation,
  };
}

/** Single hero document from MongoDB */
export async function getHeroData(): Promise<HeroData | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Hero } = await import("@/models/Hero");

  await dbConnect();

  const doc = await Hero.findOne().lean();
  if (!doc) return null;

  const h = doc as Record<string, unknown>;
  return {
    _id: String(doc._id),
    heading: doc.heading ?? "",
    description: doc.description ?? "",
    ctaText: doc.ctaText ?? "",
    ctaLink: doc.ctaLink ?? "",
    badgeText: doc.badgeText ?? "",
    phoneText: doc.phoneText ?? "",
    isEnabled: cmsEnabled(h.isEnabled),
  };
}

/** Homepage sections + nav payload — used by `/` and site-settings preview only. */
export async function getHomepageViewBundle() {
  const [
    services,
    siteSettings,
    hero,
    portfolio,
    blogPosts,
    teamSettings,
    teamMembers,
    whyChooseUsSettings,
    featuresHighlightsSettings,
    testimonialsSettings,
    testimonials,
    pricingSettings,
    pricingPlans,
    dynamicPages,
  ] = await Promise.all([
    getHomepageServices(),
    getSiteSettings(),
    getHeroData(),
    getHomepagePortfolioProjects(),
    getHomepageBlogPosts(),
    getTeamSettings(),
    getHomepageTeamMembers(),
    getWhyChooseUsSettings(),
    getFeaturesHighlightsSettings(),
    getTestimonialsSettings(),
    getTestimonials(),
    getPricingSettings(),
    getHomepagePricingPlans(),
    getPublishedPages(),
  ]);

  return {
    services,
    siteSettings,
    hero,
    portfolio,
    blogPosts,
    teamSettings,
    teamMembers,
    whyChooseUsSettings,
    featuresHighlightsSettings,
    testimonialsSettings,
    testimonials,
    pricingSettings,
    pricingPlans,
    dynamicPages: dynamicPages.map((p) => ({ title: p.title, slug: p.slug })),
    portfolioCategories: portfolioCategoriesFromProjects(portfolio),
  };
}

export type HomepageViewBundle = Awaited<ReturnType<typeof getHomepageViewBundle>>;

export async function getNavSectionVisibility(): Promise<NavSectionVisibility> {
  const [siteSettings, hero, teamSettings, whyChooseUs, pricing, testimonials] = await Promise.all([
    getSiteSettings(),
    getHeroData(),
    getTeamSettings(),
    getWhyChooseUsSettings(),
    getPricingSettings(),
    getTestimonialsSettings(),
  ]);
  return buildNavSectionVisibility({
    siteSettings,
    hero,
    teamSettings,
    whyChooseUs,
    pricing,
    testimonials,
  });
}

export async function isBlogSectionEnabled(): Promise<boolean> {
  const s = await getSiteSettings();
  return cmsEnabled(s?.blogSectionEnabled);
}

export async function isTeamSectionEnabled(): Promise<boolean> {
  const t = await getTeamSettings();
  return cmsEnabled(t.isEnabled);
}

export async function isPortfolioSectionEnabled(): Promise<boolean> {
  const s = await getSiteSettings();
  return cmsEnabled(s?.portfolioSectionEnabled);
}

export async function isServicesSectionEnabled(): Promise<boolean> {
  const s = await getSiteSettings();
  return cmsEnabled(s?.servicesSectionEnabled);
}

export async function isContactSectionEnabled(): Promise<boolean> {
  const s = await getSiteSettings();
  return cmsEnabled(s?.contactSectionEnabled);
}

export async function isPricingSectionEnabled(): Promise<boolean> {
  const p = await getPricingSettings();
  return cmsEnabled(p.isEnabled);
}

/** Homepage content sections (replace with DB/config later) */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  return [
    {
      title: "Hero Section",
      description: "Manage homepage hero content.",
      actionHref: "/admin/homepage/hero",
      actionLabel: "Edit Hero",
    },
    {
      title: "Support",
      description: "Three icon cards on the homepage (/#support).",
      actionHref: "/admin/features-highlights",
    },
    {
      title: "Why Choose Us",
      description: "Value propositions and differentiators.",
      actionHref: "/admin/why-choose-us",
    },
    {
      title: "Services",
      description: "Services preview block.",
      actionHref: "/admin/services",
    },
    {
      title: "Team",
      description: "Team section heading and layout.",
      actionHref: "/admin/team",
    },
    {
      title: "Testimonials",
      description: "Client quotes and carousel.",
      actionHref: "/admin/testimonials",
    },
    {
      title: "Blog",
      description: "Latest posts preview.",
      actionHref: "/admin/blog",
    },
    {
      title: "Contact",
      description: "Contact form and details.",
      actionHref: "/admin/contact",
    },
  ];
}

/** Legal page sections — “Edit” opens the CMS editor for each route. */
export function getLegalSections(): LegalSection[] {
  return [
    {
      title: "Privacy Policy",
      description: "Edit the privacy policy page content and last updated date.",
      actionHref: "/admin/legal/privacy-policy",
    },
    {
      title: "Terms & Conditions",
      description: "Edit the terms of service and usage conditions.",
      actionHref: "/admin/legal/terms-conditions",
    },
  ];
}

/** Singleton legal document (privacy + terms HTML and SEO). */
export async function getLegalPageContent(): Promise<LegalPageContentData> {
  const { dbConnect } = await import("@/lib/db");
  const { LegalPageContent } = await import("@/models/LegalPageContent");
  await dbConnect();
  const doc = await LegalPageContent.findOne().lean();
  const d = (doc ?? {}) as Record<string, unknown>;
  const updatedRaw = d.updatedAt;
  const updatedAtIso =
    updatedRaw instanceof Date
      ? updatedRaw.toISOString()
      : typeof updatedRaw === "string"
        ? updatedRaw
        : "";
  return {
    updatedAtIso,
    privacyPolicyHtml: String(d.privacyPolicyHtml ?? ""),
    privacyLastUpdated: String(d.privacyLastUpdated ?? ""),
    privacyMetaTitle: String(d.privacyMetaTitle ?? ""),
    privacyMetaDescription: String(d.privacyMetaDescription ?? ""),
    privacyMetaKeywords: String(d.privacyMetaKeywords ?? ""),
    termsConditionsHtml: String(d.termsConditionsHtml ?? ""),
    termsLastUpdated: String(d.termsLastUpdated ?? ""),
    termsMetaTitle: String(d.termsMetaTitle ?? ""),
    termsMetaDescription: String(d.termsMetaDescription ?? ""),
    termsMetaKeywords: String(d.termsMetaKeywords ?? ""),
  };
}
