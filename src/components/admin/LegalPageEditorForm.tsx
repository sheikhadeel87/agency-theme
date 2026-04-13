"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { SeoMetaInputs } from "@/components/admin/SeoMetaInputs";
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
      toast.error(result.error);
      return;
    }
    toast.success(`${pageTitle} saved.`);
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
              <Link href={publicPath} className="font-medium text-primary underline-offset-4 hover:underline">
                {publicPath}
              </Link>
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
            <SeoMetaInputs
              metaTitleDefault={initialMetaTitle}
              metaDescriptionDefault={initialMetaDescription}
              metaKeywordsDefault={initialMetaKeywords}
              titlePlaceholder={`Defaults to “${pageTitle}”`}
              descriptionPlaceholder="Keep under 160 characters."
            />
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
