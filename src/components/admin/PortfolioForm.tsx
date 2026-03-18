"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePortfolio } from "@/lib/actions/portfolio-actions";
import type { PortfolioProject } from "@/lib/admin-data";

const defaultValues: Omit<PortfolioProject, "_id"> = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  client: "",
  categories: [],
  technologyStack: [],
  imageUrl: "",
  galleryImages: [],
  projectUrl: "",
  status: "Draft",
};

type Props = {
  initialData?: PortfolioProject | null;
};

function Field({
  label,
  id,
  name,
  type = "text",
  placeholder,
  defaultValue,
  rows,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          className="w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue ?? ""}
          className="max-w-md"
        />
      )}
    </div>
  );
}

export function PortfolioForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const data = initialData ?? defaultValues;
  const categoriesStr = Array.isArray(data.categories) ? data.categories.join(", ") : "";
  const techStr = Array.isArray(data.technologyStack) ? data.technologyStack.join(", ") : "";
  const galleryStr = Array.isArray(data.galleryImages) ? data.galleryImages.join(", ") : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await savePortfolio(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/portfolio");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {initialData?._id && (
        <input type="hidden" name="_id" value={initialData._id} readOnly />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Title"
          id="title"
          name="title"
          placeholder="Project title"
          defaultValue={data.title}
        />
        <Field
          label="Slug"
          id="slug"
          name="slug"
          placeholder="project-slug"
          defaultValue={data.slug}
        />
        <Field
          label="Short description"
          id="shortDescription"
          name="shortDescription"
          placeholder="Brief summary"
          defaultValue={data.shortDescription}
          rows={2}
        />
        <Field
          label="Full description"
          id="fullDescription"
          name="fullDescription"
          placeholder="Full project description"
          defaultValue={data.fullDescription}
          rows={4}
        />
        <Field
          label="Client"
          id="client"
          name="client"
          placeholder="Client name"
          defaultValue={data.client}
        />
        <Field
          label="Categories (comma-separated)"
          id="categories"
          name="categories"
          placeholder="Web, Branding, Product"
          defaultValue={categoriesStr}
        />
        <Field
          label="Technology stack (comma-separated)"
          id="technologyStack"
          name="technologyStack"
          placeholder="React, Node.js"
          defaultValue={techStr}
        />
        <Field
          label="Image URL"
          id="imageUrl"
          name="imageUrl"
          placeholder="https://..."
          defaultValue={data.imageUrl}
        />
        <Field
          label="Gallery image URLs (comma-separated)"
          id="galleryImages"
          name="galleryImages"
          placeholder="https://..., https://..."
          defaultValue={galleryStr}
        />
        <Field
          label="Project URL"
          id="projectUrl"
          name="projectUrl"
          placeholder="https://..."
          defaultValue={data.projectUrl}
        />
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={data.status}
            className="w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">Save project</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/portfolio")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
