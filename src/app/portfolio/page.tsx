import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { PortfolioFilter } from "@/components/portfolio/PortfolioFilter";
import {
  getPublishedPortfolioProjects,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isPortfolioSectionEnabled,
  portfolioCategoriesFromProjects,
} from "@/lib/admin-data";
import { buildPublicMetadata } from "@/lib/seo-metadata";
import { HOMEPAGE_PORTFOLIO_SECTION_HREF } from "@/lib/homepage-section-anchors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: "Portfolio | Case studies & client projects",
  description:
    "Explore our recent web, brand, and product work. Filter by category and see case studies from our agency portfolio.",
  keywords: "portfolio, case studies, web design, projects, agency work, creative",
});

export default async function PortfolioArchivePage() {
  if (!(await isPortfolioSectionEnabled())) notFound();

  const [projects, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPublishedPortfolioProjects(),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  const published = projects.filter((p) => p.status === "Published");
  const categories = portfolioCategoriesFromProjects(published);

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
        navVisibility={navVisibility}
      />
      <main className="min-h-screen bg-muted">
        <div className="border-b border-border bg-background py-8 sm:py-10">
          <Container as="div">
            <nav className="mb-4">
              <Link
                href={HOMEPAGE_PORTFOLIO_SECTION_HREF}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to portfolio section
              </Link>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/90">
              Selected work
            </p>
            <h1 className="mt-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-indigo-900 bg-clip-text text-2xl font-semibold leading-tight text-transparent dark:from-white dark:via-slate-200 dark:to-indigo-300 sm:text-3xl lg:text-4xl">
              Portfolio
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Every published project — open a card for the full case study.
            </p>
          </Container>
        </div>

        <Container as="div" className="py-8 sm:py-12">
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No published projects yet. Check back soon.
            </p>
          ) : (
            <PortfolioFilter projects={projects} categories={categories} />
          )}
        </Container>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
