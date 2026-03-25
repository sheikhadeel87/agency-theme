import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  getPortfolioProjectBySlug,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isPortfolioSectionEnabled,
} from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const PORTFOLIO_FALLBACK_IMAGE = "/images/hero.png";

export const dynamic = "force-dynamic";

function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!(await isPortfolioSectionEnabled())) return {};
  const project = await getPortfolioProjectBySlug(slug);
  if (!project || project.status !== "Published") return {};
  const title = project.metaTitle || project.title || "Portfolio Project";
  const description = project.metaDescription || project.shortDescription || "";
  const keywords = project.metaKeywords
    ? project.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;
  return {
    title,
    description: description || undefined,
    keywords: keywords?.length ? keywords : undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

export default async function PortfolioProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await isPortfolioSectionEnabled())) notFound();

  const [project, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPortfolioProjectBySlug(slug),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  if (!project || project.status !== "Published") notFound();

  const heroImageSrc = project.imageUrl?.trim() || PORTFOLIO_FALLBACK_IMAGE;

  const gallery = Array.isArray(project.galleryImages)
    ? project.galleryImages.filter((u): u is string => typeof u === "string" && u.trim() !== "")
    : [];

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
      />
      <main className="min-h-screen bg-background">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div">
            <Link
              href="/portfolio"
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to portfolio
            </Link>

            {/* Same reading column + hero treatment as blog post pages */}
            <div className="mx-auto w-full max-w-3xl">
              <header className="mb-8">
                <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                  {project.title || "Untitled Project"}
                </h1>
                {project.client && (
                  <p className="mt-2 text-lg text-muted-foreground">Client: {project.client}</p>
                )}
                {project.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="relative mb-10 h-[min(32vh,260px)] w-full overflow-hidden rounded-2xl bg-muted sm:h-[min(36vh,300px)] sm:rounded-3xl md:h-[min(38vh,340px)]">
                <Image
                  src={heroImageSrc}
                  alt={project.title || "Project"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  loading="eager"
                  unoptimized={shouldUseUnoptimizedImage(heroImageSrc)}
                />
              </div>

              {project.shortDescription && (
                <p className="mb-8 text-lg text-muted-foreground">{project.shortDescription}</p>
              )}
            </div>

            {project.fullDescription && (
              <div className="prose prose-neutral mx-auto mb-10 max-w-3xl dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400">
                {looksLikeHtml(project.fullDescription) ? (
                  <div
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {project.fullDescription}
                  </div>
                )}
              </div>
            )}

            <div className="mx-auto max-w-3xl">
              {project.technologyStack.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Technology
                  </h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {project.technologyStack.map((t) => (
                      <li
                        key={t}
                        className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-foreground"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.projectUrl && (
                <p className="mb-10">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
                  >
                    View project →
                  </a>
                </p>
              )}

              {gallery.length > 0 && (
                <section className="pb-4">
                  <h2 className="mb-6 text-xl font-semibold text-foreground">Gallery</h2>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {gallery.map((url, i) => (
                      <li
                        key={i}
                        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                      >
                        <Image
                          src={url}
                          alt={`${project.title} gallery ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 384px"
                          unoptimized={shouldUseUnoptimizedImage(url)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </Container>
        </article>
      </main>
      <Footer siteSettings={siteSettings} navVisibility={navVisibility} />
    </>
  );
}
