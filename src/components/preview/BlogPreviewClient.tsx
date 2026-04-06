"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { HOMEPAGE_BLOG_SECTION_HREF } from "@/lib/homepage-section-anchors";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "blog";
const BLOG_FALLBACK_IMAGE = "/images/blog-1.png";

type Payload = {
  title?: string;
  author?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  is_featured?: boolean;
};

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function BlogPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [post, setPost] = useState<Payload | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
      if (!raw) {
        setState("empty");
        return;
      }
      try {
        const p = JSON.parse(raw) as Payload;
        setPost(p);
        setState("ready");
      } catch {
        setState("empty");
      }
    });
  }, []);

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    );
  }

  if (state === "empty" || !post) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/blog" adminBackLabel="Back to blog" />
      </PreviewChrome>
    );
  }

  const heroImageSrc = post.imageUrl?.trim() || BLOG_FALLBACK_IMAGE;

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <main className="min-h-screen bg-background">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div">
            <Link
              href={HOMEPAGE_BLOG_SECTION_HREF}
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to blog section
            </Link>

            <div className="mx-auto w-full max-w-3xl">
              <header className="mb-6">
                {post.is_featured && (
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Featured
                  </span>
                )}
                <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                  {post.title?.trim() || "Untitled"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {post.author?.trim() && <span>By {post.author}</span>}
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </header>

              <div className="relative mb-8 h-[min(22vh,140px)] w-full overflow-hidden rounded-xl bg-muted sm:h-[min(24vh,160px)] sm:rounded-2xl md:h-[min(26vh,180px)]">
                <Image
                  src={heroImageSrc}
                  alt={post.title || "Post"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  unoptimized={shouldUseUnoptimizedImage(heroImageSrc)}
                />
              </div>

              {post.description?.trim() && (
                <p className="mb-6 text-base text-muted-foreground sm:text-lg">{post.description}</p>
              )}
            </div>

            {post.content?.trim() && (
              <div
                className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-blue-600 dark:prose-a:text-blue-400"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}
          </Container>
        </article>
      </main>
    </PreviewChrome>
  );
}
