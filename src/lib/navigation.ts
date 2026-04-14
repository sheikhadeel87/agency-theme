import { SECTION_VISIBILITY_KEY_SET } from "@/lib/nav-section-visibility";
import type { NavSectionVisibility } from "@/lib/nav-section-visibility";

export type NavChildItem = {
  label: string;
  href: string;
  isEnabled: boolean;
  order: number;
  /** Footer columns editor: hide when this homepage section is off (Page visibility). */
  sectionKey?: keyof NavSectionVisibility;
};

export type NavItem = {
  label: string;
  href: string;
  isEnabled: boolean;
  order: number;
  appendDynamicPages?: boolean;
  children?: NavChildItem[];
};

export type PublicNavEntry =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; items: { label: string; href: string }[] };

function navChild(label: string, href: string, order: number): NavChildItem {
  return { label, href, isEnabled: true, order };
}

/** Default primary nav: Portfolio lives under Pages, not top-level. */
export function getDefaultNavigation(): NavItem[] {
  return reindexNavigationOrders([
    { label: "Home", href: "/", isEnabled: true, order: 1 },
    { label: "Features", href: "/#why-choose-us", isEnabled: true, order: 2 },
    { label: "Pricing", href: "/#pricing", isEnabled: true, order: 3 },
    { label: "Testimonials", href: "/#testimonials", isEnabled: true, order: 4 },
    { label: "Support", href: "/#support", isEnabled: true, order: 5 },
    {
      label: "Pages",
      href: "/",
      isEnabled: true,
      order: 6,
      appendDynamicPages: true,
      children: [
        navChild("Team", "/team", 1),
        navChild("Services", "/services", 2),
        navChild("Portfolio", "/portfolio", 3),
        navChild("Blog", "/blog", 4),
        navChild("Contact", "/contact", 5),
      ],
    },
  ]);
}

export function reindexNavigationOrders(items: NavItem[]): NavItem[] {
  return items.map((item, i) => ({
    ...item,
    order: i + 1,
    children: item.children?.map((c, j) => ({ ...c, order: j + 1 })),
  }));
}

function normalizeHashHref(href: string): string {
  const t = href.trim();
  if (!t) return "";
  if (t.startsWith("/#")) return t;
  if (t.startsWith("#")) return `/${t}`;
  return t;
}

function isTopLevelPortfolioItem(item: NavItem): boolean {
  if (item.children && item.children.length > 0) return false;
  const h = normalizeHashHref(item.href);
  if (h === "/#portfolio") return true;
  return item.label.trim().toLowerCase() === "portfolio" && (h === "/#portfolio" || h === "#portfolio");
}

/**
 * Legacy DB rows may still have Portfolio as a top-level link. Move it under the Pages dropdown.
 * No-op if there is no Pages item with a children array, or no qualifying top-level Portfolio.
 */
function migratePortfolioIntoPagesDropdown(items: NavItem[]): NavItem[] {
  const portfolioIdx = items.findIndex((it) => isTopLevelPortfolioItem(it));
  const pagesIdx = items.findIndex(
    (it) =>
      it.label.trim().toLowerCase() === "pages" && Array.isArray(it.children)
  );
  if (portfolioIdx === -1 || pagesIdx === -1) return items;

  const portfolio = items[portfolioIdx];
  const pages = items[pagesIdx];
  if (!portfolio || !pages) return items;

  const existingChildren = [...(pages.children ?? [])];
  const alreadyHas = existingChildren.some((c) => {
    const t = c.href.trim();
    return t === "/portfolio" || normalizeHashHref(t) === "/#portfolio";
  });
  if (!alreadyHas) {
    existingChildren.push({
      label: portfolio.label?.trim() || "Portfolio",
      href: "/portfolio",
      isEnabled: portfolio.isEnabled !== false,
      order: existingChildren.length + 1,
    });
  }

  const withoutPortfolio = items.filter((_, i) => i !== portfolioIdx);
  const newPagesIdx = withoutPortfolio.findIndex(
    (it) => it.label.trim().toLowerCase() === "pages" && Array.isArray(it.children)
  );
  if (newPagesIdx === -1) return items;

  const next = [...withoutPortfolio];
  const pagesRow = next[newPagesIdx];
  if (!pagesRow) return items;
  next[newPagesIdx] = {
    ...pagesRow,
    children: existingChildren,
  };
  return next;
}

