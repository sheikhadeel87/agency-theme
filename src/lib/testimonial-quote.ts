export const TESTIMONIAL_QUOTE_MAX_WORDS = 50;

export function countQuoteWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function quoteExceedsWordLimit(text: string): boolean {
  return countQuoteWords(text) > TESTIMONIAL_QUOTE_MAX_WORDS;
}
