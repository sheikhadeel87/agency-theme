"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PortfolioProject } from "@/lib/admin-data";

type Props = {
  projects: PortfolioProject[];
  categories: string[];
};

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

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:mt-16 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {filtered.map((project) => (
          <Link
            key={project._id}
            href={project.slug ? `/portfolio/${encodeURIComponent(project.slug)}` : "#"}
            className="group relative overflow-hidden rounded-2xl bg-gray-50 shadow-sm transition-shadow hover:shadow-md sm:rounded-3xl"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={project.imageUrl || "/images/hero.png"}
                alt={project.title || "Project"}
                fill
                className="object-cover transition-transform group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#0f172a] group-hover:text-blue-600">
                {project.title || "Untitled"}
              </h3>
              {project.client && (
                <p className="mt-0.5 text-sm text-gray-500">{project.client}</p>
              )}
              {project.shortDescription && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {project.shortDescription}
                </p>
              )}
            </div>
          </Link>
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
