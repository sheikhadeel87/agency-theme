import type { Metadata } from "next";
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
import { buildNavSectionVisibility, getHomepageViewBundle, getSiteSettings } from "@/lib/admin-data";
import { buildPublicMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const name = site?.siteName?.trim() || site?.logoText?.trim() || "Agency Theme";
  const title = `${name} | Digital agency, web design & development`;
  const description = `${name} delivers modern websites, branding, and digital experiences. Explore services, portfolio, pricing, blog, and team.`;
  return buildPublicMetadata({ title, description });
}

export default async function Home() {
  const {
    services,
    siteSettings,
    hero,
    portfolio,
    blogPosts,
    teamSettings,
    teamMembers,
    whyChooseUsSettings,
    testimonialsSettings,
    testimonials,
    pricingSettings,
    pricingPlans,
    dynamicPages,
    portfolioCategories,
  } = await getHomepageViewBundle();

  const navVisibility = buildNavSectionVisibility({
    siteSettings,
    hero,
    teamSettings,
    whyChooseUs: whyChooseUsSettings,
    pricing: pricingSettings,
    testimonials: testimonialsSettings,
  });

  const show = navVisibility;

  return (
    <>
      <Header siteSettings={siteSettings} dynamicPages={dynamicPages} navVisibility={navVisibility} />
      <main>
        {show.hero === true ? <Hero heroData={hero} /> : null}
        {show.featuresHighlights === true ? <FeaturesHighlights /> : null}
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
        {show.contact === true ? <ContactSection siteSettings={siteSettings} /> : null}
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
