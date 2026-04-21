"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveFeaturesHighlightsSettings } from "@/lib/actions/features-highlights-actions";
import type { FeaturesHighlightsSettingsData } from "@/lib/admin-data";
import {
  FEATURE_HIGHLIGHT_ICON_KEYS,
  FEATURE_HIGHLIGHT_VARIANTS,
  normalizeFeatureHighlightCards,
} from "@/lib/features-highlights-defaults";
import { openAdminPreview } from "@/lib/admin-preview";
import { SECTION_TITLE_DESCRIPTION_MAX_LENGTH } from "@/lib/section-title-description-limits";
import { cn } from "@/lib/utils";
import { Eye, Send } from "lucide-react";
import { toast } from "sonner";

type Props = {
  initialData: FeaturesHighlightsSettingsData;
};

const inputClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function clampCopy(s: string, max: number) {
  return (s ?? "").slice(0, max);
}

export function FeaturesHighlightsForm({ initialData }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const maxLen = SECTION_TITLE_DESCRIPTION_MAX_LENGTH;
  const itemsSignature = JSON.stringify(
    initialData.items.map((it) => [it.title, it.description, it.iconKey, it.variant])
  );
  const [persistedSig, setPersistedSig] = useState(itemsSignature);
  const [cardText, setCardText] = useState(() =>
    initialData.items.map((it) => ({
      title: clampCopy(it.title, maxLen),
      description: clampCopy(it.description, maxLen),
    }))
  );

  if (itemsSignature !== persistedSig) {
    setPersistedSig(itemsSignature);
    setCardText(
      initialData.items.map((it) => ({
        title: clampCopy(it.title, maxLen),
        description: clampCopy(it.description, maxLen),
      }))
    );
  }

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await saveFeaturesHighlightsSettings(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Support section saved.");
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const raw: unknown[] = [];
    for (let i = 0; i < 3; i++) {
      raw.push({
        title: cardText[i]?.title ?? "",
        description: cardText[i]?.description ?? "",
        iconKey: fd.get(`item_${i}_iconKey`)?.toString()?.trim() ?? "",
        variant: fd.get(`item_${i}_variant`)?.toString()?.trim() ?? "",
      });
    }
    const items = normalizeFeatureHighlightCards(raw);
    openAdminPreview("features-highlights", { items });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Three cards shown on the homepage (<code className="rounded bg-muted px-1">/#support</code>
        ). Each card title and description are limited to {maxLen} characters (same as Team and
        Testimonials section copy). Icon and color presets match the public layout.
      </p>

      {initialData.items.map((item, i) => {
        const t = cardText[i] ?? { title: "", description: "" };
        const titleAtCap = t.title.length >= maxLen;
        const descAtCap = t.description.length >= maxLen;
        return (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm ring-1 ring-foreground/5"
          >
            <h3 className="text-sm font-semibold text-foreground">Card {i + 1}</h3>
            <div>
              <label htmlFor={`item_${i}_title`} className="mb-1 block text-sm font-medium">
                Title
              </label>
              <Input
                id={`item_${i}_title`}
                name={`item_${i}_title`}
                value={t.title}
                maxLength={maxLen}
                onChange={(e) => {
                  const v = clampCopy(e.target.value, maxLen);
                  setCardText((prev) =>
                    prev.map((c, j) => (j === i ? { ...c, title: v } : c))
                  );
                }}
                className={cn("max-w-xl", titleAtCap && "border-amber-500/60")}
              />
              <p
                className={cn(
                  "mt-1 text-[10px] tabular-nums text-muted-foreground",
                  titleAtCap && "font-medium text-amber-800 dark:text-amber-200"
                )}
              >
                {t.title.length} / {maxLen} characters
                {titleAtCap ? " — maximum length" : ""}
              </p>
            </div>
            <div>
              <label htmlFor={`item_${i}_description`} className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                id={`item_${i}_description`}
                name={`item_${i}_description`}
                rows={3}
                value={t.description}
                maxLength={maxLen}
                onChange={(e) => {
                  const v = clampCopy(e.target.value, maxLen);
                  setCardText((prev) =>
                    prev.map((c, j) => (j === i ? { ...c, description: v } : c))
                  );
                }}
                className={cn(`${inputClass} max-w-2xl resize-y`, descAtCap && "border-amber-500/60")}
              />
              <p
                className={cn(
                  "mt-1 text-[10px] tabular-nums text-muted-foreground",
                  descAtCap && "font-medium text-amber-800 dark:text-amber-200"
                )}
              >
                {t.description.length} / {maxLen} characters
                {descAtCap ? " — maximum length" : ""}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`item_${i}_iconKey`} className="mb-1 block text-sm font-medium">
                  Icon
                </label>
                <select
                  id={`item_${i}_iconKey`}
                  name={`item_${i}_iconKey`}
                  defaultValue={item.iconKey}
                  className={inputClass}
                >
                  {FEATURE_HIGHLIGHT_ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`item_${i}_variant`} className="mb-1 block text-sm font-medium">
                  Color
                </label>
                <select
                  id={`item_${i}_variant`}
                  name={`item_${i}_variant`}
                  defaultValue={item.variant}
                  className={inputClass}
                >
                  {FEATURE_HIGHLIGHT_VARIANTS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      })}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          <Send className="size-4" />
          {saving ? "Saving…" : "Save support section"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/homepage")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
