"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { saveLegalPage } from "@/lib/actions/legal-actions";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

export type LegalEditorKind = "privacy" | "terms";

type Props = {
  kind: LegalEditorKind;
  pageTitle: string;
  initialContent: string;
  initialLastUpdated: string;
  initialMetaTitle: string;
  initialMetaDescription: string;
  initialMetaKeywords: string;
  publicPath: string;
};

export function LegalPageEditorForm({
  kind,
  pageTitle,
  initialContent,
  initialLastUpdated,
  initialMetaTitle,
  initialMetaDescription,
  initialMetaKeywords,
  publicPath,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("content", content);
    const result = await saveLegalPage(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-8">
      <input type="hidden" name="kind" value={kind} readOnly />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {pageTitle}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This HTML is shown on{" "}
              <a href={publicPath} className="font-medium text-primary underline-offset-4 hover:underline">
                {publicPath}
              </a>
              . Leave empty to use the built-in default copy on the live site.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="lastUpdated" className="mb-1.5 block text-sm font-medium text-foreground">
                  Last updated (display)
                </label>
                <Input
                  id="lastUpdated"
                  name="lastUpdated"
                  placeholder={`e.g. March ${new Date().getFullYear()}`}
                  defaultValue={initialLastUpdated}
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Body (HTML)</label>
                <BlogEditor
                  defaultValue={initialContent}
                  onContentChange={setContent}
                  placeholder="Use the editor for headings, lists, and paragraphs…"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">SEO</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="metaTitle" className="mb-1 block text-xs font-medium text-foreground">
                  Meta title
                </label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  placeholder={`Defaults to “${pageTitle}”`}
                  defaultValue={initialMetaTitle}
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
                  rows={3}
                  placeholder="Keep under 160 characters."
                  defaultValue={initialMetaDescription}
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
                  placeholder="keyword1, keyword2"
                  defaultValue={initialMetaKeywords}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" className="gap-2" disabled={saving}>
          <Send className="size-4" />
          {saving ? "Saving…" : "Save"}
        </Button>
        <Link href="/admin/legal" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to Legal
        </Link>
      </div>
    </form>
  );
}
