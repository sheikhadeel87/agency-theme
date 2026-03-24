"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPublicNavigation, type NavItem, type PublicNavEntry } from "@/lib/navigation";
import { fetchSiteNavigation } from "@/lib/site-settings-api";

export type UseSiteNavigationOptions = {
  dynamicPages?: { title: string; slug: string }[];
  fallbackNavigation?: NavItem[] | null;
};

/**
 * Loads navigation from `GET /api/site-settings`, with optional server seed until the request completes.
 */
export function useSiteNavigationEntries({
  dynamicPages = [],
  fallbackNavigation,
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
    return buildPublicNavigation(sourceNav, dynamicPages);
  }, [loaded, remoteNavigation, fallbackNavigation, dynamicPages]);

  const source: "api" | "fallback" = loaded ? "api" : "fallback";

  return { entries, source };
}
