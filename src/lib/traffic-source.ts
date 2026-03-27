export type TrafficSource =
  | "direct"
  | "google"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "other";

function siteHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Map document.referrer to a coarse traffic bucket. */
export function normalizeTrafficSource(referrer: string | undefined): TrafficSource {
  const r = (referrer ?? "").trim();
  if (!r) return "direct";

  let host: string;
  try {
    host = new URL(r).hostname.toLowerCase();
  } catch {
    return "other";
  }

  const site = siteHostname();
  if (site && (host === site || host.endsWith(`.${site}`))) return "direct";

  if (host.includes("google.")) return "google";
  if (host.includes("facebook.") || host === "fb.com" || host.endsWith(".facebook.com"))
    return "facebook";
  if (host.includes("instagram.")) return "instagram";
  if (host.includes("linkedin.")) return "linkedin";

  return "other";
}
