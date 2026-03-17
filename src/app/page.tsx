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

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturesHighlights />
        <WhyChooseUs />
        <TeamSection />
        <ServicesSection />
        <PricingSection />
        <PortfolioSection />
        <TestimonialsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
