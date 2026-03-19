/** Strip tags and collapse whitespace to detect visible text in rich HTML. */
export function htmlToPlainText(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasMeaningfulHtmlContent(html: string | undefined | null): boolean {
  return htmlToPlainText(html).length > 0;
}
