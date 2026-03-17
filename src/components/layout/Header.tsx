"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#why-choose-us", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#portfolio", label: "Portfolio" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#support", label: "Support" },
];

// Page section links for dropdown (Team, Services, Blog, Contact only)
const pageLinks = [
  { href: "/#team", label: "Team" },
  { href: "/#services", label: "Services" },
  { href: "/#blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const pagesRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pagesRef.current && !pagesRef.current.contains(event.target as Node)) {
        setPagesDropdownOpen(false);
      }
    }
    if (pagesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [pagesDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 sm:h-18">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight text-gray-900"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Zap className="size-5" />
            </span>
            Nexora
          </Link>

          <div className="flex items-center gap-2">
          <nav
            className={`absolute left-0 right-0 top-full border-b border-gray-200/80 bg-white md:static md:border-0 md:bg-transparent ${
              mobileMenuOpen ? "block" : "hidden md:block"
            }`}
            aria-label="Main navigation"
          >
            <ul className="flex flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:gap-8 md:px-0 md:py-0">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:px-0 md:py-0 md:hover:bg-transparent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {/* Pages dropdown */}
              <li className="relative" ref={pagesRef}>
                <button
                  type="button"
                  className="flex w-full items-center gap-1 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:w-auto md:px-0 md:py-0 md:hover:bg-transparent"
                  onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                  aria-expanded={pagesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Toggle Pages menu"
                >
                  Pages
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform md:ml-0.5 ${
                      pagesDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {pagesDropdownOpen && (
                  <ul
                    className="absolute left-0 top-full z-50 mt-1 w-full min-w-[180px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg md:w-auto"
                    role="menu"
                  >
                    {pageLinks.map(({ href, label }) => (
                      <li key={href} role="none">
                        <Link
                          href={href}
                          role="menuitem"
                          className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => {
                            setPagesDropdownOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </nav>

            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
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
