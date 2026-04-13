"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  clampCommaSeparatedKeywords,
  parseMetaKeywords,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_KEYWORDS_INPUT_MAX_LENGTH,
  SEO_KEYWORDS_MAX_COUNT,
  SEO_TITLE_MAX_LENGTH,
} from "@/lib/seo-metadata";

type Props = {
  metaTitleDefault?: string;
  metaDescriptionDefault?: string;
  metaKeywordsDefault?: string;
  titleId?: string;
  descriptionId?: string;
  keywordsId?: string;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  className?: string;
};

export function SeoMetaInputs({
  metaTitleDefault = "",
  metaDescriptionDefault = "",
  metaKeywordsDefault = "",
  titleId = "metaTitle",
  descriptionId = "metaDescription",
  keywordsId = "metaKeywords",
  titlePlaceholder = "SEO title (search engines)",
  descriptionPlaceholder = `Search snippet — up to ${SEO_DESCRIPTION_MAX_LENGTH} characters.`,
  className,
}: Props) {
  const [title, setTitle] = useState(metaTitleDefault);
  const [desc, setDesc] = useState(metaDescriptionDefault);
  const [kw, setKw] = useState(metaKeywordsDefault);

  useEffect(() => {
    setTitle(metaTitleDefault.slice(0, SEO_TITLE_MAX_LENGTH));
    setDesc(metaDescriptionDefault.slice(0, SEO_DESCRIPTION_MAX_LENGTH));
    setKw(clampCommaSeparatedKeywords(metaKeywordsDefault));
  }, [metaTitleDefault, metaDescriptionDefault, metaKeywordsDefault]);

  const kwCount = parseMetaKeywords(kw).length;
  const kwOver = kwCount >= SEO_KEYWORDS_MAX_COUNT;
  const titleAtCap = title.length >= SEO_TITLE_MAX_LENGTH;
  const descAtCap = desc.length >= SEO_DESCRIPTION_MAX_LENGTH;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label htmlFor={titleId} className="mb-1 block text-xs font-medium text-foreground">
          Meta title
        </label>
        <Input
          id={titleId}
          name="metaTitle"
          value={title}
          maxLength={SEO_TITLE_MAX_LENGTH}
          onChange={(e) => setTitle(e.target.value.slice(0, SEO_TITLE_MAX_LENGTH))}
          placeholder={titlePlaceholder}
          className={cn("h-9 text-sm", titleAtCap && "border-amber-500/60")}
        />
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums text-muted-foreground",
            titleAtCap && "font-medium text-amber-800 dark:text-amber-200"
          )}
        >
          {title.length} / {SEO_TITLE_MAX_LENGTH} characters
          {titleAtCap ? " — maximum length" : ""}
        </p>
      </div>
      <div>
        <label htmlFor={descriptionId} className="mb-1 block text-xs font-medium text-foreground">
          Meta description
        </label>
        <textarea
          id={descriptionId}
          name="metaDescription"
          value={desc}
          maxLength={SEO_DESCRIPTION_MAX_LENGTH}
          onChange={(e) => setDesc(e.target.value.slice(0, SEO_DESCRIPTION_MAX_LENGTH))}
          placeholder={descriptionPlaceholder}
          rows={3}
          className={cn(
            "w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50",
            descAtCap && "border-amber-500/60"
          )}
        />
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums text-muted-foreground",
            descAtCap && "font-medium text-amber-800 dark:text-amber-200"
          )}
        >
          {desc.length} / {SEO_DESCRIPTION_MAX_LENGTH} characters
          {descAtCap ? " — maximum length" : ""}
        </p>
      </div>
      <div>
        <label htmlFor={keywordsId} className="mb-1 block text-xs font-medium text-foreground">
          Meta keywords
        </label>
        <Input
          id={keywordsId}
          name="metaKeywords"
          value={kw}
          maxLength={SEO_KEYWORDS_INPUT_MAX_LENGTH}
          onChange={(e) =>
            setKw(clampCommaSeparatedKeywords(e.target.value.slice(0, SEO_KEYWORDS_INPUT_MAX_LENGTH)))
          }
          placeholder="keyword1, keyword2, keyword3"
          className={cn("h-9 text-sm", kwOver && "border-amber-500/60")}
        />
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums text-muted-foreground",
            kwOver && "font-medium text-amber-800 dark:text-amber-200"
          )}
        >
          {kwCount} / {SEO_KEYWORDS_MAX_COUNT} keywords · {kw.length} / {SEO_KEYWORDS_INPUT_MAX_LENGTH}{" "}
          characters (comma-separated; extras dropped)
        </p>
      </div>
    </div>
  );
}
