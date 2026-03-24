"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { SiteSettingsData } from "@/lib/admin-data";
import { adminPreviewStorageKey } from "@/lib/admin-preview";
import { hasMeaningfulHtmlContent } from "@/lib/html-utils";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";

const TYPE = "team-member";

const bioHtmlClassName =
  "team-member-bio mt-6 max-w-none text-base leading-relaxed text-gray-700 [&_p]:mt-3 [&_p]:first:mt-0 [&_p]:text-gray-700 [&_li]:text-gray-700 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:my-3 [&_ul]:list-inside [&_ul]:list-disc [&_ol]:my-3 [&_ol]:list-inside [&_ol]:list-decimal [&_a]:text-blue-600 [&_a]:underline";

type Payload = {
  name?: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
};

type Shell = {
  siteSettings: SiteSettingsData;
  dynamicPages: { title: string; slug: string }[];
};

export function TeamMemberPreviewClient({ siteSettings, dynamicPages }: Shell) {
  const [state, setState] = useState<"pending" | "empty" | "ready">("pending");
  const [member, setMember] = useState<Payload | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(adminPreviewStorageKey(TYPE));
    if (!raw) {
      setState("empty");
      return;
    }
    try {
      const p = JSON.parse(raw) as Payload;
      setMember(p);
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

  if (state === "empty" || !member) {
    return (
      <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
        <PreviewEmptyState adminBackHref="/admin/team" adminBackLabel="Back to team" />
      </PreviewChrome>
    );
  }

  const name = member.name?.trim() || "Name";
  const bio = member.bio ?? "";
  const hasBio = hasMeaningfulHtmlContent(bio);
  const bioIsHtml = hasBio && bio.includes("<");

  return (
    <PreviewChrome siteSettings={siteSettings} dynamicPages={dynamicPages}>
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
                  {member.imageUrl?.trim() ? (
                    <Image
                      src={member.imageUrl}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 280px"
                      priority
                      unoptimized={shouldUseUnoptimizedImage(member.imageUrl)}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-6xl font-semibold text-gray-300">
                      {name.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                  <h1 className="text-2xl font-semibold leading-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
                    {name}
                  </h1>
                  {member.role?.trim() ? <p className="mt-2 text-lg text-gray-600">{member.role}</p> : null}

                  {hasBio ? (
                    bioIsHtml ? (
                      <div className={bioHtmlClassName} dangerouslySetInnerHTML={{ __html: bio }} />
                    ) : (
                      <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                        {bio.trim()}
                      </p>
                    )
                  ) : (
                    <p className="mt-6 text-sm text-gray-500">No bio has been added for this team member yet.</p>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </article>
      </main>
    </PreviewChrome>
  );
}
