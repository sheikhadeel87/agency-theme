"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBlog } from "@/lib/actions/blog-actions";
import { BlogEditor } from "@/components/admin/BlogEditor";
import type { BlogPost } from "@/lib/admin-data";
import { ImageUp, Search, Send, X } from "lucide-react";

const defaultValues: Omit<BlogPost, "_id" | "createdAt" | "updatedAt" | "publishedAt"> = {
  title: "",
  slug: "",
  description: "",
  content: "",
  author: "",
  imageUrl: "",
  is_featured: false,
  is_published: false,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
};

type Props = {
  initialData?: BlogPost | null;
};

export function BlogForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(initialData?.content ?? defaultValues.content);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = initialData ?? defaultValues;

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
    formData.set("content", content);
    const result = await saveBlog(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/blog");
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
              Post
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter post title"
                  defaultValue={data.title}
                  className="h-11 text-base"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Slug is auto-generated from the title
                </p>
              </div>
              <div>
                <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-foreground">
                  Author
                </label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Author name"
                  defaultValue={data.author}
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Excerpt
                </label>
                <textarea
                  name="description"
                  placeholder="Short summary for cards and search results"
                  defaultValue={data.description}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Content
                </label>
                <BlogEditor
                  defaultValue={data.content}
                  onContentChange={setContent}
                  placeholder="Write your post..."
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
                  <Image src={data.imageUrl} alt="" fill className="object-cover" unoptimized />
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
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={data.is_published}
                  className="size-4 rounded border-input"
                />
                <span className="text-sm font-medium">Published</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={data.is_featured}
                  className="size-4 rounded border-input"
                />
                <span className="text-sm font-medium">Featured post</span>
              </label>
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
                  placeholder="Defaults to post title"
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
                  placeholder="Defaults to excerpt. Keep under 160 characters for best results."
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
              <div>
                <label htmlFor="ogImage" className="mb-1 block text-xs font-medium text-foreground">
                  OG image URL
                </label>
                <Input
                  id="ogImage"
                  name="ogImage"
                  placeholder="Optional; defaults to featured image"
                  defaultValue={data.ogImage}
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
          Save post
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
