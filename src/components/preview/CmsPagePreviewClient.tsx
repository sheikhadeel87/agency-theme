"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "cms-page";

type Payload = {
  title?: string;
  content?: string;
};

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function CmsPagePreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [page, setPage] = useState<Payload | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
    if (!raw) {
      setState("empty");
      return;
    }
    try {
      const p = JSON.parse(raw) as Payload;
      setPage(p);
      setState("ready");
    } catch {
      setState("empty");
    }
  }, []);

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    );
  }

  if (state === "empty" || !page) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/pages" adminBackLabel="Back to pages" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <main className="min-h-screen bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <article className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {page.title?.trim() || "Untitled page"}
            </h1>
            {page.content?.trim() ? (
              <div
                className="mt-8 prose prose-neutral max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-ul:list-disc prose-ol:list-decimal"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="mt-6 text-muted-foreground">No content yet.</p>
            )}
          </article>
        </Container>
      </main>
    </PreviewChrome>
  );
}
