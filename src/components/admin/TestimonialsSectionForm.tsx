"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeoMetaInputs } from "@/components/admin/SeoMetaInputs";
import { saveTestimonialsSettings } from "@/lib/actions/testimonials-actions";
import type { TestimonialsSettingsData } from "@/lib/admin-data";
import { openAdminPreview } from "@/lib/admin-preview";
import { Eye, Search, Send } from "lucide-react";
import { toast } from "sonner";
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
      toast.error(result.error);
      return;
    }
    toast.success("Testimonials section saved.");
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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Section & SEO</h2>

      <div className="space-y-6">
        {/* 1. Live site */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Live site
          </h3>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="min-w-0 text-sm font-medium text-foreground">
              Show testimonials on the live homepage
            </p>
            <input type="hidden" name="isEnabled" value={sectionEnabled ? "on" : ""} />
            <Toggle enabled={sectionEnabled} onChange={setSectionEnabled} className="shrink-0 sm:ml-auto" />
          </div>
        </div>

        {/* 2. Testimonials section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Testimonials section
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

        {/* 3. SEO */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Search className="size-4" />
            SEO
          </h3>
          <SeoMetaInputs
            metaTitleDefault={initialData.metaTitle}
            metaDescriptionDefault={initialData.metaDescription}
            metaKeywordsDefault={initialData.metaKeywords}
            titlePlaceholder="Defaults to section title"
            descriptionPlaceholder="Keep under 160 characters."
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center">
          <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Send className="size-4" />
            {saving ? "Saving…" : "Save section & SEO"}
          </Button>
        </div>
      </div>
    </form>
  );
}
