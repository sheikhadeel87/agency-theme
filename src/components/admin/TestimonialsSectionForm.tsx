"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTestimonialsSettings } from "@/lib/actions/testimonials-actions";
import type { TestimonialsSettingsData } from "@/lib/admin-data";
import { openAdminPreview } from "@/lib/admin-preview";
import { Eye, Search, Send } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

type Props = {
  initialData: TestimonialsSettingsData;
};

export function TestimonialsSectionForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sectionEnabled, setSectionEnabled] = useState(initialData.isEnabled !== false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("isEnabled", sectionEnabled ? "on" : "false");
    const result = await saveTestimonialsSettings(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    openAdminPreview("testimonials-section", {
      sectionTitle: String(fd.get("sectionTitle") ?? ""),
      sectionDescription: String(fd.get("sectionDescription") ?? ""),
      metaTitle: String(fd.get("metaTitle") ?? ""),
      metaDescription: String(fd.get("metaDescription") ?? ""),
      metaKeywords: String(fd.get("metaKeywords") ?? ""),
      isEnabled: sectionEnabled,
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Section
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sectionTitle"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Section title
                </label>
                <Input
                  id="sectionTitle"
                  name="sectionTitle"
                  placeholder="e.g. Client's Testimonials"
                  defaultValue={initialData.sectionTitle}
                  className="h-11 text-base"
                />
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
                  placeholder="Short intro for the testimonials block"
                  defaultValue={initialData.sectionDescription}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Live site
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30">
              <p className="min-w-0 text-sm font-medium text-foreground">Show testimonials on the live homepage</p>
              <input type="hidden" name="isEnabled" value={sectionEnabled ? "on" : ""} />
              <Toggle enabled={sectionEnabled} onChange={setSectionEnabled} className="shrink-0 sm:ml-auto" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="size-4" />
              SEO
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="metaTitle" className="mb-1 block text-xs font-medium text-foreground">
                  Meta title
                </label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  placeholder="Defaults to section title"
                  defaultValue={initialData.metaTitle}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label htmlFor="metaDescription" className="mb-1 block text-xs font-medium text-foreground">
                  Meta description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  placeholder="Keep under 160 characters."
                  defaultValue={initialData.metaDescription}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div>
                <label htmlFor="metaKeywords" className="mb-1 block text-xs font-medium text-foreground">
                  Meta keywords
                </label>
                <Input
                  id="metaKeywords"
                  name="metaKeywords"
                  placeholder="keyword1, keyword2, keyword3"
                  defaultValue={initialData.metaKeywords}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          <Send className="size-4" />
          {saving ? "Saving…" : "Save section & SEO"}
        </Button>
      </div>
    </form>
  );
}
