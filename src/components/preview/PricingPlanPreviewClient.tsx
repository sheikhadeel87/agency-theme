"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { PricingPlanItem, PricingSettingsData, SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { formatPlanPriceForDisplay, sanitizePlanPrice } from "@/lib/pricing-display";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "pricing-plan";

type Payload = {
  settings?: Partial<PricingSettingsData>;
  plan?: PricingPlanItem;
};

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function PricingPlanPreviewClient({ siteSettings, dynamicPages }: Shell) {
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
        if (!p?.plan) {
          setState("empty");
          return;
        }
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

  if (state === "empty" || !payload?.plan) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/pricing" adminBackLabel="Back to pricing" />
      </PreviewChrome>
    );
  }

  const settings = payload.settings ?? {};
  const plan = payload.plan;
  const price = sanitizePlanPrice(plan.priceMonthly ?? 0);
  const ctaClass = `mt-6 w-full rounded-full py-3.5 text-center text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:mt-8 ${
    plan.featured
      ? "bg-blue-600 hover:bg-rose-400 focus:bg-rose-400 active:bg-rose-500"
      : "bg-pink-500 hover:bg-rose-400 focus:bg-rose-400 active:bg-rose-500"
  } ${!plan.ctaLink ? "cursor-default" : ""}`;

  const features =
    plan.features && plan.features.length > 0
      ? plan.features
      : ["400 GB Storage", "Unlimited Photos & Videos", "Exclusive Support"];

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <section
        className="relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-24"
        aria-labelledby="pricing-preview-heading"
      >
        <Container as="div" className="relative">
          <header className="mx-auto max-w-2xl text-center">
            <h2
              id="pricing-preview-heading"
              className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {settings.sectionTitle || "We Offer Great Affordable Premium Prices."}
            </h2>
            {settings.sectionDescription ? (
              <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">{settings.sectionDescription}</p>
            ) : (
              <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">
                Monthly billing preview (toggle is only on the full pricing section).
              </p>
            )}
          </header>

          <ul className="mx-auto mt-12 flex max-w-5xl justify-center sm:mt-16">
            <li
              className={`flex w-full max-w-sm flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-sm sm:p-10 ${
                plan.featured ? "ring-2 ring-blue-500/30 ring-offset-4 ring-offset-muted md:ring-2" : ""
              }`}
            >
              <h3 className="text-xl font-semibold text-foreground">{plan.name || "Plan"}</h3>
              <p className="mt-4">
                <span className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  ${formatPlanPriceForDisplay(price)}
                </span>
              </p>
              {plan.subtext ? <p className="mt-1 text-xs text-muted-foreground">{plan.subtext}</p> : null}
              {plan.ctaLink ? (
                <Link href={plan.ctaLink} className={ctaClass}>
                  {plan.ctaText || "CTA"}
                </Link>
              ) : (
                <span className={ctaClass}>{plan.ctaText || "CTA"}</span>
              )}
              <ul className="mt-8 flex flex-col gap-3 border-t border-border pt-8 sm:mt-10">
                {features.map((feature) => (
                  <li key={feature} className="text-sm text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.footnote ? (
                <p className="mt-6 text-center text-xs text-muted-foreground sm:mt-8">{plan.footnote}</p>
              ) : null}
            </li>
          </ul>
        </Container>
      </section>
    </PreviewChrome>
  );
}
