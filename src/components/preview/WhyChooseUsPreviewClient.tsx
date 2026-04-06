"use client";

import { useEffect, useState } from "react";
import type { SiteSettingsData, WhyChooseUsSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { WhyChooseUs } from "@/sections/home/WhyChooseUs";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "why-choose-us";

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function WhyChooseUsPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [settings, setSettings] = useState<WhyChooseUsSettingsData | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
      if (!raw) {
        setState("empty");
        return;
      }
      try {
        const p = JSON.parse(raw) as WhyChooseUsSettingsData;
        setSettings(p);
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

  if (state === "empty" || !settings) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/why-choose-us" adminBackLabel="Back to Why choose us" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <WhyChooseUs settings={settings} />
    </PreviewChrome>
  );
}
