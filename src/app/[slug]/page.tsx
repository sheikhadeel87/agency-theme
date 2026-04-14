import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  getPageBySlug,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
} from "@/lib/admin-data";
import { buildPublicMetadata } from "@/lib/seo-metadata";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = new Set([
  "admin",
  "blog",
  "portfolio",
  "pricing",
  "preview",
  "privacy-policy",
  "terms-conditions",
  "api",
  "team",
  "services",
  "contact",
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const page = await getPageBySlug(slug);
  if (!page) return buildPublicMetadata({ title: "Page not found" });
  return buildPublicMetadata({
    title: page.metaTitle || page.title || "Page",
    description: page.metaDescription || undefined,
    keywords: page.metaKeywords || undefined,
  });
}

export default async function DynamicPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();

  const [page, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPageBySlug(slug),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  if (!page) notFound();

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
        navVisibility={navVisibility}
      />
      <main className="min-h-screen bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <article className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {page.title}
            </h1>
            {page.content ? (
              <div
                className="mt-8 prose prose-neutral max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-ul:list-disc prose-ol:list-decimal"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="mt-6 text-muted-foreground">No content yet.</p>
            )}
          </article>
        </Container>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
