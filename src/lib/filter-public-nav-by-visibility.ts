import type { NavSectionVisibility } from "@/lib/admin-data";
import type { PublicNavEntry } from "@/lib/navigation";

/** When header has no visibility prop, match footer behavior (show all links). */
export const ALL_NAV_SECTIONS_VISIBLE: NavSectionVisibility = {
  hero: true,
  featuresHighlights: true,
  whyChooseUs: true,
  team: true,
  services: true,
  pricing: true,
  portfolio: true,
  testimonials: true,
  blog: true,
  contact: true,
};

/**
 * Map a public nav href to a homepage / section visibility flag.
 * Returns undefined when the link is not gated (e.g. `/`, CMS pages).
 */
export function navHrefToVisibilityKey(
  href: string
): keyof NavSectionVisibility | undefined {
  const raw = href.trim().toLowerCase();
  const hashIdx = raw.indexOf("#");
  const hash = hashIdx >= 0 ? raw.slice(hashIdx) : "";

  if (raw.startsWith("/team")) return "team";
  if (hash === "#team") return "team";

  if (raw.startsWith("/blog")) return "blog";
  if (hash === "#blog" || hash === "#blog-section") return "blog";

  if (raw.startsWith("/portfolio")) return "portfolio";
  if (hash === "#portfolio") return "portfolio";

  if (raw.startsWith("/pricing")) return "pricing";

  if (hash === "#contact") return "contact";
  if (hash === "#services") return "services";
  if (hash === "#why-choose-us") return "whyChooseUs";
  if (hash === "#pricing") return "pricing";
  if (hash === "#testimonials") return "testimonials";
  if (hash === "#support") return "featuresHighlights";

  return undefined;
}

function isNavHrefVisible(href: string, v: NavSectionVisibility): boolean {
  const key = navHrefToVisibilityKey(href);
  if (key === undefined) return true;
  return v[key] === true;
}

/** Drop nav links (and dropdown items) whose target section is disabled on the live site. */
export function filterPublicNavBySectionVisibility(
  entries: PublicNavEntry[],
  v: NavSectionVisibility
): PublicNavEntry[] {
  const out: PublicNavEntry[] = [];
  for (const entry of entries) {
    if (entry.type === "link") {
      if (isNavHrefVisible(entry.href, v)) out.push(entry);
      continue;
    }
    const items = entry.items.filter((item) => isNavHrefVisible(item.href, v));
    if (items.length === 0) continue;
    out.push({ type: "dropdown", label: entry.label, items });
  }
  return out;
}