/** Public nav “Blog” should open the `/blog` archive, not scroll to `/#blog` on the homepage. */
function fixBlogHref(href: string): string {
  const t = href.trim();
  if (t === "/blog" || t.startsWith("/blog/")) return href;
  if (t === "/#blog" || t === "#blog" || t === "blog") return "/blog";
  if (t === "/#blog-section" || t === "#blog-section" || t === "/blog-section") return "/blog";
  return href;
}

function fixLegacyBlogHrefs(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: fixBlogHref(item.href),
    children: item.children?.map((c) => ({
      ...c,
      href: fixBlogHref(c.href),
    })),
  }));
}

/** Public nav “Team” should open the `/team` archive, not only `/#team` on the homepage. */
function fixTeamHref(href: string): string {
  const t = href.trim();
  if (t === "/team" || t.startsWith("/team/")) return href;
  if (t === "/#team" || t === "#team" || t === "team") return "/team";
  return href;
}

function fixLegacyTeamHrefs(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: fixTeamHref(item.href),
    children: item.children?.map((c) => ({
      ...c,
      href: fixTeamHref(c.href),
    })),
  }));
}

function fixLegacyPortfolioListingHref(href: string): string {
  const t = href.trim();
  if (t === "/#portfolio" || t === "#portfolio") return "/portfolio";
  return href;
}

function fixLegacyPortfolioListingHrefs(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: fixLegacyPortfolioListingHref(item.href),
    children: item.children?.map((c) => ({
      ...c,
      href: fixLegacyPortfolioListingHref(c.href),
    })),
  }));
}

/** Public nav Services / Contact use full routes like Blog and Portfolio. */
function fixServicesAndContactHref(href: string): string {
  const t = href.trim();
  if (t === "/services" || t.startsWith("/services/")) return href;
  if (t === "/contact" || t.startsWith("/contact?")) return href;
  if (t === "/#services" || t === "#services") return "/services";
  if (t === "/#contact" || t === "#contact") return "/contact";
  return href;
}

function fixLegacyServicesContactHrefs(items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: fixServicesAndContactHref(item.href),
    children: item.children?.map((c) => ({
      ...c,
      href: fixServicesAndContactHref(c.href),
    })),
  }));
}

function applyLegacyNavHrefFixes(items: NavItem[]): NavItem[] {
  return fixLegacyServicesContactHrefs(
    fixLegacyTeamHrefs(fixLegacyBlogHrefs(fixLegacyPortfolioListingHrefs(items)))
  );
}

function coerceNavChild(row: unknown, index: number): NavChildItem | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const sk = o.sectionKey;
  const sectionKey =
    typeof sk === "string" && SECTION_VISIBILITY_KEY_SET.has(sk)
      ? (sk as keyof NavSectionVisibility)
      : undefined;
  const base: NavChildItem = {
    label: String(o.label ?? ""),
    href: String(o.href ?? ""),
    isEnabled: o.isEnabled !== false,
    order: typeof o.order === "number" && Number.isFinite(o.order) ? o.order : index + 1,
  };
  if (sectionKey) base.sectionKey = sectionKey;
  return base;
}

