"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveService } from "@/lib/actions/service-actions";
import {
  countWordsFromHtml,
  SERVICE_DESCRIPTION_MAX_WORDS,
} from "@/lib/word-count";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { SeoMetaInputs } from "@/components/admin/SeoMetaInputs";
import type { ServiceItem } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { openAdminPreview, resolvePreviewImageUrl } from "@/lib/admin-preview";
import { Eye, ImageUp, Search, Send, X } from "lucide-react";
import { toast } from "sonner";

const defaultValues: Omit<ServiceItem, "_id"> = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  status: "Draft",
  featuredOnHomepage: false,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

type Props = {
  initialData?: ServiceItem | null;
};

export function ServiceForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(initialData?.description ?? defaultValues.description);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);

  const data = initialData ?? defaultValues;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(data.imageUrl || null);
  }

  function clearImage() {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("description", description);
    const words = countWordsFromHtml(description);
    if (words > SERVICE_DESCRIPTION_MAX_WORDS) {
      const msg = `Description must be at most ${SERVICE_DESCRIPTION_MAX_WORDS} words (currently ${words}).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    const result = await saveService(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Service saved.");
    router.push("/admin/services");
    router.refresh();
  }

  async function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const file = fileInputRef.current?.files?.[0];
    const imageUrl = await resolvePreviewImageUrl(file, imagePreview, data.imageUrl);
    openAdminPreview("service", {
      title: String(fd.get("title") ?? ""),
      description,
      imageUrl,
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
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
                <p className="mb-1.5 text-xs text-muted-foreground">
                  Maximum {SERVICE_DESCRIPTION_MAX_WORDS} words (shown in the editor toolbar).
                </p>
                <BlogEditor
                  defaultValue={data.description}
                  onContentChange={setDescription}
                  placeholder="Describe the service..."
                  statsMode="words"
                  maxWords={SERVICE_DESCRIPTION_MAX_WORDS}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ImageUp className="size-4" />
              Image
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("blob:")}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <ImageUp className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Upload image
                </span>
              </button>
            )}
            {data.imageUrl && !imagePreview && (
              <div className="mt-2 flex gap-2">
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded border">
                  <Image
                    src={data.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={shouldUseUnoptimizedImage(data.imageUrl)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Replace
                </Button>
              </div>
            )}
            {data.imageUrl && (
              <input type="hidden" name="imageUrl" value={data.imageUrl} readOnly />
            )}
          </div>

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
            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                name="featuredOnHomepage"
                defaultChecked={data.featuredOnHomepage}
                className="size-4 rounded border-input"
              />
              <span className="text-sm font-medium">Show on homepage</span>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Homepage shows up to 3 published services: checked items first (newest), then the latest others.
            </p>
          </div>

          {/* SEO */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="size-4" />
              SEO
            </h3>
            <SeoMetaInputs
              metaTitleDefault={data.metaTitle}
              metaDescriptionDefault={data.metaDescription}
              metaKeywordsDefault={data.metaKeywords}
              titlePlaceholder="Defaults to service title"
              descriptionPlaceholder="Defaults to description. Up to 160 characters."
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
        <Button type="button" variant="outline" className="gap-2" onClick={() => void handlePreview()}>
          <Eye className="size-4" />
          Preview
        </Button>
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
