"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSiteSettings } from "@/lib/actions/site-settings-actions";
import type { SiteSettingsData } from "@/lib/admin-data";

const emptySocial = {
  facebook: "",
  twitter: "",
  linkedin: "",
  instagram: "",
};

const defaultValues: Omit<SiteSettingsData, "_id"> = {
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
  socialLinks: emptySocial,
};

type Props = {
  initialData?: SiteSettingsData | null;
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

export function SiteSettingsForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const data = initialData ?? defaultValues;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await saveSiteSettings(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/site-settings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Branding</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Site name"
            id="siteName"
            name="siteName"
            placeholder="My Agency"
            defaultValue={data.siteName}
          />
          <Field
            label="Logo text"
            id="logoText"
            name="logoText"
            placeholder="Nexora"
            defaultValue={data.logoText}
          />
          <Field
            label="Logo URL"
            id="logoUrl"
            name="logoUrl"
            placeholder="https://..."
            defaultValue={data.logoUrl}
          />
          <Field
            label="Favicon URL"
            id="faviconUrl"
            name="faviconUrl"
            placeholder="https://..."
            defaultValue={data.faviconUrl}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Contact email"
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="hello@example.com"
            defaultValue={data.contactEmail}
          />
          <Field
            label="Phone"
            id="phone"
            name="phone"
            placeholder="+1 234 567 8900"
            defaultValue={data.phone}
          />
          <Field
            label="Address"
            id="address"
            name="address"
            placeholder="123 Main St, City"
            defaultValue={data.address}
            rows={2}
          />
          <Field
            label="Map embed URL"
            id="mapEmbedUrl"
            name="mapEmbedUrl"
            placeholder="https://maps.google.com/..."
            defaultValue={data.mapEmbedUrl}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Footer & Legal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Footer text"
            id="footerText"
            name="footerText"
            placeholder="© 2025 Company Name"
            defaultValue={data.footerText}
            rows={2}
          />
          <Field
            label="Privacy policy URL"
            id="privacyPolicyUrl"
            name="privacyPolicyUrl"
            placeholder="/privacy-policy"
            defaultValue={data.privacyPolicyUrl}
          />
          <Field
            label="Terms URL"
            id="termsUrl"
            name="termsUrl"
            placeholder="/terms-conditions"
            defaultValue={data.termsUrl}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Social links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Facebook"
            id="facebook"
            name="facebook"
            placeholder="https://facebook.com/..."
            defaultValue={data.socialLinks.facebook}
          />
          <Field
            label="Twitter"
            id="twitter"
            name="twitter"
            placeholder="https://twitter.com/..."
            defaultValue={data.socialLinks.twitter}
          />
          <Field
            label="LinkedIn"
            id="linkedin"
            name="linkedin"
            placeholder="https://linkedin.com/..."
            defaultValue={data.socialLinks.linkedin}
          />
          <Field
            label="Instagram"
            id="instagram"
            name="instagram"
            placeholder="https://instagram.com/..."
            defaultValue={data.socialLinks.instagram}
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">Save settings</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/site-settings")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
