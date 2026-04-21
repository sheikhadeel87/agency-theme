"use client";

import { useEffect, useMemo, useState } from "react";
import type { HomepageViewBundle, SiteSettingsData } from "@/lib/admin-data";
import { buildNavSectionVisibility } from "@/lib/nav-section-visibility";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { getDefaultNavigation } from "@/lib/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/home/Hero";
import { FeaturesHighlights } from "@/sections/home/FeaturesHighlights";
import { WhyChooseUs } from "@/sections/home/WhyChooseUs";
import { TeamSection } from "@/sections/home/TeamSection";
import { ServicesSection } from "@/sections/home/ServicesSection";
import { PricingSection } from "@/sections/home/PricingSection";
import { PortfolioSection } from "@/sections/home/PortfolioSection";
import { TestimonialsSection } from "@/sections/home/TestimonialsSection";
import { BlogSection } from "@/sections/home/BlogSection";
import { ContactSection } from "@/sections/home/ContactSection";

const TYPE = "site-settings";

const emptySiteSettings: SiteSettingsData = {
  _id: "",
  footerColumns: [],
  siteName: "",
  logoText: "",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "",
  phone: "",
  address: "",
  mapEmbedUrl: "",
  contactSectionTitle: "",
  contactSectionDescription: "",
  footerText: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
  servicesSectionEnabled: true,
  portfolioSectionEnabled: true,
  blogSectionEnabled: true,
  contactSectionEnabled: true,
  featuresHighlightsSectionEnabled: true,
  navigation: getDefaultNavigation(),
};

function mergeSiteDraft(
  base: SiteSettingsData,
  partial: Partial<SiteSettingsData> | null
): SiteSettingsData {
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    socialLinks: { ...base.socialLinks, ...partial.socialLinks },
    footerColumns: partial.footerColumns ?? base.footerColumns,
    navigation: partial.navigation ?? base.navigation,
  };
}

export function SiteSettingsPreviewClient(props: HomepageViewBundle) {
  const {
    siteSettings: serverSettings,
    dynamicPages,
    services,
    hero,
    portfolio,
    blogPosts,
    teamSettings,
    teamMembers,
    whyChooseUsSettings,
    featuresHighlightsSettings,
    testimonialsSettings,
    testimonials,
    pricingSettings,
    pricingPlans,
    portfolioCategories,
  } = props;

  const [draft, setDraft] = useState<Partial<SiteSettingsData> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
      if (raw) {
        try {
          setDraft(JSON.parse(raw) as Partial<SiteSettingsData>);
        } catch {
          /* ignore */
        }
      }
      setHydrated(true);
    });
  }, []);

  const base = serverSettings ?? emptySiteSettings;
  const effective = useMemo(() => mergeSiteDraft(base, draft), [base, draft]);

  useEffect(() => {
    const url = effective.faviconUrl?.trim();
    if (!url) return;
    const id = "agency-theme-preview-favicon";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
    return () => {
      link?.remove();
    };
  }, [effective.faviconUrl]);

  const navVisibility = useMemo(
    () =>
      buildNavSectionVisibility({
        siteSettings: effective,
        hero,
        teamSettings,
        whyChooseUs: whyChooseUsSettings,
        pricing: pricingSettings,
        testimonials: testimonialsSettings,
      }),
    [effective, hero, teamSettings, whyChooseUsSettings, pricingSettings, testimonialsSettings]
  );

  const show = navVisibility;
  const hasDraft = draft != null;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    );
  }

  return (
    <>
      <Header
        siteSettings={effective}
        dynamicPages={dynamicPages}
        navVisibility={navVisibility}
        lockNavigationToFallback={hasDraft}
      />
      <div className="bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-950">
        <span>Preview — not published</span>
        {!hasDraft ? (
          <span className="mt-1 block font-normal text-amber-900/90">
            No draft found in this browser tab. Use <strong className="font-medium">Preview</strong> on Site
            Settings (edit, Navigation, or Footer links) to see unsaved changes in the header, footer, and contact
            block.
          </span>
        ) : (
          <span className="mt-1 block font-normal text-amber-900/90">
            Header, footer, and contact reflect your form draft; other sections use saved homepage content.
          </span>
        )}
      </div>
      <main>
        {show.hero === true ? <Hero heroData={hero} /> : null}
        {show.featuresHighlights === true ? (
          <FeaturesHighlights settings={featuresHighlightsSettings} />
        ) : null}
        {show.whyChooseUs === true ? <WhyChooseUs settings={whyChooseUsSettings} /> : null}
        {show.team === true ? <TeamSection settings={teamSettings} members={teamMembers} /> : null}
        {show.services === true ? <ServicesSection services={services} /> : null}
        {show.pricing === true ? <PricingSection settings={pricingSettings} plans={pricingPlans} /> : null}
        {show.portfolio === true ? (
          <PortfolioSection projects={portfolio} categories={portfolioCategories} />
        ) : null}
        {show.testimonials === true ? (
          <TestimonialsSection settings={testimonialsSettings} testimonials={testimonials} />
        ) : null}
        {show.blog === true ? <BlogSection posts={blogPosts} /> : null}
        {show.contact === true ? <ContactSection siteSettings={effective} /> : null}
      </main>
      <Footer siteSettings={effective} navVisibility={navVisibility} />
    </>
  );
}
