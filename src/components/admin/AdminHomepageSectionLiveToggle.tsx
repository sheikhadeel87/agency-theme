"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setHomepageSectionLiveEnabled } from "@/lib/actions/site-settings-actions";
import type { HomepageSectionModule } from "@/lib/actions/site-settings-actions";
import { Toggle } from "@/components/ui/toggle";

type Props = {
  module: HomepageSectionModule;
  initialEnabled: boolean;
  title: string;
  description: string;
};

export function AdminHomepageSectionLiveToggle({
  module,
  initialEnabled,
  title,
  description,
}: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  async function onChange(next: boolean) {
    setPending(true);
    setError(null);
    const result = await setHomepageSectionLiveEnabled(module, next);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEnabled(next);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 ring-1 ring-foreground/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Toggle
          enabled={enabled}
          disabled={pending}
          onChange={(v) => void onChange(v)}
          className="shrink-0 sm:ml-auto"
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
