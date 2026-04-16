"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SECTION_TITLE_DESCRIPTION_MAX_LENGTH } from "@/lib/section-title-description-limits";
import { cn } from "@/lib/utils";

export function useSyncedSectionTitleDescription(
  persistedTitle: string,
  persistedDescription: string
) {
  const maxLength = SECTION_TITLE_DESCRIPTION_MAX_LENGTH;
  const clamp = (s: string) => s.slice(0, maxLength);
  const [title, setTitle] = useState(() => clamp(persistedTitle ?? ""));
  const [description, setDescription] = useState(() => clamp(persistedDescription ?? ""));
  const [prev, setPrev] = useState({
    t: persistedTitle ?? "",
    d: persistedDescription ?? "",
  });
  const pt = persistedTitle ?? "";
  const pd = persistedDescription ?? "";
  if (pt !== prev.t || pd !== prev.d) {
    setPrev({ t: pt, d: pd });
    setTitle(clamp(pt));
    setDescription(clamp(pd));
  }
  return {
    title,
    description,
    setTitle: (v: string) => setTitle(clamp(v)),
    setDescription: (v: string) => setDescription(clamp(v)),
    titleAtCap: title.length >= maxLength,
    descAtCap: description.length >= maxLength,
    maxLength,
  };
}

type SectionTitleDescriptionFieldsProps = {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleAtCap: boolean;
  descAtCap: boolean;
  maxLength: number;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  textareaRows?: number;
};

export function SectionTitleDescriptionFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  titleAtCap,
  descAtCap,
  maxLength,
  titlePlaceholder,
  descriptionPlaceholder,
  textareaRows = 4,
}: SectionTitleDescriptionFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="sectionTitle" className="mb-1.5 block text-sm font-medium text-foreground">
          Section title
        </label>
        <Input
          id="sectionTitle"
          name="sectionTitle"
          value={title}
          maxLength={maxLength}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          className={cn("h-11 text-base", titleAtCap && "border-amber-500/60")}
        />
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums text-muted-foreground",
            titleAtCap && "font-medium text-amber-800 dark:text-amber-200"
          )}
        >
          {title.length} / {maxLength} characters
          {titleAtCap ? " — maximum length" : ""}
        </p>
      </div>
      <div>
        <label
          htmlFor="sectionDescription"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Section description
        </label>
        <textarea
          id="sectionDescription"
          name="sectionDescription"
          value={description}
          maxLength={maxLength}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={descriptionPlaceholder}
          rows={textareaRows}
          className={cn(
            "w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50",
            descAtCap && "border-amber-500/60"
          )}
        />
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums text-muted-foreground",
            descAtCap && "font-medium text-amber-800 dark:text-amber-200"
          )}
        >
          {description.length} / {maxLength} characters
          {descAtCap ? " — maximum length" : ""}
        </p>
      </div>
    </div>
  );
}
