"use client";

import { PublicNavMenu } from "@/components/navigation";
import { useSiteNavigationEntries } from "@/hooks/use-site-navigation";
import type { NavSectionVisibility } from "@/lib/admin-data";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type SiteNavbarProps = {
  dynamicPages?: { title: string; slug: string }[];
  fallbackNavigation?: NavItem[] | null;
  navVisibility?: NavSectionVisibility;
  /** See `useSiteNavigationEntries` — keeps preview drafts from being replaced by GET /api/site-settings. */
  lockNavigationToFallback?: boolean;
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
  navVisibility,
  lockNavigationToFallback = false,
  onNavigate,
  className,
}: SiteNavbarProps) {
  const { entries, source } = useSiteNavigationEntries({
    dynamicPages,
    fallbackNavigation,
    navVisibility,
    lockToFallback: lockNavigationToFallback,
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
