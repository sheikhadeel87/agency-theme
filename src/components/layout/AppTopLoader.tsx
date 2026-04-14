"use client";

import NextTopLoader from "nextjs-toploader";

/** Navigation progress bar (matches admin styling). Mounted once in root layout. */
export function AppTopLoader() {
  return (
    <NextTopLoader
      color="#2563eb"
      height={3}
      showSpinner={false}
      crawlSpeed={180}
      shadow="0 0 12px rgba(37, 99, 235, 0.35)"
      zIndex={99999}
    />
  );
}
