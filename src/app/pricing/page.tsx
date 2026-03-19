import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/sections/home/PricingSection";
import { getPricingSettings, getPricingPlans, getSiteSettings, getPublishedPages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
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
  const [settings, plans, siteSettings, dynamicPages] = await Promise.all([
    getPricingSettings(),
    getPricingPlans(),
    getSiteSettings(),
    getPublishedPages(),
  ]);

  return (
    <>
      <Header siteSettings={siteSettings} dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))} />
      <main>
        <PricingSection settings={settings} plans={plans} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
