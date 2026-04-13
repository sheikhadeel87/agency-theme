/** Contact form phone (optional). Safe to import from client components — no server deps. */

/** Shown when a non-empty phone fails format checks (keep in sync with `isValidContactPhone`). */
export const CONTACT_PHONE_INVALID_MESSAGE =
  "Please enter a valid phone number (use digits; you may start with + and use spaces, dashes, or parentheses).";

/** Strip characters that are never valid in international-style phone input. */
export function sanitizeContactPhoneInput(raw: string): string {
  return raw.replace(/[^\d+\s\-()]/g, "");
}

/**
 * Phone is optional. If provided (non-whitespace), must contain at least one digit and only
 * an optional leading `+` plus digits, spaces, hyphens, and parentheses.
 */
export function isValidContactPhone(phone: string): boolean {
  const t = phone.trim();
  if (!t) return true;
  if (t.length > 50) return false;
  if (!/^\+?[\d\s\-()]+$/.test(t)) return false;
  if (!/\d/.test(t)) return false;
  return true;
}
