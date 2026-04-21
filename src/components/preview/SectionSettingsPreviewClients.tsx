"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import type {
  FeaturesHighlightsSettingsData,
  PricingSettingsData,
  SiteSettingsData,
  TeamSettingsData,
  TestimonialsSettingsData,
} from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { FeaturesHighlights } from "@/sections/home/FeaturesHighlights";
import { TestimonialsSection } from "@/sections/home/TestimonialsSection";
import { TeamSection } from "@/sections/home/TeamSection";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

function usePreviewPayload<T>(type: string): { pending: boolean; empty: boolean; data: T | null } {
  const [pending, setPending] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(type));
      if (!raw) {
        setEmpty(true);
        setPending(false);
        return;
      }
      try {
        setData(JSON.parse(raw) as T);
        setEmpty(false);
      } catch {
        setEmpty(true);
      }
      setPending(false);
    });
  }, [type]);

  return { pending, empty, data };
}

export function TestimonialsSectionPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const type = "testimonials-section";
  const { pending, empty, data } = usePreviewPayload<TestimonialsSettingsData>(type);

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (empty || !data) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/testimonials" adminBackLabel="Back to testimonials" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <TestimonialsSection settings={data} testimonials={[]} />
    </PreviewChrome>
  );
}

export function FeaturesHighlightsPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const type = "features-highlights";
  const { pending, empty, data } = usePreviewPayload<FeaturesHighlightsSettingsData>(type);

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (empty || !data) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState
          adminBackHref="/admin/features-highlights"
          adminBackLabel="Back to Support"
        />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <FeaturesHighlights settings={data} />
    </PreviewChrome>
  );
}

export function TeamSectionPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const type = "team-section";
  const { pending, empty, data } = usePreviewPayload<TeamSettingsData>(type);

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (empty || !data) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/team" adminBackLabel="Back to team" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <TeamSection settings={data} members={[]} />
    </PreviewChrome>
  );
}

export function PricingSectionPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const type = "pricing-section";
  const { pending, empty, data } = usePreviewPayload<PricingSettingsData>(type);

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (empty || !data) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/pricing" adminBackLabel="Back to pricing" />
      </PreviewChrome>
    );
  }

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <section
        className="relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-24"
        aria-labelledby="pricing-section-preview-heading"
      >
        <Container as="div" className="relative">
          <header className="mx-auto max-w-2xl text-center">
            <h2
              id="pricing-section-preview-heading"
              className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {data.sectionTitle || "We Offer Great Affordable Premium Prices."}
            </h2>
            {data.sectionDescription ? (
              <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">{data.sectionDescription}</p>
            ) : null}
          </header>
          <p className="mx-auto mt-10 max-w-lg text-center text-sm text-gray-500">
            Plan cards use your saved pricing plans on the live homepage. This preview shows only the section heading
            copy.
          </p>
        </Container>
      </section>
    </PreviewChrome>
  );
}
