import { Container } from "@/components/ui/Container";
import { PortfolioFilter } from "../../components/portfolio/PortfolioFilter";
import type { PortfolioProject } from "@/lib/admin-data";

export type PortfolioSectionProps = {
  projects: PortfolioProject[];
  categories: string[];
};

export function PortfolioSection({ projects, categories }: PortfolioSectionProps) {
  const published = projects.filter((p) => p.status === "Published");

  return (
    <section
      id="portfolio"
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="portfolio-heading"
    >
      <Container as="div">
        <header className="mx-auto max-w-5xl text-center">
          <h2
            id="portfolio-heading"
            className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl"
          >
            Our Recent Works & Case Studies
          </h2>
          <p className="mt-5 text-gray-600 sm:mt-6 sm:text-lg">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using.
          </p>

          <PortfolioFilter projects={published} categories={categories} />
        </header>
      </Container>
    </section>
  );
}
