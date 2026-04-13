import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { TrackedContactLink } from "@/components/analytics/TrackedContactLink";
import { BrandLogoMark } from "@/components/layout/BrandLogoMark";
import { NewsletterSubscribe } from "@/components/layout/NewsletterSubscribe";
import { Container } from "@/components/ui/Container";
import type { NavSectionVisibility, SiteSettingsData } from "@/lib/admin-data";
import { getDefaultFooterColumns } from "@/lib/footer-links";

const ALL_VISIBLE: NavSectionVisibility = {
  hero: true,
  featuresHighlights: true,
  whyChooseUs: true,
  team: true,
  services: true,
  pricing: true,
  portfolio: true,
  testimonials: true,
  blog: true,
  contact: true,
};

function brandText(s: SiteSettingsData | null | undefined): string {
  if (!s) return "Nexora";
  return s.logoText?.trim() || s.siteName?.trim() || "Nexora";
}

function footerDescription(s: SiteSettingsData | null | undefined): string {
  if (!s?.footerText?.trim()) return "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  return s.footerText.trim();
}

function applyLegalHrefOverrides(
  href: string,
  siteSettings: SiteSettingsData | null | undefined
): string {
  const p = siteSettings?.privacyPolicyUrl?.trim();
  const t = siteSettings?.termsUrl?.trim();
  const h = href.trim();
  if (h === "/privacy-policy" && p) return p;
  if (h === "/terms-conditions" && t) return t;
  return href;
}

function visibleFooterLinkColumns(
  siteSettings: SiteSettingsData | null | undefined,
  v: NavSectionVisibility
): { title: string; links: { label: string; href: string }[] }[] {
  const raw =
    siteSettings?.footerColumns && siteSettings.footerColumns.length > 0
      ? siteSettings.footerColumns
      : getDefaultFooterColumns();

  return [...raw]
    .sort((a, b) => a.order - b.order)
    .map((col) => {
      const links = [...col.links]
        .sort((a, b) => a.order - b.order)
        .filter((link) => !link.sectionKey || v[link.sectionKey])
        .map((link) => ({
          label: link.label,
          href: applyLegalHrefOverrides(link.href, siteSettings),
        }));
      return { title: col.title, links };
    })
    .filter((col) => col.links.length > 0);
}

export type FooterProps = {
  siteSettings?: SiteSettingsData | null;
  navVisibility?: NavSectionVisibility;
};

export function Footer({ siteSettings, navVisibility }: FooterProps) {
  const brand = brandText(siteSettings);
  const description = footerDescription(siteSettings);
  const privacyHref = siteSettings?.privacyPolicyUrl?.trim() || "/privacy-policy";
  const sl = siteSettings?.socialLinks;
  const social = [
    { icon: Facebook, href: (sl?.facebook ?? "").trim(), label: "Facebook" },
    { icon: Twitter, href: (sl?.twitter ?? "").trim(), label: "Twitter" },
    { icon: Linkedin, href: (sl?.linkedin ?? "").trim(), label: "LinkedIn" },
    { icon: Instagram, href: (sl?.instagram ?? "").trim(), label: "Instagram" },
  ].filter((item) => item.href.length > 0);

  const v = navVisibility ?? ALL_VISIBLE;
  const footerColumns = visibleFooterLinkColumns(siteSettings, v);

  return (
    <footer className="rounded-t-2xl bg-muted sm:rounded-t-3xl">
      <Container as="div" className="pt-12 sm:pt-14 lg:pt-16">
        <div className="flex flex-col flex-wrap gap-10 lg:flex-row lg:items-start lg:gap-10">
          <div className="w-full shrink-0 lg:max-w-[240px]">
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandLogoMark siteSettings={siteSettings} />
              <span className="text-lg font-semibold text-foreground dark:text-white">{brand}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {description}
            </p>
            {social.length > 0 ? (
              <div className="mt-5 flex gap-3" aria-label="Social links">
                {social.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground transition-colors hover:bg-muted-foreground/25 hover:text-foreground"
                    aria-label={label}
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {footerColumns.map((col, i) => {
            const headingId = `footer-col-${i}`;
            return (
              <nav
                key={`${col.title}-${i}`}
                className="min-w-[140px] flex-1"
                aria-labelledby={headingId}
              >
                <h3
                  id={headingId}
                  className="text-sm font-semibold uppercase tracking-wider text-foreground"
                >
                  {col.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((row, j) => {
                    const linkClass =
                      "text-sm text-muted-foreground transition-colors hover:text-foreground";
                    const isContact = row.href.toLowerCase().includes("#contact");
                    const liKey = `${row.label}-${row.href}-${j}`;
                    return (
                      <li key={liKey}>
                        {isContact ? (
                          <TrackedContactLink href={row.href} className={linkClass}>
                            {row.label}
                          </TrackedContactLink>
                        ) : (
                          <Link href={row.href} className={linkClass}>
                            {row.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            );
          })}

          <div className="w-full shrink-0 lg:max-w-[280px]">
            <h3 id="footer-newsletter" className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe to receive future updates
            </p>
            <NewsletterSubscribe />
          </div>
        </div>

        <div className="mt-12 border-t border-border py-6 sm:mt-14 lg:mt-16">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <nav aria-label="Footer legal and locale">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="transition-colors hover:text-foreground">
                    English
                  </Link>
                </li>
                <li>
                  <Link href={privacyHref} className="transition-colors hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                {v.featuresHighlights === true && (
                  <li>
                    <Link href="/#support" className="transition-colors hover:text-foreground">
                      Support
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {brand}. All rights reserved
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
