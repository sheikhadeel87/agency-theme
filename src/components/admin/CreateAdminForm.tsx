"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser } from "@/lib/actions/admin-user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateAdminForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const res = await createAdminUser(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin/admins");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="max-w-md space-y-4">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="admin-name" className="mb-1 block text-sm font-medium text-foreground">
          Name
        </label>
        <Input id="admin-name" name="name" type="text" required autoComplete="name" className="max-w-md" />
      </div>
      <div>
        <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="max-w-md"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="max-w-md"
        />
        <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create admin"}
      </Button>
    </form>
  );
}
