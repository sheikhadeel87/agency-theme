"use client";

import { useEffect, useMemo, useState } from "react";
import type { NavSectionVisibility } from "@/lib/admin-data";
import {
  ALL_NAV_SECTIONS_VISIBLE,
  filterPublicNavBySectionVisibility,
} from "@/lib/filter-public-nav-by-visibility";
import { buildPublicNavigation, type NavItem, type PublicNavEntry } from "@/lib/navigation";
import { fetchSiteNavigation } from "@/lib/site-settings-api";

export type UseSiteNavigationOptions = {
  dynamicPages?: { title: string; slug: string }[];
  fallbackNavigation?: NavItem[] | null;
  navVisibility?: NavSectionVisibility;
  /**
   * When true, never calls `GET /api/site-settings` and builds nav only from `fallbackNavigation`.
   * Use on `/preview/site-settings` when a draft exists so unsaved nav edits are not overwritten by the API.
   */
  lockToFallback?: boolean;
};

/**
 * Loads navigation from `GET /api/site-settings`, with optional server seed until the request completes.
 */
export function useSiteNavigationEntries({
  dynamicPages = [],
  fallbackNavigation,
  navVisibility,
  lockToFallback = false,
}: UseSiteNavigationOptions): {
  entries: PublicNavEntry[];
  source: "api" | "fallback";
} {
  const [loaded, setLoaded] = useState(false);
  const [remoteNavigation, setRemoteNavigation] = useState<NavItem[] | undefined>(undefined);

  useEffect(() => {
    if (lockToFallback) return;
    let cancelled = false;
    fetchSiteNavigation()
      .then((nav) => {
        if (!cancelled) setRemoteNavigation(nav);
      })
      .catch(() => {
        if (!cancelled) setRemoteNavigation(undefined);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lockToFallback]);

  const entries = useMemo(() => {
    let sourceNav: NavItem[] | undefined;
    if (lockToFallback) {
      sourceNav = fallbackNavigation ?? undefined;
    } else if (!loaded) {
      sourceNav = fallbackNavigation ?? undefined;
    } else {
      sourceNav = remoteNavigation ?? fallbackNavigation ?? undefined;
    }
    const built = buildPublicNavigation(sourceNav, dynamicPages);
    const v = navVisibility ?? ALL_NAV_SECTIONS_VISIBLE;
    return filterPublicNavBySectionVisibility(built, v);
  }, [
    lockToFallback,
    loaded,
    remoteNavigation,
    fallbackNavigation,
    dynamicPages,
    navVisibility,
  ]);

  const source: "api" | "fallback" = lockToFallback || !loaded ? "fallback" : "api";

  return { entries, source };
}
