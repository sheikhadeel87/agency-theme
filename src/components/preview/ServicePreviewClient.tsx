"use client";

import { useEffect, useState } from "react";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { ServicesSection } from "@/sections/home/ServicesSection";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "service";

type Payload = {
  title?: string;
  description?: string;
};

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function ServicePreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
      if (!raw) {
        setState("empty");
        return;
      }
      try {
        const p = JSON.parse(raw) as Payload;
        setPayload(p);
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

  if (state === "empty" || !payload) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/services" adminBackLabel="Back to services" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <ServicesSection
        services={[
          {
            _id: "preview",
            title: payload.title?.trim() || "Service title",
            description: payload.description ?? "",
            status: "Published",
          },
        ]}
      />
    </PreviewChrome>
  );
}
