import validator from "validator";

const MAX_LENGTH = 320;

/**
 * Format + length check (`validator.isEmail`). Use before DB / DNS / disposable checks.
 */
export function normalizeNewsletterEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > MAX_LENGTH) return null;
  if (!validator.isEmail(email, { allow_utf8_local_part: true })) return null;
  return email;
}
