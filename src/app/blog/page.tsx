import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { User, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import {
  getPublishedBlogPosts,
  getSiteSettings,
  getPublishedPages,
  getNavSectionVisibility,
  isBlogSectionEnabled,
} from "@/lib/admin-data";
import { HOMEPAGE_BLOG_SECTION_HREF } from "@/lib/homepage-section-anchors";
import { notFound } from "next/navigation";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest articles and news from our team.",
};

const BLOG_FALLBACK_IMAGE = "/images/blog-1.png";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogArchivePage() {
  if (!(await isBlogSectionEnabled())) notFound();

  const [posts, siteSettings, dynamicPages, navVisibility] = await Promise.all([
    getPublishedBlogPosts(),
    getSiteSettings(),
    getPublishedPages(),
    getNavSectionVisibility(),
  ]);

  return (
    <>
      <Header
        siteSettings={siteSettings}
        dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))}
      />
      <main className="min-h-screen bg-muted">
        <div className="border-b border-border bg-background py-8 sm:py-10">
          <Container as="div">
            <nav className="mb-4">
              <Link
                href={HOMEPAGE_BLOG_SECTION_HREF}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to blog section
              </Link>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">
              Stories & insights
            </p>
            <h1 className="mt-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-indigo-900 bg-clip-text text-2xl font-semibold leading-tight text-transparent dark:from-white dark:via-slate-200 dark:to-indigo-300 sm:text-3xl lg:text-4xl">
              Blog
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Everything we&apos;ve published — open a post to read the full story.
            </p>
          </Container>
        </div>

        <Container as="div" className="py-8 sm:py-12">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No published posts yet. Check back soon.
            </p>
          ) : (
            <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {posts.map((post, index) => {
                const cardImageSrc = post.imageUrl?.trim() || BLOG_FALLBACK_IMAGE;
                const href = post.slug
                  ? `/blog/${encodeURIComponent(post.slug)}`
                  : "#";
                const isLcp = index === 0;
                return (
                  <li key={post._id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
                      <Link
                        href={href}
                        className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      >
                        <div className="relative aspect-[2/1] overflow-hidden rounded-t-2xl bg-muted">
                          <Image
                            src={cardImageSrc}
                            alt={post.title || ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={isLcp}
                            loading={isLcp ? "eager" : "lazy"}
                            unoptimized={shouldUseUnoptimizedImage(cardImageSrc)}
                          />
                        </div>
                        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
                            <span className="flex items-center gap-1.5">
                              <User className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                              {post.author || "—"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                              {formatDate(post.publishedAt ?? post.createdAt)}
                            </span>
                          </div>
                          <h2 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                            {post.title || "Untitled"}
                          </h2>
                          {post.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {post.description}
                            </p>
                          )}
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
