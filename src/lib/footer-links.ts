import type { NavSectionVisibility } from "@/lib/nav-section-visibility";
import { SECTION_VISIBILITY_KEY_SET } from "@/lib/nav-section-visibility";

export type FooterNavSectionKey = keyof NavSectionVisibility;

export type FooterLinkRow = {
  label: string;
  href: string;
  sectionKey?: FooterNavSectionKey;
  order: number;
};

export type FooterColumn = {
  title: string;
  order: number;
  links: FooterLinkRow[];
};

export function getDefaultFooterColumns(): FooterColumn[] {
  return reindexFooterColumns([
    {
      title: "Quick Links",
      order: 1,
      links: [
        { label: "Home", href: "/", order: 1 },
        { label: "Features", href: "/#why-choose-us", sectionKey: "whyChooseUs", order: 2 },
        { label: "Portfolio", href: "/portfolio", sectionKey: "portfolio", order: 3 },
        { label: "Pricing", href: "/#pricing", sectionKey: "pricing", order: 4 },
      ],
    },
    {
      title: "Services",
      order: 2,
      links: [
        { label: "Web Development", href: "/#support", sectionKey: "featuresHighlights", order: 1 },
        { label: "Graphics Design", href: "/services", sectionKey: "services", order: 2 },
        { label: "Our Blog", href: "/blog", sectionKey: "blog", order: 3 },
        { label: "Ui/Ux Design", href: "/services", sectionKey: "services", order: 4 },
      ],
    },
    {
      title: "Support",
      order: 3,
      links: [
        { label: "Team", href: "/#team", sectionKey: "team", order: 1 },
        { label: "Contact Us", href: "/contact", sectionKey: "contact", order: 2 },
        { label: "Privacy Policy", href: "/privacy-policy", order: 3 },
        { label: "Terms & Conditions", href: "/terms-conditions", order: 4 },
      ],
    },
  ]);
}

export function reindexFooterColumns(cols: FooterColumn[]): FooterColumn[] {
  return cols.map((c, i) => ({
    ...c,
    order: i + 1,
    links: c.links.map((l, j) => ({ ...l, order: j + 1 })),
  }));
}

function normalizeLink(raw: Record<string, unknown>, order: number): FooterLinkRow | null {
  const label = typeof raw.label === "string" ? raw.label.trim() : "";
  const href = typeof raw.href === "string" ? raw.href.trim() : "";
  if (!label || !href) return null;
  const sk = raw.sectionKey;
  const sectionKey =
    typeof sk === "string" && sk.trim() && SECTION_VISIBILITY_KEY_SET.has(sk.trim())
      ? (sk.trim() as FooterNavSectionKey)
      : undefined;
  return { label, href, order, ...(sectionKey ? { sectionKey } : {}) };
}

function normalizeColumn(raw: Record<string, unknown>, order: number): FooterColumn | null {
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) return null;
  const linksRaw = Array.isArray(raw.links) ? raw.links : [];
  const links: FooterLinkRow[] = [];
  linksRaw.forEach((lr, i) => {
    if (!lr || typeof lr !== "object") return;
    const row = normalizeLink(lr as Record<string, unknown>, i + 1);
    if (row) links.push(row);
  });
  return { title, order, links };
}

export function mapDocFooterColumns(raw: unknown): FooterColumn[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out: FooterColumn[] = [];
  raw.forEach((item, i) => {
    if (!item || typeof item !== "object") return;
    const col = normalizeColumn(item as Record<string, unknown>, i + 1);
    if (col) out.push(col);
  });
  return reindexFooterColumns(out);
}

export function parseFooterColumnsPayload(raw: unknown): FooterColumn[] {
  if (!Array.isArray(raw)) throw new Error("footerColumns must be a JSON array");
  const cols: FooterColumn[] = [];
  raw.forEach((item, i) => {
    if (!item || typeof item !== "object") throw new Error(`footerColumns[${i}] must be an object`);
    const col = normalizeColumn(item as Record<string, unknown>, i + 1);
    if (!col) throw new Error(`footerColumns[${i}]: missing title`);
    cols.push(col);
  });
  if (cols.length === 0) throw new Error("footerColumns must contain at least one column");
  return reindexFooterColumns(cols);
}
