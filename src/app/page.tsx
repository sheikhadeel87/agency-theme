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
import {
  getHomepageServices,
  getSiteSettings,
  getHeroData,
  getHomepagePortfolioProjects,
  portfolioCategoriesFromProjects,
  getHomepageBlogPosts,
  getTeamSettings,
  getHomepageTeamMembers,
  getWhyChooseUsSettings,
  getTestimonialsSettings,
  getTestimonials,
  getPricingSettings,
  getHomepagePricingPlans,
  getPublishedPages,
} from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
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
  ] = await Promise.all([
    getHomepageServices(),
    getSiteSettings(),
    getHeroData(),
    getHomepagePortfolioProjects(),
    getHomepageBlogPosts(),
    getTeamSettings(),
    getHomepageTeamMembers(),
    getWhyChooseUsSettings(),
    getTestimonialsSettings(),
    getTestimonials(),
    getPricingSettings(),
    getHomepagePricingPlans(),
    getPublishedPages(),
  ]);

  const portfolioCategories = portfolioCategoriesFromProjects(portfolio);

  return (
    <>
      <Header siteSettings={siteSettings} dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))} />
      <main>
        <Hero heroData={hero} />
        <FeaturesHighlights />
        <WhyChooseUs settings={whyChooseUsSettings} />
        <TeamSection settings={teamSettings} members={teamMembers} />
        <ServicesSection services={services} />
        <PricingSection settings={pricingSettings} plans={pricingPlans} />
        <PortfolioSection
          projects={portfolio}
          categories={portfolioCategories}
        />
        <TestimonialsSection settings={testimonialsSettings} testimonials={testimonials} />
        <BlogSection posts={blogPosts} />
        <ContactSection siteSettings={siteSettings} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
