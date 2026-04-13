"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  setLiveSectionVisibility,
  type LiveSectionId,
} from "@/lib/actions/page-visibility-actions";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import type { NavSectionVisibility } from "@/lib/admin-data";

const ROWS: { id: LiveSectionId; title: string; description: string }[] = [
  { id: "hero", title: "Homepage hero", description: "Main hero block on the homepage." },
  { id: "whyChooseUs", title: "Why Choose Us", description: "Why Choose Us section on the homepage." },
  {
    id: "services",
    title: "Services on live site",
    description:
      "Homepage block and Services link in the main navigation. Matches Site Settings → Homepage sections.",
  },
  {
    id: "portfolio",
    title: "Portfolio on live site",
    description:
      "Homepage block, project pages, and Portfolio in navigation. Matches Site Settings → Homepage sections.",
  },
  { id: "team", title: "Team", description: "Team section on the homepage." },
  { id: "testimonials", title: "Testimonials", description: "Testimonials section on the homepage." },
  { id: "pricing", title: "Pricing", description: "Pricing section on the homepage." },
  {
    id: "blog",
    title: "Blog on live site",
    description:
      "Homepage block, blog archive, and post pages, plus Blog in navigation. Matches Site Settings → Homepage sections.",
  },
];

type Initial = Pick<
  NavSectionVisibility,
  "hero" | "whyChooseUs" | "services" | "portfolio" | "team" | "testimonials" | "pricing" | "blog"
>;

export function PageVisibilityPanel({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [pendingId, setPendingId] = useState<LiveSectionId | null>(null);
  const [errors, setErrors] = useState<Partial<Record<LiveSectionId, string>>>({});

  useEffect(() => {
    setState(initial);
  }, [initial]);

  async function onToggle(id: LiveSectionId, next: boolean) {
    setPendingId(id);
    setErrors((e) => ({ ...e, [id]: undefined }));
    const result = await setLiveSectionVisibility(id, next);
    setPendingId(null);
    if (result.error) {
      setErrors((e) => ({ ...e, [id]: result.error! }));
      toast.error(result.error);
      return;
    }
    toast.success("Homepage visibility updated.");
    setState((s) => ({ ...s, [id]: next }));
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {ROWS.map(({ id, title, description }) => (
        <div
          key={id}
          className="rounded-lg border border-border bg-card p-4 ring-1 ring-foreground/5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Toggle
              enabled={state[id]}
              disabled={pendingId === id}
              onChange={(v) => void onToggle(id, v)}
              className="shrink-0 sm:ml-auto"
              id={`visibility-${id}`}
            />
          </div>
          {errors[id] ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {errors[id]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
