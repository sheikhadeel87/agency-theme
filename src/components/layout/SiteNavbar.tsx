"use client";

import { PublicNavMenu } from "@/components/navigation";
import { useSiteNavigationEntries } from "@/hooks/use-site-navigation";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type SiteNavbarProps = {
  dynamicPages?: { title: string; slug: string }[];
  fallbackNavigation?: NavItem[] | null;
  onNavigate?: () => void;
  className?: string;
};

/**
 * Composes `useSiteNavigationEntries` + `PublicNavMenu`.
 * Navigation data: `GET /api/site-settings` with optional SSR seed from `fallbackNavigation`.
 */
export function SiteNavbar({
  dynamicPages = [],
  fallbackNavigation,
  onNavigate,
  className,
}: SiteNavbarProps) {
  const { entries, source } = useSiteNavigationEntries({
    dynamicPages,
    fallbackNavigation,
  });

  return (
    <PublicNavMenu
      entries={entries}
      onNavigate={onNavigate}
      className={cn(className)}
      dataNavigationSource={source}
    />
  );
}
