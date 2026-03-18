"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/lib/admin-data";

type Props = {
  projects: PortfolioProject[];
  categories: string[];
};

function ProjectCard({ project }: { project: PortfolioProject }) {
  const href = project.slug ? `/portfolio/${encodeURIComponent(project.slug)}` : "#";
  const imageUrl = project.imageUrl || "/images/hero.png";

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-xl md:rounded-3xl"
    >
      {/* Image - blog-style: wide, more width than text block */}
      <div className="relative aspect-[2/1] w-full shrink-0 bg-gray-100">
        <Image
          src={imageUrl}
          alt={project.title || "Project"}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Text block - compact below image, link pinned to bottom */}
      <div className="flex min-h-0 flex-1 flex-col px-5 py-4 sm:px-6 sm:py-5">
        {project.categories?.length > 0 && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 sm:mb-1.5">
            {project.categories.join(" · ")}
          </p>
        )}
        <h4 className="text-base font-semibold leading-tight text-[#0f172a] transition-colors group-hover:text-blue-600 sm:text-lg lg:text-xl">
          {project.title || "Untitled"}
        </h4>
        {project.client && (
          <p className="mt-1 text-sm text-gray-500">
            {project.client}
          </p>
        )}
        {project.shortDescription && (
          <p className="mt-2 min-h-0 flex-1 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {project.shortDescription}
          </p>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-all group-hover:gap-3 sm:pt-5">
          View project
          <ArrowUpRight className="size-4 shrink-0" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function PortfolioFilter({ projects, categories }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.categories.includes(activeFilter));

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
        <button
          type="button"
          onClick={() => setActiveFilter("All")}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
            activeFilter === "All"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveFilter(label)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              activeFilter === label
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Blog-style: wider container, image-led cards */}
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-8 sm:mt-16 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {filtered.map((project) => (
          <ProjectCard key={project._id} project={project} />
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
