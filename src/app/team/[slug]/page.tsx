import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  getTeamMemberBySlugOrId,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
} from "@/lib/admin-data";
import { hasMeaningfulHtmlContent } from "@/lib/html-utils";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const bioHtmlClassName =
  "team-member-bio mt-6 max-w-none text-base leading-relaxed text-gray-700 [&_p]:mt-3 [&_p]:first:mt-0 [&_p]:text-gray-700 [&_li]:text-gray-700 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:my-3 [&_ul]:list-inside [&_ul]:list-disc [&_ol]:my-3 [&_ol]:list-inside [&_ol]:list-decimal [&_a]:text-blue-600 [&_a]:underline";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlugOrId(decodeURIComponent(slug));
  if (!member) return { title: "Team member" };
  return {
    title: `${member.name} | Team`,
    description: member.role
      ? `${member.name} — ${member.role}`
      : member.name,
    openGraph: member.imageUrl ? { images: [member.imageUrl] } : undefined,
  };
}

export default async function TeamMemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const [member, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getTeamMemberBySlugOrId(slug),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  if (!member) notFound();

  const hasBio = hasMeaningfulHtmlContent(member.bio);
  const bioIsHtml = hasBio && member.bio.includes("<");

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
        navVisibility={navVisibility}
      />
      <main className="min-h-screen bg-[#fafafa]">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div" className="max-w-3xl">
            <Link
              href="/#team"
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to team
            </Link>

            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:rounded-3xl">
              <div className="grid gap-0 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-start">
                <div className="relative aspect-square w-full max-h-[400px] bg-gray-100 sm:max-h-none sm:min-h-[320px]">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 280px"
                      priority
                      unoptimized={shouldUseUnoptimizedImage(member.imageUrl)}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-6xl font-semibold text-gray-300">
                      {member.name.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                  <h1 className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
                    {member.name}
                  </h1>
                  {member.role ? (
                    <p className="mt-2 text-lg text-gray-600">{member.role}</p>
                  ) : null}

                  {hasBio ? (
                    bioIsHtml ? (
                      <div
                        className={bioHtmlClassName}
                        dangerouslySetInnerHTML={{ __html: member.bio }}
                      />
                    ) : (
                      <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                        {member.bio.trim()}
                      </p>
                    )
                  ) : (
                    <p className="mt-6 text-sm text-gray-500">
                      No bio has been added for this team member yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </article>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
