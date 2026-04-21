import { SECTION_TITLE_DESCRIPTION_MAX_LENGTH } from "@/lib/section-title-description-limits";

export const FEATURE_HIGHLIGHT_ICON_KEYS = [
  "lifebuoy",
  "target",
  "users",
  "sparkles",
  "shield",
] as const;

export type FeatureHighlightIconKey = (typeof FEATURE_HIGHLIGHT_ICON_KEYS)[number];

export const FEATURE_HIGHLIGHT_VARIANTS = ["blue", "amber", "emerald"] as const;

export type FeatureHighlightVariant = (typeof FEATURE_HIGHLIGHT_VARIANTS)[number];

export type FeatureHighlightCard = {
  title: string;
  description: string;
  iconKey: FeatureHighlightIconKey;
  variant: FeatureHighlightVariant;
};

const COPY_MAX = SECTION_TITLE_DESCRIPTION_MAX_LENGTH;

function isIconKey(v: unknown): v is FeatureHighlightIconKey {
  return (
    typeof v === "string" &&
    (FEATURE_HIGHLIGHT_ICON_KEYS as readonly string[]).includes(v)
  );
}

function isVariant(v: unknown): v is FeatureHighlightVariant {
  return (
    typeof v === "string" && (FEATURE_HIGHLIGHT_VARIANTS as readonly string[]).includes(v)
  );
}

export function defaultFeatureHighlightCards(): FeatureHighlightCard[] {
  return [
    {
      title: "24/7 Support",
      description: "Lorem ipsum dolor sit amet conse adipiscing elit.",
      iconKey: "lifebuoy",
      variant: "blue",
    },
    {
      title: "Take Ownership",
      description: "Lorem ipsum dolor sit amet conse adipiscing elit.",
      iconKey: "target",
      variant: "amber",
    },
    {
      title: "Team Work",
      description: "Lorem ipsum dolor sit amet conse adipiscing elit.",
      iconKey: "users",
      variant: "emerald",
    },
  ];
}

/** Always returns exactly three cards for the homepage grid. */
export function normalizeFeatureHighlightCards(input: unknown): FeatureHighlightCard[] {
  const defs = defaultFeatureHighlightCards();
  if (!Array.isArray(input)) return defs;
  const out: FeatureHighlightCard[] = [];
  for (let i = 0; i < 3; i++) {
    const row = input[i];
    const d = defs[i] ?? defs[0]!;
    if (!row || typeof row !== "object") {
      out.push({ ...d });
      continue;
    }
    const o = row as Record<string, unknown>;
    const titleRaw =
      typeof o.title === "string" ? o.title.trim().slice(0, COPY_MAX) : d.title;
    const descRaw =
      typeof o.description === "string"
        ? o.description.trim().slice(0, COPY_MAX)
        : d.description;
    const iconKey = isIconKey(o.iconKey) ? o.iconKey : d.iconKey;
    const variant = isVariant(o.variant) ? o.variant : d.variant;
    out.push({
      title: titleRaw || d.title,
      description: descRaw || d.description,
      iconKey,
      variant,
    });
  }
  return out;
}
