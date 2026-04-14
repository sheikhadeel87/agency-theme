import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  getPublishedServices,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isServicesSectionEnabled,
} from "@/lib/admin-data";
import { buildPublicMetadata } from "@/lib/seo-metadata";
import { HOMEPAGE_SERVICES_SECTION_HREF } from "@/lib/homepage-section-anchors";
import { htmlToPlainText } from "@/lib/html-utils";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { serviceDetailUrlSegment } from "@/lib/service-detail-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: "Services | What serviceswe offer",
  description:
    "Explore our published services — strategy, design, development, and more. Open a service for full details.",
  keywords: "services, web development, design, agency offerings, digital",
});

const SERVICE_FALLBACK_IMAGE = "/images/hero.png";

export default async function ServicesArchivePage() {
  if (!(await isServicesSectionEnabled())) notFound();

  const [services, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPublishedServices(),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

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
                href={HOMEPAGE_SERVICES_SECTION_HREF}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to services section
              </Link>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/90">
              What services we have
            </p>
            <h1 className="mt-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-indigo-900 bg-clip-text text-2xl font-semibold leading-tight text-transparent dark:from-white dark:via-slate-200 dark:to-indigo-300 sm:text-3xl lg:text-4xl">
              Services
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Every published service — open a card for the full description.
            </p>
          </Container>
        </div>

        <Container as="div" className="py-8 sm:py-12">
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No published services yet. Check back soon.
            </p>
          ) : (
            <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {services.map((svc, index) => {
                const cardImageSrc = svc.imageUrl?.trim() || SERVICE_FALLBACK_IMAGE;
                const href = `/services/${encodeURIComponent(serviceDetailUrlSegment(svc))}`;
                const plain = htmlToPlainText(svc.description);
                const isLcp = index === 0;
                return (
                  <li key={svc._id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
                      <Link
                        href={href}
                        className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-[2/1] overflow-hidden rounded-t-2xl bg-muted">
                          <Image
                            src={cardImageSrc}
                            alt={svc.title || ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={isLcp}
                            loading={isLcp ? "eager" : "lazy"}
                            unoptimized={shouldUseUnoptimizedImage(cardImageSrc)}
                          />
                        </div>
                        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
                          <h2 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                            {svc.title || "Untitled"}
                          </h2>
                          {plain ? (
                            <p className="line-clamp-2 text-sm text-muted-foreground">{plain}</p>
                          ) : null}
                        </div>
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
