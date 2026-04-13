/** Max words for service description (admin + public services UI). */
export const SERVICE_DESCRIPTION_MAX_WORDS = 100;

/** Max words for blog post body (rich content on blog detail pages). */
export const BLOG_POST_BODY_MAX_WORDS = 200;

/** Max words for blog excerpt (cards, listings, SEO fallback). Kept separate from bio/portfolio. */
export const BLOG_POST_EXCERPT_MAX_WORDS = 50;

/** Max words for team bio and portfolio full (rich) description. */
export const BIO_PORTFOLIO_BLOG_DESCRIPTION_MAX_WORDS = 200;

/** Max words for portfolio card / listing short description (plain text). */
export const PORTFOLIO_SHORT_DESCRIPTION_MAX_WORDS = 50;

/** Max words for Why Choose Us section intro (rich HTML in admin). */
export const WHY_CHOOSE_US_SECTION_DESCRIPTION_MAX_WORDS = 70;

/** Word count for plain text (e.g. TipTap `getText()`). */
export function countWordsFromPlainText(text: string): number {
  const t = text.replace(/\u00a0/g, " ").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/** Truncates plain text to the first `maxWords` words (for textarea limits). */
export function clampPlainTextToMaxWords(text: string, maxWords: number): string {
  if (maxWords <= 0) return "";
  const normalized = text.replace(/\u00a0/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

/**
 * Word count after stripping HTML (admin rich text, stored description).
 * Keeps server and client limits aligned with what editors produce.
 */
export function countWordsFromHtml(html: string): number {
  if (!html?.trim()) return 0;
  const plain = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/&#[xX][0-9a-fA-F]+;/g, " ")
    .replace(/&[a-z]{2,10};/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return countWordsFromPlainText(plain);
}
