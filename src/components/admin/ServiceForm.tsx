"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createService } from "@/lib/actions/service-actions";

export function ServiceForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createService(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-foreground">
          Title
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Web Development"
          className="max-w-md"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Short description of the service."
          className="w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue="Draft"
          className="h-8 w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">Create Service</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/services")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
