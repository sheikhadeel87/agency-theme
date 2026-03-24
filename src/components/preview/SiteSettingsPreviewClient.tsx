"use client";

import { useEffect, useState } from "react";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "site-settings";

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function SiteSettingsPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [draft, setDraft] = useState<SiteSettingsData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
    if (!raw) {
      setState("empty");
      return;
    }
    try {
      const p = JSON.parse(raw) as Partial<SiteSettingsData>;
      setDraft({
        ...siteSettings,
        ...p,
        socialLinks: { ...siteSettings.socialLinks, ...p.socialLinks },
      });
      setState("ready");
    } catch {
      setState("empty");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- merge once with shell from server
  }, []);

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (state === "empty" || !draft) {
    return (
      <>
        <Header siteSettings={siteSettings} dynamicPages={dynamicPages} />
        <div className="bg-amber-50 py-2 text-center text-xs font-medium text-amber-950">
          Preview — not published
        </div>
        <PreviewEmptyState adminBackHref="/admin/site-settings/edit" adminBackLabel="Back to site settings" />
        <Footer siteSettings={siteSettings} />
      </>
    );
  }

  return (
    <>
      <Header siteSettings={draft} dynamicPages={dynamicPages} />
      <div className="bg-amber-50 py-2 text-center text-xs font-medium text-amber-950">
        Preview — not published
      </div>
      <main className="min-h-[30vh] bg-[#fafafa] py-12">
        <p className="text-center text-sm text-gray-600">
          Header and footer reflect your draft branding. The rest of the site uses saved content until you publish.
        </p>
      </main>
      <Footer siteSettings={draft} />
    </>
  );
}
