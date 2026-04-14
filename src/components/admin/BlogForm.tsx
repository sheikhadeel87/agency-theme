"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBlog } from "@/lib/actions/blog-actions";
import {
  BLOG_POST_BODY_MAX_WORDS,
  BLOG_POST_EXCERPT_MAX_WORDS,
  clampPlainTextToMaxWords,
  countWordsFromHtml,
  countWordsFromPlainText,
} from "@/lib/word-count";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { SeoMetaInputs } from "@/components/admin/SeoMetaInputs";
import type { BlogPost } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import {
  isFormCheckboxChecked,
  openAdminPreview,
  resolvePreviewImageUrl,
} from "@/lib/admin-preview";
import { Eye, ImageUp, Search, Send, X } from "lucide-react";
import { toast } from "sonner";

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
  const [excerpt, setExcerpt] = useState(initialData?.description ?? defaultValues.description);
  const [content, setContent] = useState(initialData?.content ?? defaultValues.content);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    formData.set("description", excerpt);
    formData.set("content", content);
    const excerptWords = countWordsFromPlainText(excerpt);
    if (excerptWords > BLOG_POST_EXCERPT_MAX_WORDS) {
      const msg = `Excerpt must be at most ${BLOG_POST_EXCERPT_MAX_WORDS} words (currently ${excerptWords}).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    const contentWords = countWordsFromHtml(content);
    if (contentWords > BLOG_POST_BODY_MAX_WORDS) {
      const msg = `Post content must be at most ${BLOG_POST_BODY_MAX_WORDS} words (currently ${contentWords}).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    const result = await saveBlog(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Post saved.");
    router.push("/admin/blog");
    router.refresh();
  }

  async function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("description", excerpt);
    const excerptWords = countWordsFromPlainText(excerpt);
    if (excerptWords > BLOG_POST_EXCERPT_MAX_WORDS) {
      setError(
        `Excerpt must be at most ${BLOG_POST_EXCERPT_MAX_WORDS} words (currently ${excerptWords}).`
      );
      return;
    }
    const contentWords = countWordsFromHtml(content);
    if (contentWords > BLOG_POST_BODY_MAX_WORDS) {
      setError(
        `Post content must be at most ${BLOG_POST_BODY_MAX_WORDS} words (currently ${contentWords}).`
      );
      return;
    }
    setError(null);
    const file = fileInputRef.current?.files?.[0];
    const imageUrl = await resolvePreviewImageUrl(file, imagePreview, data.imageUrl);
    openAdminPreview("blog", {
      title: String(fd.get("title") ?? ""),
      author: String(fd.get("author") ?? ""),
      description: excerpt,
      content,
      imageUrl,
      is_featured: isFormCheckboxChecked(form, "is_featured"),
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
                <p className="mb-1.5 text-xs text-muted-foreground">
                  Maximum {BLOG_POST_EXCERPT_MAX_WORDS} words.
                </p>
                <textarea
                  name="description"
                  value={excerpt}
                  onChange={(e) =>
                    setExcerpt(
                      clampPlainTextToMaxWords(
                        e.target.value,
                        BLOG_POST_EXCERPT_MAX_WORDS
                      )
                    )
                  }
                  placeholder="Short summary for cards and search results"
                  rows={3}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
                <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                  {countWordsFromPlainText(excerpt)} / {BLOG_POST_EXCERPT_MAX_WORDS} words
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Content
                </label>
                <p className="mb-1.5 text-xs text-muted-foreground">
                  Maximum {BLOG_POST_BODY_MAX_WORDS} words for the full post (toolbar counter). Excerpt
                  field above is separate.
                </p>
                <BlogEditor
                  defaultValue={data.content}
                  onContentChange={setContent}
                  placeholder="Write your post..."
                  statsMode="words"
                  maxWords={BLOG_POST_BODY_MAX_WORDS}
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
                <span className="text-sm font-medium">Show on homepage (featured)</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Homepage shows up to 3 published posts: featured first (newest), then the latest published.
              </p>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="size-4" />
              SEO
            </h3>
            <div className="space-y-4">
              <SeoMetaInputs
                metaTitleDefault={data.metaTitle}
                metaDescriptionDefault={data.metaDescription}
                metaKeywordsDefault={data.metaKeywords}
                titlePlaceholder="Defaults to post title"
                descriptionPlaceholder="Defaults to excerpt. Up to 160 characters."
              />
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

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" className="gap-2" onClick={() => void handlePreview()}>
          <Eye className="size-4" />
          Preview
        </Button>
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
