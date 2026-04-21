/**
 * Pure nav / homepage section flags — safe for client components (no DB / mongoose).
 */

function cmsEnabled(value: unknown): boolean {
  return value !== false;
}

export type NavSectionVisibility = {
  hero: boolean;
  featuresHighlights: boolean;
  whyChooseUs: boolean;
  team: boolean;
  services: boolean;
  pricing: boolean;
  portfolio: boolean;
  testimonials: boolean;
  blog: boolean;
  contact: boolean;
};

/** Keys allowed on footer links and optional `NavChildItem.sectionKey`. */
export const SECTION_VISIBILITY_KEYS = [
  "hero",
  "featuresHighlights",
  "whyChooseUs",
  "team",
  "services",
  "pricing",
  "portfolio",
  "testimonials",
  "blog",
  "contact",
] as const satisfies readonly (keyof NavSectionVisibility)[];

export const SECTION_VISIBILITY_KEY_SET = new Set<string>(SECTION_VISIBILITY_KEYS);

const SECTION_LABELS: Record<keyof NavSectionVisibility, string> = {
  hero: "Hero",
  featuresHighlights: "Support",
  whyChooseUs: "Why choose us",
  team: "Team",
  services: "Services",
  pricing: "Pricing",
  portfolio: "Portfolio",
  testimonials: "Testimonials",
  blog: "Blog",
  contact: "Contact",
};

/** Footer link editor + `select` for tying a link to homepage section visibility. */
export function sectionVisibilitySelectOptions(): { value: string; label: string }[] {
  return [
    { value: "", label: "Always show" },
    ...SECTION_VISIBILITY_KEYS.map((k) => ({ value: k, label: SECTION_LABELS[k] })),
  ];
}

/** Narrow shapes so callers can pass full CMS models without importing admin-data here. */
export type BuildNavSectionVisibilityArgs = {
  siteSettings: {
    featuresHighlightsSectionEnabled?: boolean;
    servicesSectionEnabled?: boolean;
    portfolioSectionEnabled?: boolean;
    blogSectionEnabled?: boolean;
    contactSectionEnabled?: boolean;
  } | null;
  hero: { isEnabled?: boolean } | null;
  teamSettings: { isEnabled?: boolean };
  whyChooseUs: { isEnabled?: boolean };
  pricing: { isEnabled?: boolean };
  testimonials: { isEnabled?: boolean };
};

/**
 * Per-flag booleans for the live homepage and main nav. Each is `true` only when that
 * block’s `isEnabled` (or site-level section flag) is allowed on the live site after
 * `cmsEnabled` normalization (`false` in DB disables; missing field stays enabled).
 */
export function buildNavSectionVisibility(args: BuildNavSectionVisibilityArgs): NavSectionVisibility {
  return {
    hero: !args.hero || cmsEnabled(args.hero.isEnabled),
    featuresHighlights: cmsEnabled(args.siteSettings?.featuresHighlightsSectionEnabled),
    whyChooseUs: cmsEnabled(args.whyChooseUs.isEnabled),
    team: cmsEnabled(args.teamSettings.isEnabled),
    services: cmsEnabled(args.siteSettings?.servicesSectionEnabled),
    pricing: cmsEnabled(args.pricing.isEnabled),
    portfolio: cmsEnabled(args.siteSettings?.portfolioSectionEnabled),
    testimonials: cmsEnabled(args.testimonials.isEnabled),
    blog: cmsEnabled(args.siteSettings?.blogSectionEnabled),
    contact: cmsEnabled(args.siteSettings?.contactSectionEnabled),
  };
}
