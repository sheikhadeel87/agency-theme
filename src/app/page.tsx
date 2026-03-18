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
} from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, siteSettings, hero, portfolio, portfolioCategories, blogPosts] =
    await Promise.all([
      getServices(),
      getSiteSettings(),
      getHeroData(),
      getPortfolioProjects(),
      getPortfolioCategories(),
      getBlogPosts(),
    ]);

  return (
    <>
      <Header siteSettings={siteSettings} />
      <main>
        <Hero heroData={hero} />
        <FeaturesHighlights />
        <WhyChooseUs />
        <TeamSection />
        <ServicesSection services={services} />
        <PricingSection />
        <PortfolioSection
          projects={portfolio}
          categories={portfolioCategories}
        />
        <TestimonialsSection />
        <BlogSection posts={blogPosts} />
        <ContactSection siteSettings={siteSettings} />
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
