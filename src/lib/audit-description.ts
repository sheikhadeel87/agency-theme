type Meta = Record<string, unknown> | undefined;

/** User column + description prefix: `Name (email)` when both exist, else whichever is set. */
export function formatAuditActorDisplay(
  name?: string | null,
  email?: string | null
): string {
  const n = typeof name === "string" ? name.trim() : "";
  const e = typeof email === "string" ? email.trim() : "";
  if (n && e) return `${n} (${e})`;
  if (e) return e;
  if (n) return n;
  return "Unknown";
}

function s(meta: Meta, key: string): string {
  const v = meta?.[key];
  return typeof v === "string" ? v.trim() : "";
}

function postName(meta: Meta): string {
  return s(meta, "title") || s(meta, "slug") || "untitled";
}

function cmsItem(actor: string, verb: "created" | "updated" | "deleted", noun: string, meta: Meta): string {
  return `${actor} ${verb} ${noun} (${postName(meta)})`;
}

function cmsSection(actor: string, label: string, meta: Meta): string {
  const hint = s(meta, "title");
  return hint ? `${actor} updated ${label} (${hint})` : `${actor} updated ${label}`;
}

function onOff(enabled: unknown): string {
  return enabled === true ? "ENABLED" : "DISABLED";
}

const SECTION_LABEL: Record<string, string> = {
  hero: "Hero",
  whyChooseUs: "Why choose us",
  services: "Services",
  portfolio: "Portfolio",
  team: "Team",
  testimonials: "Testimonials",
  pricing: "Pricing",
  blog: "Blog",
};

function sectionName(resourceId: string | undefined): string {
  if (!resourceId) return "Section";
  return SECTION_LABEL[resourceId] ?? resourceId;
}

const HOMEPAGE_MODULE_LABEL: Record<string, string> = {
  services: "Services",
  portfolio: "Portfolio",
  blog: "Blog",
};

/**
 * Human-readable line: actor first, past tense. Unknown actions use a generic fallback.
 */
export function buildAuditDescription(
  action: string,
  resource: string,
  resourceId: string | undefined,
  metadata: Meta,
  actor: string
): string {
  const a = actor.trim() || "Unknown";
  const meta = metadata;

  switch (action) {
    case "UPDATE_PAGE_VISIBILITY": {
      const name = sectionName(resourceId);
      return `${a} changed ${name} page visibility to ${onOff(meta?.enabled)}`;
    }
    case "UPDATE_HOMEPAGE_SECTION_LIVE": {
      const mod = resourceId ?? "";
      const label = HOMEPAGE_MODULE_LABEL[mod] ?? (mod || "Homepage");
      return `${a} changed ${label} homepage section live to ${onOff(meta?.enabled)}`;
    }
    case "CREATE_BLOG":
      return `${a} created Blog post (${postName(meta)})`;
    case "UPDATE_BLOG":
      return `${a} updated Blog post (${postName(meta)})`;
    case "DELETE_BLOG":
      return `${a} deleted Blog post (${postName(meta)})`;
    case "CREATE_PAGE":
      return `${a} created page (${postName(meta)})`;
    case "UPDATE_PAGE":
      return `${a} updated page (${postName(meta)})`;
    case "DELETE_PAGE":
      return `${a} deleted page (${postName(meta)})`;
    case "UPDATE_SITE_SETTINGS": {
      const hint = s(meta, "siteName");
      return hint ? `${a} updated site settings (${hint})` : `${a} updated site settings`;
    }
    case "UPDATE_CONTACT_SETTINGS":
      return `${a} updated contact settings`;
    case "UPDATE_NAVIGATION": {
      const n = meta?.itemCount;
      return typeof n === "number"
        ? `${a} updated navigation (${n} items)`
        : `${a} updated navigation`;
    }
    case "UPDATE_FOOTER_LINKS": {
      const cols = meta?.columnCount;
      const links = meta?.linkCount;
      if (typeof cols === "number" && typeof links === "number") {
        return `${a} updated footer links (${cols} columns, ${links} links)`;
      }
      return `${a} updated footer links`;
    }
    case "DELETE_CONTACT_MESSAGE":
      return `${a} deleted a contact message`;
    case "UPDATE_CONTACT_MESSAGE_STATUS":
      return `${a} changed contact message status to ${s(meta, "status") || "updated"}`;
    case "DELETE_NEWSLETTER_SUBSCRIBER":
      return `${a} deleted a newsletter subscriber`;
    case "CREATE_ADMIN":
      return `${a} created admin user (${s(meta, "email") || s(meta, "name") || "new"})`;

    case "CREATE_SERVICE":
      return cmsItem(a, "created", "service", meta);
    case "UPDATE_SERVICE":
      return cmsItem(a, "updated", "service", meta);
    case "DELETE_SERVICE":
      return cmsItem(a, "deleted", "service", meta);

    case "CREATE_PORTFOLIO":
      return cmsItem(a, "created", "portfolio item", meta);
    case "UPDATE_PORTFOLIO":
      return cmsItem(a, "updated", "portfolio item", meta);

    case "UPDATE_TEAM_SECTION":
      return cmsSection(a, "team section settings", meta);
    case "CREATE_TEAM_MEMBER":
      return cmsItem(a, "created", "team member", meta);
    case "UPDATE_TEAM_MEMBER":
      return cmsItem(a, "updated", "team member", meta);
    case "DELETE_TEAM_MEMBER":
      return cmsItem(a, "deleted", "team member", meta);

    case "UPDATE_TESTIMONIALS_SECTION":
      return cmsSection(a, "testimonials section settings", meta);
    case "CREATE_TESTIMONIAL":
      return cmsItem(a, "created", "testimonial", meta);
    case "UPDATE_TESTIMONIAL":
      return cmsItem(a, "updated", "testimonial", meta);
    case "DELETE_TESTIMONIAL":
      return cmsItem(a, "deleted", "testimonial", meta);

    case "UPDATE_WHY_CHOOSE_US_SECTION":
      return cmsSection(a, "Why Choose Us section", meta);

    case "UPDATE_PRICING_SECTION":
      return cmsSection(a, "pricing section settings", meta);
    case "CREATE_PRICING_PLAN":
      return cmsItem(a, "created", "pricing plan", meta);
    case "UPDATE_PRICING_PLAN":
      return cmsItem(a, "updated", "pricing plan", meta);
    case "DELETE_PRICING_PLAN":
      return cmsItem(a, "deleted", "pricing plan", meta);

    case "UPDATE_HERO":
      return cmsSection(a, "homepage hero", meta);

    default:
      return `${a} performed ${action} on ${resource}`;
  }
}
