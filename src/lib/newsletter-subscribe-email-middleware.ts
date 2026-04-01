import { promises as dns } from "node:dns";
import disposableDomains from "disposable-email-domains";

const disposableSet = new Set(
  (disposableDomains as string[]).map((d) => d.toLowerCase())
);

function domainFromNormalizedEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 0 || at === email.length - 1) return "";
  return email.slice(at + 1).toLowerCase();
}

export type NewsletterSubscribeEmailMiddlewareResult =
  | { ok: true }
  | { ok: false; message: string; httpStatus?: number };

/**
 * Runs after format validation (`normalizeNewsletterEmail` uses `validator.isEmail`).
 * Blocks disposable domains and domains without MX (cannot receive mail).
 */
export async function newsletterSubscribeEmailMiddleware(
  normalizedEmail: string
): Promise<NewsletterSubscribeEmailMiddlewareResult> {
  const domain = domainFromNormalizedEmail(normalizedEmail);
  if (!domain) {
    return { ok: false, message: "Invalid email" };
  }

  if (disposableSet.has(domain)) {
    return {
      ok: false,
      message: "Temporary or disposable email addresses are not allowed.",
    };
  }

  try {
    const mx = await dns.resolveMx(domain);
    if (!mx?.length) {
      return {
        ok: false,
        message: "This email domain does not exist or cannot receive mail.",
      };
    }
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as NodeJS.ErrnoException).code)
        : "";
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        ok: false,
        message: "This email domain does not exist or cannot receive mail.",
      };
    }
    console.error("newsletterSubscribeEmailMiddleware resolveMx:", e);
    return {
      ok: false,
      message: "Could not verify your email domain. Please try again in a moment.",
      httpStatus: 503,
    };
  }

  return { ok: true };
}
