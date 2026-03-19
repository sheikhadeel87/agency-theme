"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { saveWhyChooseUsSettings } from "@/lib/actions/why-choose-us-actions";
import type { WhyChooseUsSettingsData } from "@/lib/admin-data";
import { ImageUp, Search, Send, X } from "lucide-react";

type Props = {
  initialData: WhyChooseUsSettingsData;
};

function ImageUploadSlot({
  name,
  altName,
  clearName,
  preview,
  existingUrl,
  altValue,
  cleared,
  onFileChange,
  onClear,
  triggerRef,
  label,
}: {
  name: string;
  altName: string;
  clearName: string;
  preview: string | null;
  existingUrl: string;
  altValue: string;
  cleared: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  triggerRef: React.RefObject<HTMLInputElement | null>;
  label: string;
}) {
  const showPreview = !cleared && (preview || existingUrl);
  const previewSrc = preview || existingUrl;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-foreground">{label}</label>
      <input
        ref={triggerRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      {showPreview && previewSrc ? (
        <div className="space-y-2">
          <div className="relative aspect-video max-w-[200px] overflow-hidden rounded-lg border bg-muted">
            <Image
              src={previewSrc}
              alt="Preview"
              fill
              className="object-cover"
              sizes="200px"
              unoptimized={previewSrc.startsWith("blob:")}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerRef.current?.click()}
            >
              Change
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => triggerRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <ImageUp className="size-4" />
          Upload
        </button>
      )}
      <Input
        name={altName}
        placeholder="Alt text"
        defaultValue={altValue}
        className="h-9 text-sm"
      />
      {cleared && <input type="hidden" name={clearName} value="true" readOnly />}
    </div>
  );
}

export function WhyChooseUsForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [preview3, setPreview3] = useState<string | null>(null);
  const [cleared1, setCleared1] = useState(false);
  const [cleared2, setCleared2] = useState(false);
  const [cleared3, setCleared3] = useState(false);
  const [sectionDescription, setSectionDescription] = useState(
    initialData.sectionDescription ?? ""
  );
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string | null) => void,
    setCleared: (v: boolean) => void,
    fallbackUrl: string
  ) => {
    const file = e.target.files?.[0];
    setCleared(false);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(fallbackUrl || null);
  };

  const clearPreview = (
    setPreview: (v: string | null) => void,
    setCleared: (v: boolean) => void,
    ref: React.RefObject<HTMLInputElement | null>
  ) => {
    setPreview(null);
    setCleared(true);
    if (ref.current) ref.current.value = "";
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("sectionDescription", sectionDescription);
    const result = await saveWhyChooseUsSettings(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Section
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sectionSubtitle"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Subtitle
                </label>
                <Input
                  id="sectionSubtitle"
                  name="sectionSubtitle"
                  placeholder="e.g. Why Choose Us"
                  defaultValue={initialData.sectionSubtitle}
                  className="h-10"
                />
              </div>
              <div>
                <label
                  htmlFor="sectionTitle"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Title
                </label>
                <Input
                  id="sectionTitle"
                  name="sectionTitle"
                  placeholder="Main heading"
                  defaultValue={initialData.sectionTitle}
                  className="h-11 text-base"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <BlogEditor
                  defaultValue={initialData.sectionDescription ?? ""}
                  onContentChange={setSectionDescription}
                  placeholder="Intro paragraph"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ctaText"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    CTA text
                  </label>
                  <Input
                    id="ctaText"
                    name="ctaText"
                    placeholder="See How We Work"
                    defaultValue={initialData.ctaText}
                    className="h-10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ctaLink"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    CTA link
                  </label>
                  <Input
                    id="ctaLink"
                    name="ctaLink"
                    placeholder="/#how-we-work"
                    defaultValue={initialData.ctaLink}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ImageUp className="size-4" />
              Images (collage: top-left, bottom-left, right)
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              <ImageUploadSlot
                name="image1"
                altName="image1Alt"
                clearName="image1Clear"
                preview={preview1}
                existingUrl={initialData.image1Url}
                altValue={initialData.image1Alt}
                cleared={cleared1}
                onFileChange={(e) => handleFile(e, setPreview1, setCleared1, initialData.image1Url)}
                onClear={() => clearPreview(setPreview1, setCleared1, ref1)}
                triggerRef={ref1}
                label="Top-left"
              />
              <ImageUploadSlot
                name="image2"
                altName="image2Alt"
                clearName="image2Clear"
                preview={preview2}
                existingUrl={initialData.image2Url}
                altValue={initialData.image2Alt}
                cleared={cleared2}
                onFileChange={(e) => handleFile(e, setPreview2, setCleared2, initialData.image2Url)}
                onClear={() => clearPreview(setPreview2, setCleared2, ref2)}
                triggerRef={ref2}
                label="Bottom-left"
              />
              <ImageUploadSlot
                name="image3"
                altName="image3Alt"
                clearName="image3Clear"
                preview={preview3}
                existingUrl={initialData.image3Url}
                altValue={initialData.image3Alt}
                cleared={cleared3}
                onFileChange={(e) => handleFile(e, setPreview3, setCleared3, initialData.image3Url)}
                onClear={() => clearPreview(setPreview3, setCleared3, ref3)}
                triggerRef={ref3}
                label="Right"
              />
            </div>
          </div>
        </div>

        {/* Sidebar - SEO */}
        <div className="space-y-6">
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
                  placeholder="Defaults to section title"
                  defaultValue={initialData.metaTitle}
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
                  placeholder="Keep under 160 characters."
                  defaultValue={initialData.metaDescription}
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
                  defaultValue={initialData.metaKeywords}
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
        <Button type="submit" disabled={saving} className="gap-2">
          <Send className="size-4" />
          {saving ? "Saving…" : "Save section & SEO"}
        </Button>
      </div>
    </form>
  );
}
