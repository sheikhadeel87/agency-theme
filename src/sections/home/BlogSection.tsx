import Image from "next/image";
import Link from "next/link";
import { User, Calendar, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { BlogPost } from "@/lib/admin-data";
import { HOMEPAGE_BLOG_SECTION_ID } from "@/lib/homepage-section-anchors";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const BLOG_FALLBACK_IMAGE = "/images/blog-1.png";

export type BlogSectionProps = {
  posts: BlogPost[];
};

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

export function BlogSection({ posts }: BlogSectionProps) {
  const published = posts.filter((p) => p.is_published);

  return (
    <section
      id={HOMEPAGE_BLOG_SECTION_ID}
      className="relative overflow-hidden bg-[#fafafa] py-16 sm:py-20 lg:py-24"
      aria-labelledby="blog-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-gradient-to-br from-sky-200/40 via-indigo-200/30 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[380px] w-[65%] rounded-full bg-gradient-to-tl from-blue-200/35 via-sky-200/25 to-transparent blur-3xl" />
      </div>

      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 sm:text-sm">
            Stories & insights
          </p>
          <h2
            id="blog-heading"
            className="mt-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-indigo-900 bg-clip-text text-xl font-semibold leading-tight text-transparent sm:mt-3 sm:text-2xl lg:text-3xl"
          >
            Latest Blogs & News
          </h2>
          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 sm:mt-4" />
          <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
            Ideas, build notes, and updates from our team — click a card to read
            the full story.
          </p>
        </header>

        <ul className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {published.map((post, index) => {
            const cardImageSrc = post.imageUrl?.trim() || BLOG_FALLBACK_IMAGE;
            const isLcpCandidate = index === 0;
            return (
              <li key={post._id}>
                <article
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-out motion-reduce:transform-none motion-reduce:hover:translate-y-0 hover:-translate-y-1 ${
                    post.is_featured
                      ? "shadow-md shadow-blue-500/10 ring-1 ring-blue-200/80 hover:shadow-xl hover:shadow-blue-500/15"
                      : "shadow-sm ring-1 ring-gray-100/80 hover:shadow-xl hover:ring-gray-200/90"
                  }`}
                >
                  <Link
                    href={post.slug ? `/blog/${encodeURIComponent(post.slug)}` : "/blog"}
                    className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[2/1] overflow-hidden rounded-t-2xl bg-gray-100">
                      <Image
                        src={cardImageSrc}
                        alt={post.title || ""}
                        fill
                        className="object-cover transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.06]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={isLcpCandidate}
                        loading={isLcpCandidate ? "eager" : "lazy"}
                        unoptimized={shouldUseUnoptimizedImage(cardImageSrc)}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-col gap-2.5 p-4 sm:p-5 sm:gap-3">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        {post.is_featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/70">
                            <Sparkles className="size-3.5 shrink-0 text-amber-600" aria-hidden />
                            Featured
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <User className="size-4 shrink-0" aria-hidden />
                          {post.author || "—"}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar className="size-4 shrink-0" aria-hidden />
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-[#0f172a] transition-colors duration-200 group-hover:text-blue-600 sm:text-lg">
                        {post.title || "Untitled"}
                      </h3>
                    </div>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
