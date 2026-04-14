import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  getPublishedServiceBySlugOrId,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isServicesSectionEnabled,
} from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { buildPublicMetadata } from "@/lib/seo-metadata";
import { htmlToPlainText } from "@/lib/html-utils";

export const dynamic = "force-dynamic";

const SERVICE_FALLBACK_IMAGE = "/images/hero.png";

function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

function metaDescriptionFallback(description: string): string {
  const t = htmlToPlainText(description);
  if (t.length <= 160) return t;
  return `${t.slice(0, 159).trim()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!(await isServicesSectionEnabled())) return {};
  const svc = await getPublishedServiceBySlugOrId(slug);
  if (!svc) return {};
  const title = svc.metaTitle || svc.title || "Service";
  const description =
    svc.metaDescription?.trim() ||
    metaDescriptionFallback(svc.description) ||
    "Service details from our agency.";
  return buildPublicMetadata({
    title,
    description,
    keywords: svc.metaKeywords || undefined,
    openGraph: svc.imageUrl ? { images: [svc.imageUrl] } : undefined,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await isServicesSectionEnabled())) notFound();

  const [service, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPublishedServiceBySlugOrId(slug),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  if (!service) notFound();

  const heroImageSrc = service.imageUrl?.trim() || SERVICE_FALLBACK_IMAGE;

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p: { title: string; slug: string }) => ({
          title: p.title,
          slug: p.slug,
        }))}
        navVisibility={navVisibility}
      />
      <main className="min-h-screen bg-background">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div">
            <Link
              href="/services"
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to services
            </Link>

            <div className="mx-auto w-full max-w-3xl">
              <header className="mb-8">
                <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                  {service.title || "Service"}
                </h1>
              </header>

              <div className="relative mb-10 h-[min(32vh,260px)] w-full overflow-hidden rounded-2xl bg-muted sm:h-[min(36vh,300px)] sm:rounded-3xl md:h-[min(38vh,340px)]">
                <Image
                  src={heroImageSrc}
                  alt={service.title || "Service"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  loading="eager"
                  unoptimized={shouldUseUnoptimizedImage(heroImageSrc)}
                />
              </div>

              {service.description ? (
                <div className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400">
                  {looksLikeHtml(service.description) ? (
                    <div
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-muted-foreground">{service.description}</div>
                  )}
                </div>
              ) : null}
            </div>
          </Container>
        </article>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
