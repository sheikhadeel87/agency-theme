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
};

/**
 * Loads navigation from `GET /api/site-settings`, with optional server seed until the request completes.
 */
export function useSiteNavigationEntries({
  dynamicPages = [],
  fallbackNavigation,
  navVisibility,
}: UseSiteNavigationOptions): {
  entries: PublicNavEntry[];
  source: "api" | "fallback";
} {
  const [loaded, setLoaded] = useState(false);
  const [remoteNavigation, setRemoteNavigation] = useState<NavItem[] | undefined>(undefined);

  useEffect(() => {
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
  }, []);

  const entries = useMemo(() => {
    const sourceNav = loaded ? remoteNavigation : (fallbackNavigation ?? undefined);
    const built = buildPublicNavigation(sourceNav, dynamicPages);
    const v = navVisibility ?? ALL_NAV_SECTIONS_VISIBLE;
    return filterPublicNavBySectionVisibility(built, v);
  }, [loaded, remoteNavigation, fallbackNavigation, dynamicPages, navVisibility]);

  const source: "api" | "fallback" = loaded ? "api" : "fallback";

  return { entries, source };
}
