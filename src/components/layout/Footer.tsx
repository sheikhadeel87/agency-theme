import Link from "next/link";
import { Zap, Facebook, Twitter, Linkedin, SendHorizontal } from "lucide-react";
import { Container } from "@/components/ui/Container";

// Quick Links — main nav / key sections
const quickLinks: Array<{ label: string; href: string; badge?: string }> = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#why-choose-us" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Pricing", href: "/#pricing" },
];

// Services — scroll to Services section anchors
const services = [
  { label: "Web Development", href: "/#support" },
  { label: "Graphics Design", href: "/#services" },
  { label: "Our Blog", href: "/#blog" },
  { label: "Ui/Ux Design", href: "/#services" },
] as const;

// Support — scroll to relevant sections
const support = [
  { label: "Team", href: "/#team" },
  { label: "Contact Us", href: "/#contact" },
  { label: "Privacy Policy", href:"/privacy-policy" },
  { label: "Terms & Conditions", href:"/terms-conditions" },
] as const;

const social = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
] as const;

export function Footer() {
  return (
    <footer className="rounded-t-2xl bg-gray-100 sm:rounded-t-3xl">
      <Container as="div" className="pt-12 sm:pt-14 lg:pt-16">
        {/* Top footer: 5 columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Zap className="size-5" />
              </span>
              <span className="text-lg font-semibold text-[#0f172a]">Nexora</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="mt-5 flex gap-3" aria-label="Social links">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="flex size-9 items-center justify-center rounded-full bg-gray-200/80 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <nav aria-labelledby="footer-quick-links">
            <h3 id="footer-quick-links" className="text-sm font-semibold uppercase tracking-wider text-[#0f172a]">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {quickLinks.map(({ label, href, badge }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
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
            <h3 id="footer-services" className="text-sm font-semibold uppercase tracking-wider text-[#0f172a]">
              Services
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {services.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Support */}
          <nav aria-labelledby="footer-support">
            <h3 id="footer-support" className="text-sm font-semibold uppercase tracking-wider text-[#0f172a]">
              Support
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {support.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 5: Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 id="footer-newsletter" className="text-sm font-semibold uppercase tracking-wider text-[#0f172a]">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Subscribe to receive future updates
            </p>
            <div className="mt-4 flex gap-0 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email for newsletter"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none sm:px-5"
              />
              <button
                type="button"
                className="flex shrink-0 items-center justify-center bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700 sm:px-5"
                aria-label="Subscribe"
              >
                <SendHorizontal className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-12 border-t border-gray-200/80 py-6 sm:mt-14 lg:mt-16">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <nav aria-label="Footer legal and locale">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-gray-600">
                <li>
                  <Link href="#" className="transition-colors hover:text-gray-900">
                    English
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="transition-colors hover:text-gray-900">
                    Support
                  </Link>
                </li>
              </ul>
            </nav>
            <p className="text-sm text-gray-500">
              © 2026 Nexora. All rights reserved
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
