"use client";

import { useEffect, useState } from "react";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { ContactSection } from "@/sections/home/ContactSection";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "contact";

type PartialContact = Partial<
  Pick<
    SiteSettingsData,
    | "contactEmail"
    | "phone"
    | "address"
    | "mapEmbedUrl"
    | "contactSectionTitle"
    | "contactSectionDescription"
  >
>;

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function ContactPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [patch, setPatch] = useState<PartialContact | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
      if (!raw) {
        setState("empty");
        return;
      }
      try {
        const p = JSON.parse(raw) as PartialContact;
        setPatch(p);
        setState("ready");
      } catch {
        setState("empty");
      }
    });
  }, []);

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (state === "empty" || !patch) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/contact" adminBackLabel="Back to contact" />
      </PreviewChrome>
    );
  }

  const merged: SiteSettingsData = {
    ...siteSettings,
    contactEmail: patch.contactEmail ?? siteSettings.contactEmail,
    phone: patch.phone ?? siteSettings.phone,
    address: patch.address ?? siteSettings.address,
    mapEmbedUrl: patch.mapEmbedUrl ?? siteSettings.mapEmbedUrl,
    contactSectionTitle: patch.contactSectionTitle ?? siteSettings.contactSectionTitle,
    contactSectionDescription:
      patch.contactSectionDescription ?? siteSettings.contactSectionDescription,
  };

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <ContactSection siteSettings={merged} />
    </PreviewChrome>
  );
}
