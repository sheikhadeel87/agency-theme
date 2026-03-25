"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { ThemeToggle } from "@/components/theme";
import type { SiteSettingsData } from "@/lib/admin-data";

function brandText(siteSettings: SiteSettingsData | null | undefined): string {
  if (!siteSettings) return "Nexora";
  const text = siteSettings.logoText?.trim() || siteSettings.siteName?.trim();
  return text || "Nexora";
}

export type HeaderProps = {
  siteSettings?: SiteSettingsData | null;
  /** Passed through to `SiteNavbar` for `appendDynamicPages` dropdown items. */
  dynamicPages?: { title: string; slug: string }[];
};

export function Header({ siteSettings, dynamicPages = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const brand = brandText(siteSettings);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 sm:h-18">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Zap className="size-5" />
            </span>
            {brand}
          </Link>

          <div className="flex items-center gap-2">
            <SiteNavbar
              dynamicPages={dynamicPages}
              fallbackNavigation={siteSettings?.navigation}
              onNavigate={() => setMobileMenuOpen(false)}
              className={`absolute left-0 right-0 top-full border-b border-border bg-background md:static md:border-0 md:bg-transparent ${
                mobileMenuOpen ? "block" : "hidden md:block"
              }`}
            />

            <ThemeToggle />

            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
