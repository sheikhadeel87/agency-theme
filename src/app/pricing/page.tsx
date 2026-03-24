import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/sections/home/PricingSection";
import {
  getPricingSettings,
  getPricingPlans,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isPricingSectionEnabled,
} from "@/lib/admin-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  if (!(await isPricingSectionEnabled())) {
    return { title: "Not found" };
  }
  const settings = await getPricingSettings();
  return {
    title: settings.metaTitle || settings.sectionTitle || "Pricing",
    description: settings.metaDescription || settings.sectionDescription || undefined,
    keywords: settings.metaKeywords
      ? settings.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : undefined,
  };
}

export default async function PricingPage() {
  if (!(await isPricingSectionEnabled())) notFound();

  const [settings, plans, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPricingSettings(),
    getPricingPlans(),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
      />
      <main>
        <PricingSection settings={settings} plans={plans} />
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
