"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { PricingSettingsData, PricingPlanItem } from "@/lib/admin-data";
import { formatPlanPriceForDisplay, sanitizePlanPrice } from "@/lib/pricing-display";

export type PricingSectionProps = {
  settings: PricingSettingsData;
  plans: PricingPlanItem[];
};

export function PricingSection({ settings, plans }: PricingSectionProps) {
  const [billingAnnual, setBillingAnnual] = useState(false);

  const displayPlans = plans.length > 0 ? plans : [
    {
      _id: "fallback",
      name: "Starter",
      priceMonthly: 29,
      priceAnnual: 290,
      periodLabel: "per month",
      subtext: "No credit card required",
      ctaText: "Try for free",
      ctaLink: "",
      features: ["400 GB Storage", "Unlimited Photos & Videos", "Exclusive Support"],
      footnote: "7-day free trial",
      featured: false,
      featuredOnHomepage: false,
      order: 0,
    },
    {
      _id: "fallback-2",
      name: "Growth Plan",
      priceMonthly: 59,
      priceAnnual: 590,
      periodLabel: "per month",
      subtext: "No credit card required",
      ctaText: "Try for free",
      ctaLink: "",
      features: ["400 GB Storage", "Unlimited Photos & Videos", "Exclusive Support"],
      footnote: "7-day free trial",
      featured: true,
      order: 1,
    },
    {
      _id: "fallback-3",
      name: "Business",
      priceMonthly: 139,
      priceAnnual: 1390,
      periodLabel: "per month",
      subtext: "No credit card required",
      ctaText: "Try for free",
      ctaLink: "",
      features: ["400 GB Storage", "Unlimited Photos & Videos", "Exclusive Support"],
      footnote: "7-day free trial",
      featured: false,
      featuredOnHomepage: false,
      order: 2,
    },
  ] as PricingPlanItem[];

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-24"
      aria-labelledby="pricing-heading"
    >
      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center [animation:pricing-fade-in-up_0.6s_ease-out_both]">
          <h2
            id="pricing-heading"
            className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {settings.sectionTitle || "We Offer Great Affordable Premium Prices."}
          </h2>
          {settings.sectionDescription ? (
            <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">
              {settings.sectionDescription}
            </p>
          ) : (
            <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The point
              of using.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
            <span className={`text-sm font-medium ${!billingAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Bill Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={billingAnnual}
              onClick={() => setBillingAnnual((v) => !v)}
              className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full bg-muted-foreground/20 px-1 transition-colors duration-300 sm:h-9 sm:w-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
            >
              <span
                className="block size-6 rounded-full bg-blue-600 shadow-sm transition-transform duration-300 ease-out sm:size-7"
                style={{ transform: billingAnnual ? "translateX(calc(100% + 2px))" : "translateX(0)" }}
              />
            </button>
            <span className={`text-sm font-medium ${billingAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Bill Annually
            </span>
          </div>
        </header>

        <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:mt-16 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {displayPlans.map((plan, index) => {
            const price = sanitizePlanPrice(
              billingAnnual ? plan.priceAnnual : plan.priceMonthly
            );
            const periodLabel = billingAnnual ? "per year" : (plan.periodLabel || "per month");
            const ctaClass = `mt-6 w-full rounded-full py-3.5 text-center text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:mt-8 ${
              plan.featured
                ? "bg-blue-600 hover:bg-rose-400 focus:bg-rose-400 active:bg-rose-500"
                : "bg-pink-500 hover:bg-rose-400 focus:bg-rose-400 active:bg-rose-500"
            } ${!plan.ctaLink ? "cursor-default" : ""}`;

            return (
              <li
                key={plan._id}
                className={`flex flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg sm:p-10 ${
                  plan.featured
                    ? "ring-2 ring-blue-500/30 ring-offset-4 ring-offset-muted md:ring-2"
                    : ""
                }`}
                style={{
                  animation: "pricing-card-in 0.5s ease-out both",
                  animationDelay: `${120 + index * 80}ms`,
                }}
              >
                <h3 className="text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    ${formatPlanPriceForDisplay(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/{periodLabel}</span>
                </p>
                {plan.subtext ? (
                  <p className="mt-1 text-xs text-muted-foreground">{plan.subtext}</p>
                ) : null}
                {plan.ctaLink ? (
                  <Link href={plan.ctaLink} className={ctaClass}>
                    {plan.ctaText}
                  </Link>
                ) : (
                  <span className={ctaClass}>{plan.ctaText}</span>
                )}
                <ul className="mt-8 flex flex-col gap-3 border-t border-border pt-8 sm:mt-10">
                  {(plan.features && plan.features.length > 0
                    ? plan.features
                    : ["400 GB Storage", "Unlimited Photos & Videos", "Exclusive Support"]
                  ).map((feature) => (
                    <li key={feature} className="text-sm text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.footnote ? (
                  <p className="mt-6 text-center text-xs text-muted-foreground sm:mt-8">
                    {plan.footnote}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
