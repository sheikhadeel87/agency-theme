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
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="portfolio-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden
      >
        <div className="absolute -right-1/4 top-0 h-[400px] w-[65%] rounded-full bg-gradient-to-bl from-sky-200/40 via-indigo-200/30 to-transparent blur-3xl" />
        <div className="absolute -left-1/4 bottom-0 h-[400px] w-[70%] rounded-full bg-gradient-to-tr from-violet-200/35 via-fuchsia-200/20 to-transparent blur-3xl" />
      </div>

      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 sm:text-sm">
            Selected work
          </p>
          <h2
            id="portfolio-heading"
            className="mt-3 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-indigo-900 bg-clip-text text-2xl font-semibold leading-tight text-transparent sm:mt-4 sm:text-3xl lg:text-4xl"
          >
            Our Recent Works & Case Studies
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 sm:mt-5" />
          <p className="mt-4 text-gray-600 sm:mt-6 sm:text-lg">
            Real projects, real outcomes — filter by category or browse everything
            we&apos;ve shipped recently.
          </p>
        </header>

        <PortfolioFilter projects={published} categories={categories} />
      </Container>
    </section>
  );
}
