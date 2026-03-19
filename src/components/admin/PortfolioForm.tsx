"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePortfolio } from "@/lib/actions/portfolio-actions";
import { BlogEditor } from "@/components/admin/BlogEditor";
import type { PortfolioProject } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { ImageUp, Search, Send, X } from "lucide-react";

const defaultValues: Omit<PortfolioProject, "_id"> = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  client: "",
  categories: [],
  technologyStack: [],
  imageUrl: "",
  galleryImages: [],
  projectUrl: "",
  status: "Draft",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  featuredOnHomepage: false,
};

type Props = {
  initialData?: PortfolioProject | null;
};

export function PortfolioForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fullDescription, setFullDescription] = useState(
    initialData?.fullDescription ?? defaultValues.fullDescription
  );
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = initialData ?? defaultValues;
  const categoriesStr = Array.isArray(data.categories) ? data.categories.join(", ") : "";
  const techStr = Array.isArray(data.technologyStack) ? data.technologyStack.join(", ") : "";
  const galleryStr = Array.isArray(data.galleryImages) ? data.galleryImages.join(", ") : "";

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(data.imageUrl || null);
    }
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
    formData.set("fullDescription", fullDescription);
    const result = await savePortfolio(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/portfolio");
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
              Project
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Project title"
                  defaultValue={data.title}
                  className="h-11 text-base"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Slug is auto-generated from the title
                </p>
              </div>
              <div>
                <label
                  htmlFor="shortDescription"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Short description
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  placeholder="Brief summary"
                  defaultValue={data.shortDescription}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Full description
                </label>
                <BlogEditor
                  defaultValue={data.fullDescription}
                  onContentChange={setFullDescription}
                  placeholder="Full project description..."
                />
              </div>
              <div>
                <label htmlFor="client" className="mb-1.5 block text-sm font-medium text-foreground">
                  Client
                </label>
                <Input
                  id="client"
                  name="client"
                  placeholder="Client name"
                  defaultValue={data.client}
                  className="h-10"
                />
              </div>
              <div>
                <label
                  htmlFor="categories"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Categories (comma-separated)
                </label>
                <Input
                  id="categories"
                  name="categories"
                  placeholder="Web, Branding, Product"
                  defaultValue={categoriesStr}
                  className="h-10"
                />
              </div>
              <div>
                <label
                  htmlFor="technologyStack"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Technology stack (comma-separated)
                </label>
                <Input
                  id="technologyStack"
                  name="technologyStack"
                  placeholder="React, Node.js"
                  defaultValue={techStr}
                  className="h-10"
                />
              </div>
              <div>
                <label
                  htmlFor="galleryImages"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Gallery image URLs (comma-separated)
                </label>
                <Input
                  id="galleryImages"
                  name="galleryImages"
                  placeholder="https://..., https://..."
                  defaultValue={galleryStr}
                  className="h-10"
                />
              </div>
              <div>
                <label
                  htmlFor="projectUrl"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Project URL
                </label>
                <Input
                  id="projectUrl"
                  name="projectUrl"
                  placeholder="https://..."
                  defaultValue={data.projectUrl}
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured image */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ImageUp className="size-4" />
              Featured image
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
                  <Image src={data.imageUrl} alt="" fill className="object-cover" unoptimized={shouldUseUnoptimizedImage(data.imageUrl)} />
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
          </div>

          {/* Publish */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Publish
            </h3>
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={data.status}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                name="featuredOnHomepage"
                defaultChecked={data.featuredOnHomepage}
                className="size-4 rounded border-input"
              />
              <span className="text-sm font-medium">Show on homepage</span>
            </label>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Homepage shows up to 3 published projects: checked first (newest), then the latest others.
            </p>
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
                  placeholder="Defaults to project title"
                  defaultValue={data.metaTitle ?? data.title}
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
                  placeholder="Defaults to short description. Keep under 160 characters."
                  defaultValue={data.metaDescription ?? data.shortDescription}
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
          Save project
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/portfolio")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
