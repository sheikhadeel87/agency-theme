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
  getServices,
  getSiteSettings,
  getHeroData,
  getPortfolioProjects,
  getPortfolioCategories,
  getBlogPosts,
  getTeamSettings,
  getTeamMembers,
  getWhyChooseUsSettings,
  getTestimonialsSettings,
  getTestimonials,
  getPricingSettings,
  getPricingPlans,
} from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    services,
    siteSettings,
    hero,
    portfolio,
    portfolioCategories,
    blogPosts,
    teamSettings,
    teamMembers,
    whyChooseUsSettings,
    testimonialsSettings,
    testimonials,
    pricingSettings,
    pricingPlans,
  ] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getHeroData(),
    getPortfolioProjects(),
    getPortfolioCategories(),
    getBlogPosts(),
    getTeamSettings(),
    getTeamMembers(),
    getWhyChooseUsSettings(),
    getTestimonialsSettings(),
    getTestimonials(),
    getPricingSettings(),
    getPricingPlans(),
  ]);

  return (
    <>
      <Header siteSettings={siteSettings} />
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
