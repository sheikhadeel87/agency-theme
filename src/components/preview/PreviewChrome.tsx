"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { SiteSettingsData } from "@/lib/admin-data";

type Props = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
  children: React.ReactNode;
};

export function PreviewChrome({ siteSettings, dynamicPages, children }: Props) {
  return (
    <>
      <Header siteSettings={siteSettings} dynamicPages={dynamicPages} />
      <div className="bg-amber-50 py-2 text-center text-xs font-medium text-amber-950">
        Preview — not published
      </div>
      {children}
      <Footer siteSettings={siteSettings} />
    </>
  );
}
