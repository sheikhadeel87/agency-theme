import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { User } from "lucide-react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  cmsEnabled,
  getTeamMembers,
  getTeamSettings,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isTeamSectionEnabled,
} from "@/lib/admin-data";
import { HOMEPAGE_TEAM_SECTION_HREF } from "@/lib/homepage-section-anchors";
import { htmlToPlainText } from "@/lib/html-utils";
import { buildPublicMetadata } from "@/lib/seo-metadata";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getTeamSettings();
  const title = settings.metaTitle?.trim() || settings.sectionTitle?.trim() || "Team";
  const description =
    settings.metaDescription?.trim() ||
    htmlToPlainText(settings.sectionDescription) ||
    "Meet the people behind our agency—designers, developers, and strategists.";
  return cmsEnabled(settings.isEnabled)
    ? buildPublicMetadata({
        title,
        description,
        keywords: settings.metaKeywords?.trim() || undefined,
      })
    : buildPublicMetadata({
        title: "Team",
        description: "Meet the people behind our agency—designers, developers, and strategists.",
      });
}

export default async function TeamArchivePage() {
  if (!(await isTeamSectionEnabled())) notFound();

  const [members, teamSettings, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getTeamMembers(),
    getTeamSettings(),
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
                href={HOMEPAGE_TEAM_SECTION_HREF}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to team section
              </Link>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">
              Our people
            </p>
            <h1 className="mt-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-indigo-900 bg-clip-text text-2xl font-semibold leading-tight text-transparent dark:from-white dark:via-slate-200 dark:to-indigo-300 sm:text-3xl lg:text-4xl">
              {teamSettings.sectionTitle?.trim() || "Team"}
            </h1>
            {teamSettings.sectionDescription ? (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {teamSettings.sectionDescription}
              </p>
            ) : (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Everyone on the team — open a profile to read more.
              </p>
            )}
          </Container>
        </div>

        <Container as="div" className="py-8 sm:py-12">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground">No team members yet. Check back soon.</p>
          ) : (
            <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {members.map((member, index) => {
                const href = `/team/${encodeURIComponent(member.slug?.trim() || member._id)}`;
                const plainBio = htmlToPlainText(member.bio);
                const isLcp = index === 0;
                return (
                  <li key={member._id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
                      <Link
                        href={href}
                        className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-muted sm:aspect-[5/4]">
                          {member.imageUrl ? (
                            <Image
                              src={member.imageUrl}
                              alt={member.name || ""}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              priority={isLcp}
                              loading={isLcp ? "eager" : "lazy"}
                              unoptimized={shouldUseUnoptimizedImage(member.imageUrl)}
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-5xl font-semibold text-muted-foreground/40">
                              {member.name.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 p-4 sm:p-5">
                          {member.role ? (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                              <User className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                              {member.role}
                            </span>
                          ) : null}
                          <h2 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                            {member.name || "Untitled"}
                          </h2>
                          {plainBio ? (
                            <p className="line-clamp-2 text-sm text-muted-foreground">{plainBio}</p>
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
