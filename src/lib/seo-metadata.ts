import type { Metadata } from "next";
import { htmlToPlainText } from "@/lib/html-utils";

/** Google SERP–friendly title cap (pixels vary; 60 is a safe character budget). */
export const SEO_TITLE_MAX_LENGTH = 60;

/** Meta description cap aligned with search snippet limits. */
export const SEO_DESCRIPTION_MAX_LENGTH = 160;

/** Comma-separated keywords: max distinct entries stored and emitted. */
export const SEO_KEYWORDS_MAX_COUNT = 10;

/** Max characters for the keywords field in admin (prevents huge single “keywords”). */
export const SEO_KEYWORDS_INPUT_MAX_LENGTH = 400;

/**
 * Trims and collapses whitespace, then shortens to `maxChars` without breaking mid-word when possible.
 */
export function truncateSeoText(text: string, maxChars: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > Math.floor(maxChars * 0.55) ? lastSpace : maxChars;
  return t.slice(0, cut).trimEnd();
}

export function normalizeMetaTitle(raw: string | undefined | null): string {
  return truncateSeoText(String(raw ?? ""), SEO_TITLE_MAX_LENGTH);
}

export function normalizeMetaDescription(raw: string | undefined | null): string {
  return truncateSeoText(String(raw ?? ""), SEO_DESCRIPTION_MAX_LENGTH);
}

/**
 * Parse comma-separated keywords: trim, de-duplicate (case-insensitive), cap at
 * {@link SEO_KEYWORDS_MAX_COUNT}.
 */
/**
 * While typing comma-separated keywords, keep at most `max` non-empty entries.
 * Extra keywords are dropped from the end of the list.
 */
export function clampCommaSeparatedKeywords(
  raw: string,
  max: number = SEO_KEYWORDS_MAX_COUNT
): string {
  const s = raw.slice(0, SEO_KEYWORDS_INPUT_MAX_LENGTH);
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= max) return s;
  return parts.slice(0, max).join(", ");
}

export function parseMetaKeywords(raw: string | undefined | null): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(raw ?? "").split(",")) {
    const k = part.replace(/\s+/g, " ").trim();
    if (!k) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
    if (out.length >= SEO_KEYWORDS_MAX_COUNT) break;
  }
  return out;
}

export function finalizeMetaKeywordsStorage(raw: string | undefined | null): string {
  return parseMetaKeywords(raw).join(", ");
}

export function tidyOneLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Plain text used for SEO when meta description is empty. */
export function effectiveSeoDescription(meta: string, fallback: string): string {
  const m = tidyOneLine(meta);
  if (m) return m;
  return tidyOneLine(htmlToPlainText(fallback));
}

export function effectiveSeoTitle(meta: string, fallback: string): string {
  return tidyOneLine(meta) || tidyOneLine(fallback);
}

export function validateEffectiveSeoBundle(input: {
  metaTitle: string;
  metaDescription: string;
  fallbackTitle: string;
  fallbackDescription: string;
}): string | null {
  const title = effectiveSeoTitle(input.metaTitle, input.fallbackTitle);
  const desc = effectiveSeoDescription(input.metaDescription, input.fallbackDescription);
  if (title.length > SEO_TITLE_MAX_LENGTH) {
    return `SEO title must be at most ${SEO_TITLE_MAX_LENGTH} characters (currently ${title.length}). Shorten the meta title or main title.`;
  }
  if (desc.length > SEO_DESCRIPTION_MAX_LENGTH) {
    return `SEO description must be at most ${SEO_DESCRIPTION_MAX_LENGTH} characters (currently ${desc.length}). Shorten the meta description or supporting text used as the fallback.`;
  }
  return null;
}

/** Validate explicit meta fields only (e.g. legal pages with optional overrides). */
export function validateOptionalMetaFields(
  metaTitle: string,
  metaDescription: string
): string | null {
  const t = tidyOneLine(metaTitle);
  const d = tidyOneLine(metaDescription);
  if (t.length > SEO_TITLE_MAX_LENGTH) {
    return `Meta title must be at most ${SEO_TITLE_MAX_LENGTH} characters (currently ${t.length}).`;
  }
  if (d.length > SEO_DESCRIPTION_MAX_LENGTH) {
    return `Meta description must be at most ${SEO_DESCRIPTION_MAX_LENGTH} characters (currently ${d.length}).`;
  }
  return null;
}

/**
 * Normalized {@link Metadata} for public routes: enforces title/description length and keyword cap.
 */
export function buildPublicMetadata(opts: {
  title: string;
  description?: string | null;
  keywords?: string | null;
  openGraph?: Metadata["openGraph"];
  robots?: Metadata["robots"];
}): Metadata {
  const title = normalizeMetaTitle(opts.title);
  const descriptionNorm = opts.description?.trim()
    ? normalizeMetaDescription(opts.description)
    : "";
  const keywords = parseMetaKeywords(opts.keywords ?? "");

  const metadata: Metadata = { title };
  if (descriptionNorm) metadata.description = descriptionNorm;
  if (keywords.length) metadata.keywords = keywords;
  if (opts.robots) metadata.robots = opts.robots;

  metadata.openGraph = {
    ...opts.openGraph,
    title,
    ...(descriptionNorm ? { description: descriptionNorm } : {}),
  };

  return metadata;
}
