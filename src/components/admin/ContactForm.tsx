"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveContactSettings } from "@/lib/actions/site-settings-actions";
import type { SiteSettingsData } from "@/lib/admin-data";
import { openAdminPreview } from "@/lib/admin-preview";
import { Eye, MapPin } from "lucide-react";

type Props = {
  initialData?: SiteSettingsData | null;
};

export function ContactForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const data = initialData ?? {
    _id: "",
    siteName: "",
    logoText: "",
    logoUrl: "",
    faviconUrl: "",
    contactEmail: "",
    phone: "",
    address: "",
    mapEmbedUrl: "",
    footerText: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await saveContactSettings(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/contact");
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    openAdminPreview("contact", {
      contactEmail: String(fd.get("contactEmail") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      mapEmbedUrl: String(fd.get("mapEmbedUrl") ?? ""),
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="size-4" />
          Map & location
        </h3>
        <div className="space-y-2">
          <label
            htmlFor="mapEmbedUrl"
            className="block text-sm font-medium text-foreground"
          >
            Google Maps embed URL
          </label>
          <p className="text-xs text-muted-foreground">
            In Google Maps: find your location → Share → Embed a map → copy the{" "}
            <code className="rounded bg-muted px-1">src=...</code> URL from the
            iframe.
          </p>
          <Input
            id="mapEmbedUrl"
            name="mapEmbedUrl"
            type="url"
            placeholder="https://maps.google.com/maps?q=...&output=embed"
            defaultValue={data.mapEmbedUrl}
            className="max-w-2xl font-mono text-sm"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Contact details (shown above the map)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contactEmail"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              placeholder="hello@example.com"
              defaultValue={data.contactEmail}
              className="max-w-md"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Phone
            </label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 234 567 8900"
              defaultValue={data.phone}
              className="max-w-md"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Address
            </label>
            <Input
              id="address"
              name="address"
              placeholder="123 Main St, City, Country"
              defaultValue={data.address}
              className="max-w-md"
            />
          </div>
        </div>
      </section>

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
        <Button type="submit">Save contact & map</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/contact")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
