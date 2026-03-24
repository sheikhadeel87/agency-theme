"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "portfolio";
const FALLBACK_IMAGE = "/images/hero.png";

function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

type Payload = {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  client?: string;
  categories?: string[];
  technologyStack?: string[];
  imageUrl?: string;
  galleryImages?: string[];
  projectUrl?: string;
};

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function PortfolioPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [project, setProject] = useState<Payload | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
    if (!raw) {
      setState("empty");
      return;
    }
    try {
      const p = JSON.parse(raw) as Payload;
      setProject(p);
      setState("ready");
    } catch {
      setState("empty");
    }
  }, []);

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Loading preview…
      </div>
    );
  }

  if (state === "empty" || !project) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/portfolio" adminBackLabel="Back to portfolio" />
      </PreviewChrome>
    );
  }

  const heroImageSrc = project.imageUrl?.trim() || FALLBACK_IMAGE;
  const gallery = Array.isArray(project.galleryImages)
    ? project.galleryImages.filter((u) => typeof u === "string" && u.trim() !== "")
    : [];
  const categories = Array.isArray(project.categories) ? project.categories : [];
  const tech = Array.isArray(project.technologyStack) ? project.technologyStack : [];
  const full = project.fullDescription?.trim() ?? "";

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
      <main className="min-h-screen bg-white">
        <article className="py-16 sm:py-20 lg:py-24">
          <Container as="div">
            <Link
              href="/#portfolio"
              className="mb-8 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Portfolio
            </Link>

            <div className="mx-auto w-full max-w-3xl">
              <header className="mb-8">
                <h1 className="text-3xl font-semibold leading-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
                  {project.title?.trim() || "Untitled Project"}
                </h1>
                {project.client?.trim() && (
                  <p className="mt-2 text-lg text-gray-600">Client: {project.client}</p>
                )}
                {categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <span key={c} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="relative mb-10 h-[min(32vh,260px)] w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-[min(36vh,300px)] sm:rounded-3xl md:h-[min(38vh,340px)]">
                <Image
                  src={heroImageSrc}
                  alt={project.title || "Project"}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  unoptimized={shouldUseUnoptimizedImage(heroImageSrc)}
                />
              </div>

              {project.shortDescription?.trim() && (
                <p className="mb-8 text-lg text-gray-600">{project.shortDescription}</p>
              )}
            </div>

            {full && (
              <div className="prose prose-gray mx-auto mb-10 max-w-3xl">
                {looksLikeHtml(full) ? (
                  <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: full }} />
                ) : (
                  <div className="whitespace-pre-wrap text-gray-700">{full}</div>
                )}
              </div>
            )}

            <div className="mx-auto max-w-3xl">
              {tech.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Technology</h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {tech.map((t) => (
                      <li
                        key={t}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.projectUrl?.trim() && (
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
                  <h2 className="mb-6 text-xl font-semibold text-[#0f172a]">Gallery</h2>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {gallery.map((url, i) => (
                      <li key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                        <Image
                          src={url}
                          alt={`Gallery ${i + 1}`}
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
    </PreviewChrome>
  );
}
