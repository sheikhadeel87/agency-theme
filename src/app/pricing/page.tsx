import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingSection } from "@/sections/home/PricingSection";
import { getPricingSettings, getPricingPlans, getSiteSettings } from "@/lib/admin-data";

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
  const [settings, plans, siteSettings] = await Promise.all([
    getPricingSettings(),
    getPricingPlans(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header siteSettings={siteSettings} />
      <main>
        <PricingSection settings={settings} plans={plans} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
