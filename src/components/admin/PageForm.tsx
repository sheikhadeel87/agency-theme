"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { SeoMetaInputs } from "@/components/admin/SeoMetaInputs";
import { savePage } from "@/lib/actions/page-actions";
import type { DynamicPage } from "@/lib/admin-data";
import { openAdminPreview } from "@/lib/admin-preview";
import { Eye, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";

const defaultValues: Omit<DynamicPage, "_id"> = {
  title: "",
  slug: "",
  template: "Default",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  status: "draft",
  isEnabled: true,
};

type Props = {
  initialData?: DynamicPage | null;
};

export function PageForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(initialData?.content ?? defaultValues.content);
  const data = initialData ?? { ...defaultValues, _id: "" };
  const [published, setPublished] = useState(data.status === "published");
  const [liveEnabled, setLiveEnabled] = useState(data.isEnabled !== false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("content", content);
    formData.set("is_published", published ? "on" : "false");
    formData.set("isEnabled", liveEnabled ? "on" : "false");
    const result = await savePage(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Page saved.");
    router.push("/admin/pages");
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    openAdminPreview("cms-page", {
      title: String(fd.get("title") ?? ""),
      content,
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {data._id && (
        <input type="hidden" name="_id" value={data._id} readOnly />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Page
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. About Us"
                  defaultValue={data.title}
                  className="h-11 text-base"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Slug is auto-generated from the title if left blank
                </p>
              </div>
              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-foreground">
                  Slug
                </label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="about"
                  defaultValue={data.slug}
                  className="h-10 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  URL path: /{data.slug || "slug"}
                </p>
              </div>
              <div>
                <label htmlFor="template" className="mb-1.5 block text-sm font-medium text-foreground">
                  Template
                </label>
                <select
                  id="template"
                  name="template"
                  defaultValue={data.template}
                  className="h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                >
                  <option value="Default">Default</option>
                  <option value="Landing">Landing</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Content
                </label>
                <BlogEditor
                  defaultValue={data.content}
                  onContentChange={setContent}
                  placeholder="Page body content (optional)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Publish
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Published</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Published pages appear in the site’s Pages dropdown and are visible at their URL.
                  </p>
                </div>
                <input type="hidden" name="is_published" value={published ? "on" : ""} />
                <Toggle enabled={published} onChange={setPublished} className="shrink-0 sm:ml-auto" />
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Show on live site</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    When off, the page is hidden from navigation and returns 404 on the public site (draft or
                    published).
                  </p>
                </div>
                <input type="hidden" name="isEnabled" value={liveEnabled ? "on" : ""} />
                <Toggle enabled={liveEnabled} onChange={setLiveEnabled} className="shrink-0 sm:ml-auto" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="size-4" />
              SEO
            </h3>
            <SeoMetaInputs
              metaTitleDefault={data.metaTitle}
              metaDescriptionDefault={data.metaDescription}
              metaKeywordsDefault={data.metaKeywords}
              titlePlaceholder="Defaults to page title"
              descriptionPlaceholder="Keep under 160 characters."
            />
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

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="submit" className="gap-2">
          <Send className="size-4" />
          Save page
        </Button>
        <Link
          href="/admin/pages"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
