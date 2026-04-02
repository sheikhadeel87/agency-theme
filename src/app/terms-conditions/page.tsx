import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { DefaultTermsConditionsContent } from "@/components/legal/DefaultTermsConditionsContent";
import {
  getLegalPageContent,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
} from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const legal = await getLegalPageContent();
  const title = legal.termsMetaTitle.trim() || "Terms & Conditions";
  const description = legal.termsMetaDescription.trim() || undefined;
  const rawKw = legal.termsMetaKeywords.trim();
  const keywords = rawKw
    ? rawKw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;
  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
  };
}

export default async function TermsConditionsPage() {
  const [legal, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getLegalPageContent(),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  const customHtml = legal.termsConditionsHtml.trim();
  const lastUpdated = legal.termsLastUpdated.trim() || String(new Date().getFullYear());

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
        navVisibility={navVisibility}
      />
      <main className="bg-background py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
              Terms & Conditions
            </h1>

            <p className="mt-4 text-muted-foreground">Last updated: {lastUpdated}</p>

            {customHtml ? (
              <div
                className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-ul:list-disc prose-ol:list-decimal"
                dangerouslySetInnerHTML={{ __html: customHtml }}
              />
            ) : (
              <DefaultTermsConditionsContent />
            )}
          </div>
        </Container>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
