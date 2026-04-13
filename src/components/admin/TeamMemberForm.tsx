"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/admin/BlogEditor";
import {
  BIO_PORTFOLIO_BLOG_DESCRIPTION_MAX_WORDS,
  countWordsFromHtml,
} from "@/lib/word-count";
import { saveTeamMember } from "@/lib/actions/team-actions";
import type { TeamMember } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { openAdminPreview, resolvePreviewImageUrl } from "@/lib/admin-preview";
import { Eye, ImageUp, Send, X } from "lucide-react";
import { toast } from "sonner";

const defaultValues: Omit<TeamMember, "_id"> = {
  name: "",
  slug: "",
  role: "",
  bio: "",
  imageUrl: "",
  order: 0,
  featuredOnHomepage: false,
};

type Props = {
  initialData?: TeamMember | null;
};

export function TeamMemberForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [bio, setBio] = useState(initialData?.bio ?? defaultValues.bio);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  /** Latest TipTap HTML — avoids stale React state on submit. */
  const bioHtmlGetterRef = useRef<(() => string) | null>(null);
  /** Synced on every editor change (setState can lag behind on submit). */
  const bioLatestRef = useRef(initialData?.bio ?? "");
  const setBioFromEditor = useCallback((html: string) => {
    bioLatestRef.current = html;
    setBio(html);
  }, []);

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
    const bioHtml =
      bioHtmlGetterRef.current?.() ?? bioLatestRef.current ?? bio;
    // Pass bio as 2nd arg — large HTML in FormData can fail to round-trip on server actions.
    const result = await saveTeamMember(formData, bioHtml);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Team member saved.");
    router.push("/admin/team");
    router.refresh();
  }

  async function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const file = fileInputRef.current?.files?.[0];
    const imageUrl = await resolvePreviewImageUrl(file, imagePreview, data.imageUrl);
    const bioHtml = bioHtmlGetterRef.current?.() ?? bioLatestRef.current ?? bio;
    const bioWords = countWordsFromHtml(bioHtml);
    if (bioWords > BIO_PORTFOLIO_BLOG_DESCRIPTION_MAX_WORDS) {
      setError(
        `Bio must be at most ${BIO_PORTFOLIO_BLOG_DESCRIPTION_MAX_WORDS} words (currently ${bioWords}).`
      );
      return;
    }
    setError(null);
    openAdminPreview("team-member", {
      name: String(fd.get("name") ?? ""),
      role: String(fd.get("role") ?? ""),
      bio: bioHtml,
      imageUrl,
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {initialData?._id && (
        <input type="hidden" name="_id" value={initialData._id} readOnly />
      )}
      {data.imageUrl ? (
        <input type="hidden" name="imageUrl" value={data.imageUrl} readOnly />
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Member
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full name"
                  defaultValue={data.name}
                  className="h-11 text-base"
                />
              </div>
              <div>
                <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-foreground">
                  URL slug
                </label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="e.g. jane-doe (auto from name if empty)"
                  defaultValue={data.slug}
                  className="h-10 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Public profile: /team/your-slug — leave blank to generate from name.
                </p>
              </div>
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-foreground">
                  Role
                </label>
                <Input
                  id="role"
                  name="role"
                  placeholder="e.g. Product Manager"
                  defaultValue={data.role}
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Bio
                </label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Rich text shown only on the member&apos;s profile page (/team/your-slug), not on the homepage grid.
                  Maximum {BIO_PORTFOLIO_BLOG_DESCRIPTION_MAX_WORDS} words.
                </p>
                <BlogEditor
                  key={initialData?._id ?? "new-member"}
                  defaultValue={data.bio}
                  onContentChange={setBioFromEditor}
                  htmlGetterRef={bioHtmlGetterRef}
                  placeholder="Write a short bio for this team member..."
                  statsMode="words"
                  maxWords={BIO_PORTFOLIO_BLOG_DESCRIPTION_MAX_WORDS}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ImageUp className="size-4" />
              Photo
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
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
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
                  Upload photo
                </span>
              </button>
            )}
            {data.imageUrl && !imagePreview && (
              <div className="mt-2 flex gap-2">
                <div className="relative size-16 flex-shrink-0 overflow-hidden rounded border">
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

          {/* Order */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Order & homepage
            </h3>
            <div>
              <label htmlFor="order" className="mb-1 block text-xs font-medium text-foreground">
                Display order (lower = first)
              </label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={data.order}
                className="h-9 text-sm"
              />
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
              Homepage shows up to 3 members: checked first (newest), then others by display order.
            </p>
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
          Save member
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/team")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
