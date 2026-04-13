"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveContactSettings } from "@/lib/actions/site-settings-actions";
import type { SiteSettingsData } from "@/lib/admin-data";
import { getDefaultNavigation } from "@/lib/navigation";
import {
  CONTACT_PHONE_INVALID_MESSAGE,
  isValidContactPhone,
  sanitizeContactPhoneInput,
} from "@/lib/contact-phone";
import { openAdminPreview } from "@/lib/admin-preview";
import { Eye, MapPin } from "lucide-react";
import { toast } from "sonner";

type Props = {
  initialData?: SiteSettingsData | null;
};

export function ContactForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const data = initialData ?? {
    _id: "",
    footerColumns: [],
    siteName: "",
    logoText: "",
    logoUrl: "",
    faviconUrl: "",
    contactEmail: "",
    phone: "",
    address: "",
    mapEmbedUrl: "",
    contactSectionTitle: "",
    contactSectionDescription: "",
    footerText: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
    servicesSectionEnabled: true,
    portfolioSectionEnabled: true,
    blogSectionEnabled: true,
    contactSectionEnabled: true,
    featuresHighlightsSectionEnabled: true,
    navigation: getDefaultNavigation(),
  };

  const [phoneInput, setPhoneInput] = useState(data.phone ?? "");
  useEffect(() => {
    setPhoneInput(data.phone ?? "");
  }, [data.phone]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const phoneTrimmed = phoneInput.trim();
    if (phoneTrimmed && !isValidContactPhone(phoneTrimmed)) {
      setError(CONTACT_PHONE_INVALID_MESSAGE);
      toast.error(CONTACT_PHONE_INVALID_MESSAGE);
      return;
    }
    formData.set("phone", phoneTrimmed);
    const result = await saveContactSettings(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Contact & map saved.");
    router.push("/admin/contact");
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const previewPhone = phoneInput.trim();
    if (previewPhone && !isValidContactPhone(previewPhone)) {
      setError(CONTACT_PHONE_INVALID_MESSAGE);
      return;
    }
    setError(null);
    openAdminPreview("contact", {
      contactEmail: String(fd.get("contactEmail") ?? ""),
      phone: previewPhone,
      address: String(fd.get("address") ?? ""),
      mapEmbedUrl: String(fd.get("mapEmbedUrl") ?? ""),
      contactSectionTitle: String(fd.get("contactSectionTitle") ?? ""),
      contactSectionDescription: String(fd.get("contactSectionDescription") ?? ""),
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Contact section (homepage)</h3>
        <p className="text-xs text-muted-foreground">
          Heading and intro shown above the contact cards and map on the live site. Leave blank to
          use defaults.
        </p>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="contactSectionTitle"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Section heading
            </label>
            <Input
              id="contactSectionTitle"
              name="contactSectionTitle"
              placeholder="Let's Stay Connected"
              defaultValue={data.contactSectionTitle}
              maxLength={120}
              className="max-w-xl"
            />
          </div>
          <div>
            <label
              htmlFor="contactSectionDescription"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Section description
            </label>
            <textarea
              id="contactSectionDescription"
              name="contactSectionDescription"
              rows={3}
              placeholder="Short intro under the heading"
              defaultValue={data.contactSectionDescription}
              maxLength={600}
              className="w-full max-w-2xl rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </section>

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
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1 234 567 8900"
              value={phoneInput}
              onChange={(e) => setPhoneInput(sanitizeContactPhoneInput(e.target.value))}
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
