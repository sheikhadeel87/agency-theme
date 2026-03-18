import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getBlogPostBySlug, getSiteSettings } from "@/lib/admin-data";

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
  const [post, siteSettings] = await Promise.all([
    getBlogPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post || !post.is_published) notFound();

  return (
    <>
      <Header siteSettings={siteSettings} />
      <main className="min-h-screen bg-white">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div">
            <Link
              href="/#blog"
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Blog
            </Link>

            <header className="mb-10">
              {post.is_featured && (
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Featured
                </span>
              )}
              <h1 className="text-3xl font-semibold leading-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
                {post.title || "Untitled"}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {post.author && <span>By {post.author}</span>}
                {(post.publishedAt || post.createdAt) && (
                  <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                )}
              </div>
            </header>

            {post.imageUrl && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 sm:rounded-3xl">
                <Image
                  src={post.imageUrl}
                  alt={post.title || "Post"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>
            )}

            {post.description && (
              <p className="mb-8 text-lg text-gray-600">{post.description}</p>
            )}

            {post.content && (
              <div
                className="prose prose-gray max-w-none"
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
