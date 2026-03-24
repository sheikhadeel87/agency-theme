"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveHero } from "@/lib/actions/hero-actions";
import type { HeroData } from "@/lib/admin-data";
import { openAdminPreview } from "@/lib/admin-preview";
import { Eye } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

const defaultValues: Omit<HeroData, "_id"> = {
  heading: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  badgeText: "",
  phoneText: "",
  isEnabled: true,
};

type Props = {
  initialData?: HeroData | null;
};

function Field({
  label,
  id,
  name,
  type = "text",
  placeholder,
  defaultValue,
  rows,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}) {
  const inputClass =
    "w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          className={inputClass}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          className="max-w-md"
        />
      )}
    </div>
  );
}

export function HeroForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const data = initialData ?? defaultValues;
  const [heroEnabled, setHeroEnabled] = useState(data.isEnabled !== false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("isEnabled", heroEnabled ? "on" : "false");
    const result = await saveHero(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/homepage");
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    openAdminPreview("hero", {
      _id: initialData?._id ?? "preview",
      heading: String(fd.get("heading") ?? ""),
      description: String(fd.get("description") ?? ""),
      ctaText: String(fd.get("ctaText") ?? ""),
      ctaLink: String(fd.get("ctaLink") ?? ""),
      badgeText: String(fd.get("badgeText") ?? ""),
      phoneText: String(fd.get("phoneText") ?? ""),
      isEnabled: heroEnabled,
    } satisfies HeroData);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Heading"
          id="heading"
          name="heading"
          placeholder="We specialize in UI/UX, Web Development..."
          defaultValue={data.heading}
        />
        <Field
          label="Description"
          id="description"
          name="description"
          placeholder="We help brands grow with strategy..."
          defaultValue={data.description}
          rows={3}
        />
        <Field
          label="CTA text"
          id="ctaText"
          name="ctaText"
          placeholder="Get Started Now"
          defaultValue={data.ctaText}
        />
        <Field
          label="CTA link"
          id="ctaLink"
          name="ctaLink"
          placeholder="/#get-started"
          defaultValue={data.ctaLink}
        />
        <Field
          label="Badge text"
          id="badgeText"
          name="badgeText"
          placeholder="For any question or concern"
          defaultValue={data.badgeText}
        />
        <Field
          label="Phone text"
          id="phoneText"
          name="phoneText"
          placeholder="Call us (0123) 456 – 789"
          defaultValue={data.phoneText}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Live site
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/30">
          <p className="min-w-0 text-sm font-medium text-foreground">Show hero on the live homepage</p>
          <input type="hidden" name="isEnabled" value={heroEnabled ? "on" : ""} />
          <Toggle enabled={heroEnabled} onChange={setHeroEnabled} className="shrink-0 sm:ml-auto" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="submit">Save hero</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/homepage")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
