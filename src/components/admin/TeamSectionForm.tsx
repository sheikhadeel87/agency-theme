"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTeamSettings } from "@/lib/actions/team-actions";
import type { TeamSettingsData } from "@/lib/admin-data";
import { Search, Send } from "lucide-react";

type Props = {
  initialData: TeamSettingsData;
};

export function TeamSectionForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await saveTeamSettings(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Team section
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
                  placeholder="e.g. Meet With Our Creative Dedicated Team"
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
                  placeholder="Short intro text for the team section"
                  defaultValue={initialData.sectionDescription}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - SEO */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="size-4" />
              SEO
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="metaTitle"
                  className="mb-1 block text-xs font-medium text-foreground"
                >
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
                <label
                  htmlFor="metaDescription"
                  className="mb-1 block text-xs font-medium text-foreground"
                >
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
                <label
                  htmlFor="metaKeywords"
                  className="mb-1 block text-xs font-medium text-foreground"
                >
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
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={saving} className="gap-2">
          <Send className="size-4" />
          {saving ? "Saving…" : "Save section & SEO"}
        </Button>
      </div>
    </form>
  );
}
