"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveTestimonial } from "@/lib/actions/testimonials-actions";
import type { TestimonialItem } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { openAdminPreview, resolvePreviewImageUrl } from "@/lib/admin-preview";
import {
  countQuoteWords,
  quoteExceedsWordLimit,
  TESTIMONIAL_QUOTE_MAX_WORDS,
} from "@/lib/testimonial-quote";
import { Eye, ImageUp, Send, X } from "lucide-react";

const defaultValues: Omit<TestimonialItem, "_id"> = {
  quote: "",
  authorName: "",
  designation: "",
  brandName: "",
  imageUrl: "",
  order: 0,
};

type Props = {
  initialData?: TestimonialItem | null;
};

export function TestimonialForm({ initialData }: Props) {
  const router = useRouter();
  const data = initialData ?? defaultValues;
  const [error, setError] = useState<string | null>(null);
  const [quoteWords, setQuoteWords] = useState(() => countQuoteWords(data.quote));
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    const quote = String(formData.get("quote") ?? "");
    if (quoteExceedsWordLimit(quote)) {
      setError(`Quote must be ${TESTIMONIAL_QUOTE_MAX_WORDS} words or fewer.`);
      return;
    }
    const result = await saveTestimonial(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  async function handlePreview() {
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const quote = String(fd.get("quote") ?? "");
    if (quoteExceedsWordLimit(quote)) {
      setError(`Quote must be ${TESTIMONIAL_QUOTE_MAX_WORDS} words or fewer to use preview.`);
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    const imageUrl = await resolvePreviewImageUrl(file, imagePreview, data.imageUrl);

    openAdminPreview("testimonial", {
      quote,
      authorName: String(fd.get("authorName") ?? ""),
      designation: String(fd.get("designation") ?? ""),
      brandName: String(fd.get("brandName") ?? ""),
      imageUrl,
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {initialData?._id && (
        <input type="hidden" name="_id" value={initialData._id} readOnly />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Testimonial
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="quote" className="mb-1.5 block text-sm font-medium text-foreground">
                  Quote
                </label>
                <textarea
                  id="quote"
                  name="quote"
                  placeholder="Client quote..."
                  defaultValue={data.quote}
                  rows={5}
                  onInput={(e) => setQuoteWords(countQuoteWords(e.currentTarget.value))}
                  aria-invalid={quoteWords > TESTIMONIAL_QUOTE_MAX_WORDS}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50 aria-invalid:border-destructive/60"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Max {TESTIMONIAL_QUOTE_MAX_WORDS} words ({quoteWords}/{TESTIMONIAL_QUOTE_MAX_WORDS}).
                  {quoteWords > TESTIMONIAL_QUOTE_MAX_WORDS ? (
                    <span className="font-medium text-destructive"> Shorten to save or preview.</span>
                  ) : null}
                </p>
              </div>
              <div>
                <label htmlFor="authorName" className="mb-1.5 block text-sm font-medium text-foreground">
                  Author name
                </label>
                <Input
                  id="authorName"
                  name="authorName"
                  placeholder="e.g. Devid Smith"
                  defaultValue={data.authorName}
                  className="h-10"
                />
              </div>
              <div>
                <label htmlFor="designation" className="mb-1.5 block text-sm font-medium text-foreground">
                  Designation
                </label>
                <Input
                  id="designation"
                  name="designation"
                  placeholder="e.g. Founder @democompany"
                  defaultValue={data.designation}
                  className="h-10"
                />
              </div>
              <div>
                <label htmlFor="brandName" className="mb-1.5 block text-sm font-medium text-foreground">
                  Brand name
                </label>
                <Input
                  id="brandName"
                  name="brandName"
                  placeholder="e.g. dropcam"
                  defaultValue={data.brandName}
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                    sizes="320px"
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
                <span className="text-sm font-medium text-muted-foreground">Upload photo</span>
              </button>
            )}
            {data.imageUrl && !imagePreview && (
              <div className="mt-2 flex gap-2">
                <div className="relative size-16 flex-shrink-0 overflow-hidden rounded border">
                  <Image src={data.imageUrl} alt="" fill className="object-cover" sizes="64px" unoptimized={shouldUseUnoptimizedImage(data.imageUrl)} />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Replace
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Order
            </h3>
            <div>
              <label htmlFor="order" className="mb-1 block text-xs font-medium text-foreground">
                Display order (lower = first)
              </label>
              <Input id="order" name="order" type="number" defaultValue={data.order} className="h-9 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" className="gap-2" onClick={() => void handlePreview()}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="submit" className="gap-2">
          <Send className="size-4" />
          Save testimonial
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/testimonials")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
