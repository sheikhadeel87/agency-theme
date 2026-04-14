"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { openAdminPreview, resolvePreviewImageUrl } from "@/lib/admin-preview";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSiteSettings } from "@/lib/actions/site-settings-actions";
import type { SiteSettingsData } from "@/lib/admin-data";
import {
  CONTACT_PHONE_INVALID_MESSAGE,
  isValidContactPhone,
  sanitizeContactPhoneInput,
} from "@/lib/contact-phone";
import {
  CONTACT_SECTION_DESCRIPTION_MAX_LENGTH,
  CONTACT_SECTION_TITLE_MAX_LENGTH,
} from "@/lib/contact-section-field-limits";
import { validateSiteSocialLinks } from "@/lib/social-link-validation";
import { getDefaultNavigation } from "@/lib/navigation";
import { Eye, ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";

const emptySocial = {
  facebook: "",
  twitter: "",
  linkedin: "",
  instagram: "",
};

const defaultValues: Omit<SiteSettingsData, "_id"> = {
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
  socialLinks: emptySocial,
  servicesSectionEnabled: true,
  portfolioSectionEnabled: true,
  blogSectionEnabled: true,
  contactSectionEnabled: true,
  featuresHighlightsSectionEnabled: true,
  navigation: getDefaultNavigation(),
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
  maxLength,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
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
          maxLength={maxLength}
          className={inputClass}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          maxLength={maxLength}
          className="max-w-md"
        />
      )}
    </div>
  );
}

type HomepageSectionFlags = {
  featuresHighlightsSectionEnabled: boolean;
  servicesSectionEnabled: boolean;
  portfolioSectionEnabled: boolean;
  blogSectionEnabled: boolean;
  contactSectionEnabled: boolean;
};

