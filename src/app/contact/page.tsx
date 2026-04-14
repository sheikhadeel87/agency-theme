import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ContactSection } from "@/sections/home/ContactSection";
import {
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isContactSectionEnabled,
} from "@/lib/admin-data";
import { buildPublicMetadata } from "@/lib/seo-metadata";
import { HOMEPAGE_CONTACT_SECTION_HREF } from "@/lib/homepage-section-anchors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: "Contact | Get in touch",
  description:
    "Reach our team by email, phone, or the contact form. We respond to project inquiries and partnerships.",
  keywords: "contact, get in touch, inquiry, agency contact, support",
});

export default async function ContactPage() {
  if (!(await isContactSectionEnabled())) notFound();

  const [siteSettings, dynamicPages, navVisibility] = await Promise.all([
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
                href={HOMEPAGE_CONTACT_SECTION_HREF}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to homepage contact section
              </Link>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600/90">
              Let&apos;s talk
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Same details and form as on the homepage — use the map, details, or send a message below.
            </p>
          </Container>
        </div>
        <ContactSection siteSettings={siteSettings} />
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
