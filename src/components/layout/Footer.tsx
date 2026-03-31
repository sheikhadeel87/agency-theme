import Link from "next/link";
import { Zap, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { TrackedContactLink } from "@/components/analytics/TrackedContactLink";
import { NewsletterSubscribe } from "@/components/layout/NewsletterSubscribe";
import { Container } from "@/components/ui/Container";
import type { NavSectionVisibility, SiteSettingsData } from "@/lib/admin-data";

type NavKey = keyof NavSectionVisibility;

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

const quickLinksBase: Array<{ label: string; href: string; badge?: string; vis?: NavKey }> = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#why-choose-us", vis: "whyChooseUs" },
  { label: "Portfolio", href: "/portfolio", vis: "portfolio" },
  { label: "Pricing", href: "/#pricing", vis: "pricing" },
];

const servicesItems: Array<{ label: string; href: string; vis: NavKey }> = [
  { label: "Web Development", href: "/#support", vis: "featuresHighlights" },
  { label: "Graphics Design", href: "/#services", vis: "services" },
  { label: "Our Blog", href: "/blog", vis: "blog" },
  { label: "Ui/Ux Design", href: "/#services", vis: "services" },
];

function brandText(s: SiteSettingsData | null | undefined): string {
  if (!s) return "Nexora";
  return s.logoText?.trim() || s.siteName?.trim() || "Nexora";
}

function footerDescription(s: SiteSettingsData | null | undefined): string {
  if (!s?.footerText?.trim()) return "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  return s.footerText.trim();
}

export type FooterProps = {
  siteSettings?: SiteSettingsData | null;
  navVisibility?: NavSectionVisibility;
};

export function Footer({ siteSettings, navVisibility }: FooterProps) {
  const brand = brandText(siteSettings);
  const description = footerDescription(siteSettings);
  const privacyHref = siteSettings?.privacyPolicyUrl?.trim() || "/privacy-policy";
  const termsHref = siteSettings?.termsUrl?.trim() || "/terms-conditions";
  const socialLinks = siteSettings?.socialLinks;
  const social = [
    { icon: Facebook, href: socialLinks?.facebook?.trim() || "#", label: "Facebook" },
    { icon: Twitter, href: socialLinks?.twitter?.trim() || "#", label: "Twitter" },
    { icon: Linkedin, href: socialLinks?.linkedin?.trim() || "#", label: "LinkedIn" },
    { icon: Instagram, href: socialLinks?.instagram?.trim() || "#", label: "Instagram" },
  ] as const;

  const v = navVisibility ?? ALL_VISIBLE;
  const quickLinks = quickLinksBase.filter(
    (item) => item.vis === undefined || v[item.vis] === true
  );
  const services = servicesItems.filter((item) => v[item.vis] === true);

  type SupportRow = { label: string; href: string; vis?: NavKey };
  const supportRows: SupportRow[] = [
    { label: "Team", href: "/#team", vis: "team" },
    { label: "Contact Us", href: "/#contact", vis: "contact" },
    { label: "Privacy Policy", href: privacyHref },
    { label: "Terms & Conditions", href: termsHref },
  ];
  const support = supportRows.filter(
    (row) => row.vis === undefined || v[row.vis] === true
  );

  return (
    <footer className="rounded-t-2xl bg-muted sm:rounded-t-3xl">
      <Container as="div" className="pt-12 sm:pt-14 lg:pt-16">
        {/* Top footer: 5 columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Zap className="size-5" />
              </span>
              <span className="text-lg font-semibold text-foreground dark:text-white">{brand}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {description}
            </p>
            <div className="mt-5 flex gap-3" aria-label="Social links">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="flex size-9 items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground transition-colors hover:bg-muted-foreground/25 hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <nav aria-labelledby="footer-quick-links">
            <h3 id="footer-quick-links" className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {quickLinks.map(({ label, href, badge }) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                    {badge && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Services */}
          <nav aria-labelledby="footer-services">
            <h3 id="footer-services" className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Services
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {services.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Support */}
          <nav aria-labelledby="footer-support">
            <h3 id="footer-support" className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Support
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {support.map(({ label, href }) => {
                const linkClass =
                  "text-sm text-muted-foreground transition-colors hover:text-foreground";
                const isContact = href.toLowerCase().includes("#contact");
                return (
                  <li key={label + href}>
                    {isContact ? (
                      <TrackedContactLink href={href} className={linkClass}>
                        {label}
                      </TrackedContactLink>
                    ) : (
                      <Link href={href} className={linkClass}>
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Column 5: Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 id="footer-newsletter" className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe to receive future updates
            </p>
            <NewsletterSubscribe />
          </div>
        </div>

        {/* Bottom footer */}
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
