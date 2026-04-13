export type SocialPlatform = "facebook" | "twitter" | "linkedin" | "instagram";

/** Recognized registrable domains for each platform (subdomains allowed). */
const PLATFORM_ROOTS: Record<SocialPlatform, readonly string[]> = {
  facebook: ["facebook.com", "fb.com"],
  twitter: ["twitter.com", "x.com", "t.co"],
  linkedin: ["linkedin.com"],
  instagram: ["instagram.com"],
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

/** Shown in validation errors after “e.g.” */
const PLATFORM_EXAMPLE_URL: Record<SocialPlatform, string> = {
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  instagram: "https://instagram.com",
};

function hostMatchesPlatform(hostname: string, platform: SocialPlatform): boolean {
  const h = hostname.toLowerCase();
  return PLATFORM_ROOTS[platform].some(
    (root) => h === root || h.endsWith(`.${root}`)
  );
}

/**
 * Returns an error message if the value is non-empty but not a valid URL for that platform.
 * Empty string is valid (field cleared).
 */
export function validateSocialUrl(platform: SocialPlatform, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(withProto);
  } catch {
    return "Enter a valid URL.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Only http and https links are allowed.";
  }

  if (!hostMatchesPlatform(url.hostname, platform)) {
    const label = PLATFORM_LABELS[platform];
    const example = PLATFORM_EXAMPLE_URL[platform];
    return `${label} field must use a ${label} link (e.g. ${example}).`;
  }

  return null;
}

export type SiteSocialLinksInput = {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
};

/** First validation error across all social fields, or null if all OK. */
export function validateSiteSocialLinks(social: SiteSocialLinksInput): string | null {
  const platforms: SocialPlatform[] = ["facebook", "twitter", "linkedin", "instagram"];
  for (const p of platforms) {
    const err = validateSocialUrl(p, social[p]);
    if (err) return err;
  }
  return null;
}
