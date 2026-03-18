"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveService } from "@/lib/actions/service-actions";
import { BlogEditor } from "@/components/admin/BlogEditor";
import type { ServiceItem } from "@/lib/admin-data";
import { Search, Send } from "lucide-react";

const defaultValues: Omit<ServiceItem, "_id"> = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  status: "Draft",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

type Props = {
  initialData?: ServiceItem | null;
};

export function ServiceForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(initialData?.description ?? defaultValues.description);

  const data = initialData ?? defaultValues;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("description", description);
    const result = await saveService(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {initialData?._id && (
        <input type="hidden" name="_id" value={initialData._id} readOnly />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Service
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Web Development"
                  defaultValue={data.title}
                  className="h-11 text-base"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Slug is auto-generated from the title
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <BlogEditor
                  defaultValue={data.description}
                  onContentChange={setDescription}
                  placeholder="Describe the service..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Publish
            </h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Status
              </label>
              <select
                name="status"
                defaultValue={data.status}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          {/* SEO */}
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
                  placeholder="Defaults to service title"
                  defaultValue={data.metaTitle}
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
                  placeholder="Defaults to description. Keep under 160 characters for best results."
                  defaultValue={data.metaDescription}
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
                  defaultValue={data.metaKeywords}
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
        <Button type="submit" className="gap-2">
          <Send className="size-4" />
          {initialData ? "Save service" : "Create service"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/services")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
