"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FUNNEL_EVENTS, trackEvent } from "@/lib/track-event";

/** POSTs a PageVisit for the current URL. Skips /admin and /api. */
export function TrackPageVisit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    if (!path || path.startsWith("/admin") || path.startsWith("/api")) return;

    if (pathname === "/") {
      trackEvent(FUNNEL_EVENTS.visitHomepage);
    }

    void fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: typeof document !== "undefined" ? document.referrer : "" }),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
