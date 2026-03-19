import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getBlogPostBySlug, getSiteSettings, getPublishedPages } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

const BLOG_FALLBACK_IMAGE = "/images/blog-1.png";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || !post.is_published) return { title: "Post not found" };
  return {
    title: post.metaTitle || post.title || "Blog",
    description: post.metaDescription || post.description || undefined,
    keywords: post.metaKeywords ? post.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    openGraph: post.ogImage ? { images: [post.ogImage] } : undefined,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, siteSettings, dynamicPages] = await Promise.all([
    getBlogPostBySlug(slug),
    getSiteSettings(),
    getPublishedPages(),
  ]);

  if (!post || !post.is_published) notFound();

  const heroImageSrc = post.imageUrl?.trim() || BLOG_FALLBACK_IMAGE;

  return (
    <>
      <Header siteSettings={siteSettings} dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))} />
      <main className="min-h-screen bg-white">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div">
            <Link
              href="/blog"
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Blog
            </Link>

            {/* Match reading column: hero + title aren’t full-bleed edge-to-edge */}
            <div className="mx-auto w-full max-w-3xl">
              <header className="mb-6">
                {post.is_featured && (
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Featured
                  </span>
                )}
                <h1 className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
                  {post.title || "Untitled"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                  {post.author && <span>By {post.author}</span>}
                  {(post.publishedAt || post.createdAt) && (
                    <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                  )}
                </div>
              </header>

              <div className="relative mb-8 h-[min(22vh,140px)] w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[min(24vh,160px)] sm:rounded-2xl md:h-[min(26vh,180px)]">
                <Image
                  src={heroImageSrc}
                  alt={post.title || "Post"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  loading="eager"
                  unoptimized={shouldUseUnoptimizedImage(heroImageSrc)}
                />
              </div>

              {post.description && (
                <p className="mb-6 text-base text-gray-600 sm:text-lg">{post.description}</p>
              )}
            </div>

            {post.content && (
              <div
                className="prose prose-gray mx-auto max-w-3xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}
          </Container>
        </article>
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
