"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { PortfolioProject } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

type Props = {
  projects: PortfolioProject[];
  categories: string[];
};

function ProjectCard({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  const href = project.slug ? `/portfolio/${encodeURIComponent(project.slug)}` : "#";
  const imageUrl = project.imageUrl?.trim() || "/images/hero.png";
  const isLcpCandidate = index === 0;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-out motion-reduce:transform-none motion-reduce:hover:translate-y-0 hover:-translate-y-1 md:rounded-3xl ${
        project.featuredOnHomepage
          ? "shadow-md shadow-blue-500/10 ring-1 ring-blue-200/80 hover:shadow-xl hover:shadow-blue-500/15"
          : "shadow-sm ring-1 ring-gray-100/80 hover:shadow-xl hover:ring-gray-200/90"
      }`}
    >
      <Link
        href={href}
        className="flex h-full min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={project.title || "Project"}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:group-hover:scale-100 group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={isLcpCandidate}
            loading={isLcpCandidate ? "eager" : "lazy"}
            unoptimized={shouldUseUnoptimizedImage(imageUrl)}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-4 sm:px-6 sm:py-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {project.featuredOnHomepage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/70">
                <Sparkles className="size-3.5 shrink-0 text-amber-600" aria-hidden />
                Featured
              </span>
            )}
            {project.categories?.length > 0 && (
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 sm:text-[0.7rem]">
                {project.categories.join(" · ")}
              </p>
            )}
          </div>
          <h4 className="text-base font-semibold leading-tight text-[#0f172a] transition-colors duration-200 group-hover:text-blue-600 sm:text-lg lg:text-xl">
            {project.title || "Untitled"}
          </h4>
          {project.client && (
            <p className="mt-1 text-sm text-gray-500">{project.client}</p>
          )}
          {project.shortDescription && (
            <p className="mt-2 min-h-0 flex-1 line-clamp-3 text-sm leading-relaxed text-gray-600">
              {project.shortDescription}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-blue-600 transition-all duration-300 group-hover:gap-3 group-hover:text-blue-700 sm:pt-5">
            View project
            <ArrowUpRight className="size-4 shrink-0" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function PortfolioFilter({ projects, categories }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.categories.includes(activeFilter));

  const filterBtnClass = (active: boolean) =>
    `rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
      active
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
    }`;

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
        <button
          type="button"
          onClick={() => setActiveFilter("All")}
          className={filterBtnClass(activeFilter === "All")}
        >
          All
        </button>
        {categories.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveFilter(label)}
            className={filterBtnClass(activeFilter === label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-8 sm:mt-16 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {filtered.map((project, index) => (
          <ProjectCard key={project._id} project={project} index={index} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mx-auto mt-14 max-w-md text-center text-sm text-gray-500">
          No projects in this category yet.
        </p>
      )}
    </>
  );
}
