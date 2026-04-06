"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { TestimonialsCarousel } from "@/sections/home/TestimonialsCarousel";
import type { SiteSettingsData, TestimonialItem } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "testimonial";

type Stored = {
  quote?: string;
  authorName?: string;
  designation?: string;
  brandName?: string;
  imageUrl?: string;
};

function parseItem(raw: string): TestimonialItem | null {
  try {
    const p = JSON.parse(raw) as Stored;
    return {
      _id: "preview",
      quote: p.quote ?? "",
      authorName: p.authorName ?? "",
      designation: p.designation ?? "",
      brandName: p.brandName ?? "",
      imageUrl: p.imageUrl ?? "",
      order: 0,
    };
  } catch {
    return null;
  }
}

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function TestimonialPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [item, setItem] = useState<TestimonialItem | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
      if (!raw) {
        setState("empty");
        return;
      }
      const parsed = parseItem(raw);
      if (!parsed) {
        setState("empty");
        return;
      }
      setItem(parsed);
      setState("ready");
    });
  }, []);

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (state === "empty" || !item) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/testimonials" adminBackLabel="Back to testimonials" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <section className="bg-[#fafafa] py-16 sm:py-20 lg:py-24" aria-label="Testimonial preview">
        <Container as="div">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">
              Client&apos;s Testimonials
            </h1>
          </header>
          <TestimonialsCarousel testimonials={[item]} />
        </Container>
      </section>
    </PreviewChrome>
  );
}