export function SiteSettingsForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl ?? null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(initialData?.faviconUrl ?? null);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const data = initialData ?? defaultValues;
  const [homepageSections, setHomepageSections] = useState<HomepageSectionFlags>(() => ({
    featuresHighlightsSectionEnabled: data.featuresHighlightsSectionEnabled !== false,
    servicesSectionEnabled: data.servicesSectionEnabled !== false,
    portfolioSectionEnabled: data.portfolioSectionEnabled !== false,
    blogSectionEnabled: data.blogSectionEnabled !== false,
    contactSectionEnabled: data.contactSectionEnabled !== false,
  }));
  const [phoneInput, setPhoneInput] = useState(() => data.phone ?? "");
  const [prevPhone, setPrevPhone] = useState(data.phone);
  if (data.phone !== prevPhone) {
    setPrevPhone(data.phone);
    setPhoneInput(data.phone ?? "");
  }

  const setHomepageFlag = <K extends keyof HomepageSectionFlags>(key: K, value: boolean) => {
    setHomepageSections((prev) => ({ ...prev, [key]: value }));
  };

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoPreview(file ? URL.createObjectURL(file) : (data.logoUrl || null));
  }
  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFaviconPreview(file ? URL.createObjectURL(file) : (data.faviconUrl || null));
  }
  function clearLogo() {
    setLogoPreview(null);
    if (logoRef.current) logoRef.current.value = "";
  }
  function clearFavicon() {
    setFaviconPreview(null);
    if (faviconRef.current) faviconRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set(
      "featuresHighlightsSectionEnabled",
      homepageSections.featuresHighlightsSectionEnabled ? "on" : "false"
    );
    formData.set("servicesSectionEnabled", homepageSections.servicesSectionEnabled ? "on" : "false");
    formData.set("portfolioSectionEnabled", homepageSections.portfolioSectionEnabled ? "on" : "false");
    formData.set("blogSectionEnabled", homepageSections.blogSectionEnabled ? "on" : "false");
    formData.set("contactSectionEnabled", homepageSections.contactSectionEnabled ? "on" : "false");
    const phoneTrimmed = phoneInput.trim();
    if (phoneTrimmed && !isValidContactPhone(phoneTrimmed)) {
      setError(CONTACT_PHONE_INVALID_MESSAGE);
      toast.error(CONTACT_PHONE_INVALID_MESSAGE);
      return;
    }
    formData.set("phone", phoneTrimmed);
    const result = await saveSiteSettings(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Site settings saved.");
    router.push("/admin/site-settings");
    router.refresh();
  }

  async function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const socialErr = validateSiteSocialLinks({
      facebook: String(fd.get("facebook") ?? "").trim(),
      twitter: String(fd.get("twitter") ?? "").trim(),
      linkedin: String(fd.get("linkedin") ?? "").trim(),
      instagram: String(fd.get("instagram") ?? "").trim(),
    });
    if (socialErr) {
      setError(socialErr);
      return;
    }
    const previewPhone = phoneInput.trim();
    if (previewPhone && !isValidContactPhone(previewPhone)) {
      setError(CONTACT_PHONE_INVALID_MESSAGE);
      return;
    }
    setError(null);
    const logoFile = logoRef.current?.files?.[0];
    const faviconFile = faviconRef.current?.files?.[0];
    const logoUrl = await resolvePreviewImageUrl(logoFile, logoPreview, data.logoUrl);
    const faviconUrl = await resolvePreviewImageUrl(faviconFile, faviconPreview, data.faviconUrl);
    openAdminPreview("site-settings", {
      _id: initialData?._id ?? "",
      siteName: String(fd.get("siteName") ?? ""),
      logoText: String(fd.get("logoText") ?? ""),
      logoUrl,
      faviconUrl,
      contactEmail: String(fd.get("contactEmail") ?? ""),
      phone: previewPhone,
      address: String(fd.get("address") ?? ""),
      mapEmbedUrl: String(fd.get("mapEmbedUrl") ?? ""),
      contactSectionTitle: String(fd.get("contactSectionTitle") ?? ""),
      contactSectionDescription: String(fd.get("contactSectionDescription") ?? ""),
      footerText: String(fd.get("footerText") ?? ""),
      privacyPolicyUrl: String(fd.get("privacyPolicyUrl") ?? ""),
      termsUrl: String(fd.get("termsUrl") ?? ""),
      socialLinks: {
        facebook: String(fd.get("facebook") ?? ""),
        twitter: String(fd.get("twitter") ?? ""),
        linkedin: String(fd.get("linkedin") ?? ""),
        instagram: String(fd.get("instagram") ?? ""),
      },
      servicesSectionEnabled: homepageSections.servicesSectionEnabled,
      portfolioSectionEnabled: homepageSections.portfolioSectionEnabled,
      blogSectionEnabled: homepageSections.blogSectionEnabled,
      contactSectionEnabled: homepageSections.contactSectionEnabled,
      featuresHighlightsSectionEnabled: homepageSections.featuresHighlightsSectionEnabled,
      navigation: data.navigation?.length ? data.navigation : getDefaultNavigation(),
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Logo image</label>
            <input
              ref={logoRef}
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            {logoPreview ? (
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-32 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-1"
                    sizes="128px"
                    unoptimized={logoPreview.startsWith("blob:")}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                    Change
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearLogo}>
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <ImageUp className="size-4" />
                Upload logo
              </button>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Favicon image</label>
            <input
              ref={faviconRef}
              type="file"
              name="favicon"
              accept="image/*,.ico"
              onChange={handleFaviconChange}
              className="hidden"
            />
            {faviconPreview ? (
              <div className="flex items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded border bg-muted">
                  <Image
                    src={faviconPreview}
                    alt="Favicon preview"
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                    unoptimized={faviconPreview.startsWith("blob:")}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => faviconRef.current?.click()}>
                    Change
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearFavicon}>
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => faviconRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <ImageUp className="size-4" />
                Upload favicon
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <p className="text-xs text-muted-foreground">
          Homepage Contact block: heading and intro (also editable under{" "}
          <span className="font-medium text-foreground">Contact &amp; Map</span>). Leave blank for
          defaults.
        </p>
        <div className="grid gap-4 sm:grid-cols-1">
          <Field
            label="Contact section heading"
            id="contactSectionTitle"
            name="contactSectionTitle"
            placeholder="Let's Stay Connected"
            defaultValue={data.contactSectionTitle}
            maxLength={CONTACT_SECTION_TITLE_MAX_LENGTH}
          />
          <Field
            label="Contact section description"
            id="contactSectionDescription"
            name="contactSectionDescription"
            placeholder="Short intro under the heading"
            defaultValue={data.contactSectionDescription}
            rows={3}
            maxLength={CONTACT_SECTION_DESCRIPTION_MAX_LENGTH}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Contact email"
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="hello@example.com"
            defaultValue={data.contactEmail}
          />
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
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
        <h3 className="text-sm font-semibold text-foreground">Homepage sections (live site)</h3>
        <p className="text-sm text-muted-foreground">
          Turn off blocks you do not want on the public homepage or in navigation (blog archive, portfolio detail pages, etc.).
        </p>
        <div className="grid gap-3 sm:max-w-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-card p-3">
            <span className="min-w-0 text-sm font-medium text-foreground">Feature highlights (Support block)</span>
            <input
              type="hidden"
              name="featuresHighlightsSectionEnabled"
              value={homepageSections.featuresHighlightsSectionEnabled ? "on" : ""}
            />
            <Toggle
              enabled={homepageSections.featuresHighlightsSectionEnabled}
              onChange={(v) => setHomepageFlag("featuresHighlightsSectionEnabled", v)}
              className="shrink-0 sm:ml-auto"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-card p-3">
            <span className="min-w-0 text-sm font-medium text-foreground">Services section</span>
            <input type="hidden" name="servicesSectionEnabled" value={homepageSections.servicesSectionEnabled ? "on" : ""} />
            <Toggle
              enabled={homepageSections.servicesSectionEnabled}
              onChange={(v) => setHomepageFlag("servicesSectionEnabled", v)}
              className="shrink-0 sm:ml-auto"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-card p-3">
            <span className="min-w-0 text-sm font-medium text-foreground">Portfolio section & project pages</span>
            <input
              type="hidden"
              name="portfolioSectionEnabled"
              value={homepageSections.portfolioSectionEnabled ? "on" : ""}
            />
            <Toggle
              enabled={homepageSections.portfolioSectionEnabled}
              onChange={(v) => setHomepageFlag("portfolioSectionEnabled", v)}
              className="shrink-0 sm:ml-auto"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-card p-3">
            <span className="min-w-0 text-sm font-medium text-foreground">Blog section & blog pages</span>
            <input type="hidden" name="blogSectionEnabled" value={homepageSections.blogSectionEnabled ? "on" : ""} />
            <Toggle
              enabled={homepageSections.blogSectionEnabled}
              onChange={(v) => setHomepageFlag("blogSectionEnabled", v)}
              className="shrink-0 sm:ml-auto"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rounded-lg border border-border bg-card p-3">
            <span className="min-w-0 text-sm font-medium text-foreground">Contact section</span>
            <input type="hidden" name="contactSectionEnabled" value={homepageSections.contactSectionEnabled ? "on" : ""} />
            <Toggle
              enabled={homepageSections.contactSectionEnabled}
              onChange={(v) => setHomepageFlag("contactSectionEnabled", v)}
              className="shrink-0 sm:ml-auto"
            />
          </div>
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
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="gap-2" onClick={() => void handlePreview()}>
          <Eye className="size-4" />
          Preview
        </Button>
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