function coerceNavItem(row: unknown, index: number): NavItem | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const childrenRaw = o.children;
  let children: NavChildItem[] | undefined;
  if (Array.isArray(childrenRaw)) {
    const mapped = childrenRaw
      .map((c, j) => coerceNavChild(c, j))
      .filter((c): c is NavChildItem => c != null);
    children = mapped.length ? mapped : undefined;
  }
  return {
    label: String(o.label ?? ""),
    href: String(o.href ?? ""),
    isEnabled: o.isEnabled !== false,
    order: typeof o.order === "number" && Number.isFinite(o.order) ? o.order : index + 1,
    appendDynamicPages: o.appendDynamicPages === true ? true : undefined,
    children,
  };
}

function coerceNavigationArray(raw: unknown): NavItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, i) => coerceNavItem(row, i))
    .filter((item): item is NavItem => item != null);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const o = value as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(",")}}`;
}

export function normalizeNavigationInput(raw: unknown): NavItem[] {
  const coerced = coerceNavigationArray(raw);
  const migrated = migratePortfolioIntoPagesDropdown(coerced);
  return reindexNavigationOrders(applyLegacyNavHrefFixes(migrated));
}

/**
 * True if stored nav should be rewritten (structural migration or legacy href fixes).
 * Compares coerced-only reindex vs full normalization so /#portfolio → /portfolio persists.
 */
export function navigationPersistedShapeChanged(raw: unknown): boolean {
  const coerced = coerceNavigationArray(raw);
  if (!coerced.length) return false;
  const rawOnly = reindexNavigationOrders(coerced);
  const normalized = normalizeNavigationInput(raw);
  return stableStringify(rawOnly) !== stableStringify(normalized);
}

export function parseNavigationPayload(input: unknown): NavItem[] {
  if (!Array.isArray(input)) {
    throw new Error("navigation must be a JSON array");
  }
  return normalizeNavigationInput(input);
}

/** Map MongoDB / lean `navigation` field to typed items (same rules as public GET). */
export function mapDocNavigation(raw: unknown): NavItem[] {
  return normalizeNavigationInput(raw);
}

export function buildPublicNavigation(
  nav: NavItem[] | undefined | null,
  dynamicPages: { title: string; slug: string }[]
): PublicNavEntry[] {
  const roots = nav?.length ? [...nav].sort((a, b) => a.order - b.order) : [];
  const entries: PublicNavEntry[] = [];

  for (const item of roots) {
    if (!item.isEnabled) continue;
    const sortedChildren = [...(item.children ?? [])]
      .filter((c) => c.isEnabled)
      .sort((a, b) => a.order - b.order);
    const hasDropdown = sortedChildren.length > 0 || item.appendDynamicPages === true;
    if (hasDropdown) {
      const staticItems = sortedChildren.map((c) => ({
        label: c.label,
        href: c.href.trim() || "/",
      }));
      const dynamicItems =
        item.appendDynamicPages === true
          ? dynamicPages.map((p) => ({
              label: p.title,
              href: `/${p.slug}`.replace(/\/+/g, "/"),
            }))
          : [];
      const combined = [...staticItems, ...dynamicItems];
      if (combined.length === 0) continue;
      entries.push({ type: "dropdown", label: item.label, items: combined });
    } else {
      entries.push({
        type: "link",
        label: item.label,
        href: item.href.trim() || "/",
      });
    }
  }

  return entries;
}

export function publicNavEntryKey(entry: PublicNavEntry, index: number): string {
  if (entry.type === "link") {
    return `link:${entry.href}:${entry.label}:${index}`;
  }
  return `dropdown:${entry.label}:${index}`;
}

function stripClientNavId<T extends object>(obj: T): Omit<T, "id"> {
  const copy = { ...obj };
  delete (copy as { id?: unknown }).id;
  return copy as Omit<T, "id">;
}

export function serializeNavigationForSave(
  items: Array<
    Omit<NavItem, "children"> & {
      id?: string;
      children?: Array<NavChildItem & { id?: string }>;
    }
  >
): NavItem[] {
  const stripped: NavItem[] = items.map((item) => ({
    ...stripClientNavId(item),
    children: item.children?.map((child) => stripClientNavId(child)),
  }));
  return parseNavigationPayload(stripped);
}
