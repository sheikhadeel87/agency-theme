/**
 * Server-side data layer for admin pages.
 * Replace with real DB calls (e.g. mongoose) when ready.
 */

export type DashboardModule = {
  title: string;
  href: string;
  icon: "Settings" | "Home" | "Briefcase" | "ImageIcon" | "Users" | "FileText" | "FileStack" | "Scale";
};

export type ServiceItem = {
  _id: string;
  title: string;
  description: string;
  status: "Published" | "Draft";
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
};

export type TeamMember = {
  name: string;
  role: string;
  image: string | null;
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
  title: string;
  slug: string;
  template: string;
};

export type SettingsSection = {
  title: string;
  description: string;
  actionHref: string;
};

export type SiteSettingsData = {
  _id: string;
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
};

export type HeroData = {
  _id: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  badgeText: string;
  phoneText: string;
};

export type HomepageSection = {
  title: string;
  description: string;
};

export type LegalSection = {
  title: string;
  description: string;
  actionHref: string;
};

/** Dashboard: list of admin modules (no DB yet) */
export async function getDashboardModules(): Promise<DashboardModule[]> {
  return [
    { title: "Site Settings", href: "/admin/site-settings", icon: "Settings" },
    { title: "Homepage", href: "/admin/homepage", icon: "Home" },
    { title: "Services", href: "/admin/services", icon: "Briefcase" },
    { title: "Portfolio", href: "/admin/portfolio", icon: "ImageIcon" },
    { title: "Team", href: "/admin/team", icon: "Users" },
    { title: "Blog", href: "/admin/blog", icon: "FileText" },
    { title: "Pages", href: "/admin/pages", icon: "FileStack" },
    { title: "Legal", href: "/admin/legal", icon: "Scale" },
  ];
}

/** Services list from MongoDB */
export async function getServices(): Promise<ServiceItem[]> {
  const { dbConnect } = await import("@/lib/db");
  const { Service } = await import("@/models/Service");

  await dbConnect();

  const docs = await Service.find().sort({ createdAt: -1 }).lean();

  return docs.map((doc) => ({
    _id: String(doc._id),
    title: doc.title,
    description: doc.description,
    status: doc.status as "Published" | "Draft",
  }));
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

/** Team members (replace with DB query later) */
export async function getTeamMembers(): Promise<TeamMember[]> {
  return [
    { name: "Alex Morgan", role: "CEO & Founder", image: null },
    { name: "Jordan Lee", role: "Creative Director", image: null },
    { name: "Sam Taylor", role: "Lead Developer", image: null },
  ];
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

/** Dynamic pages (replace with DB query later) */
export async function getDynamicPages(): Promise<DynamicPage[]> {
  return [
    { title: "About Us", slug: "about", template: "Default" },
    { title: "Careers", slug: "careers", template: "Default" },
    { title: "Case Studies", slug: "case-studies", template: "Landing" },
  ];
}

/** Site settings sections (links to edit page) */
export function getSiteSettingsSections(): SettingsSection[] {
  return [
    { title: "Branding", description: "Manage logo, favicon, and site name.", actionHref: "/admin/site-settings/edit" },
    { title: "Contact Info", description: "Manage email, phone, and address shown on the site.", actionHref: "/admin/site-settings/edit" },
    { title: "Social Links", description: "Manage social media profiles displayed on the website.", actionHref: "/admin/site-settings/edit" },
    { title: "Footer & Legal", description: "Manage footer text, newsletter, and legal page links.", actionHref: "/admin/site-settings/edit" },
  ];
}

/** Single global site settings document from MongoDB */
export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  const { dbConnect } = await import("@/lib/db");
  const { SiteSettings } = await import("@/models/SiteSettings");

  await dbConnect();

  const doc = await SiteSettings.findOne().lean();
  if (!doc) return null;

  return {
    _id: String(doc._id),
    siteName: doc.siteName ?? "",
    logoText: doc.logoText ?? "",
    logoUrl: doc.logoUrl ?? "",
    faviconUrl: doc.faviconUrl ?? "",
    contactEmail: doc.contactEmail ?? "",
    phone: doc.phone ?? "",
    address: doc.address ?? "",
    mapEmbedUrl: doc.mapEmbedUrl ?? "",
    footerText: doc.footerText ?? "",
    privacyPolicyUrl: doc.privacyPolicyUrl ?? "",
    termsUrl: doc.termsUrl ?? "",
    socialLinks: {
      facebook: doc.socialLinks?.facebook ?? "",
      twitter: doc.socialLinks?.twitter ?? "",
      linkedin: doc.socialLinks?.linkedin ?? "",
      instagram: doc.socialLinks?.instagram ?? "",
    },
  };
}

/** Single hero document from MongoDB */
export async function getHeroData(): Promise<HeroData | null> {
  const { dbConnect } = await import("@/lib/db");
  const { Hero } = await import("@/models/Hero");

  await dbConnect();

  const doc = await Hero.findOne().lean();
  if (!doc) return null;

  return {
    _id: String(doc._id),
    heading: doc.heading ?? "",
    description: doc.description ?? "",
    ctaText: doc.ctaText ?? "",
    ctaLink: doc.ctaLink ?? "",
    badgeText: doc.badgeText ?? "",
    phoneText: doc.phoneText ?? "",
  };
}

/** Homepage content sections (replace with DB/config later) */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  return [
    { title: "Hero", description: "Headline, subheadline, and CTA buttons." },
    { title: "Features", description: "Feature highlights and icons." },
    { title: "Why Choose Us", description: "Value propositions and differentiators." },
    { title: "Services", description: "Services preview block." },
    { title: "Team", description: "Team section heading and layout." },
    { title: "Testimonials", description: "Client quotes and carousel." },
    { title: "Blog", description: "Latest posts preview." },
    { title: "Contact", description: "Contact form and details." },
  ];
}

/** Legal page sections (replace with DB/config later) */
export async function getLegalSections(): Promise<LegalSection[]> {
  return [
    { title: "Privacy Policy", description: "Edit the privacy policy page content and last updated date.", actionHref: "#" },
    { title: "Terms & Conditions", description: "Edit the terms of service and usage conditions.", actionHref: "#" },
  ];
}
