"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { publicNavEntryKey, type PublicNavEntry } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const navListClass =
  "flex flex-col gap-1 px-4 py-4 md:flex-row md:items-center md:gap-8 md:px-0 md:py-0";

const navLinkClass =
  "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:px-0 md:py-0 md:hover:bg-transparent";

const dropdownTriggerClass =
  "flex w-full items-center gap-1 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:w-auto md:px-0 md:py-0 md:hover:bg-transparent";

const dropdownPanelClass =
  "absolute left-0 top-full z-50 mt-1 w-full min-w-[180px] rounded-lg border border-border bg-popover py-2 text-popover-foreground shadow-lg md:w-auto";

const dropdownItemClass =
  "block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted";

export type PublicNavMenuProps = {
  entries: PublicNavEntry[];
  /** Called after any navigation action (link or submenu item). */
  onNavigate?: () => void;
  className?: string;
  listClassName?: string;
  /** For debugging / analytics: whether data came from API yet. */
  dataNavigationSource?: "api" | "fallback";
};

/**
 * Stateless menu markup for resolved `PublicNavEntry[]` (links + dropdowns).
 * Owns dropdown open state and click-outside behavior.
 */
export function PublicNavMenu({
  entries,
  onNavigate,
  className,
  listClassName,
  dataNavigationSource,
}: PublicNavMenuProps) {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenDropdownIndex(null);
  }, [entries]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
    }
    if (openDropdownIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdownIndex]);

  function handleActivate() {
    onNavigate?.();
  }

  return (
    <nav
      ref={navRef}
      className={cn(className)}
      aria-label="Main navigation"
      {...(dataNavigationSource ? { "data-navigation-source": dataNavigationSource } : {})}
    >
      <ul className={cn(navListClass, listClassName)}>
        {entries.map((entry, index) => {
          const key = publicNavEntryKey(entry, index);
          if (entry.type === "link") {
            return (
              <li key={key}>
                <Link href={entry.href} className={navLinkClass} onClick={handleActivate}>
                  {entry.label}
                </Link>
              </li>
            );
          }

          const open = openDropdownIndex === index;
          return (
            <li key={key} className="relative">
              <button
                type="button"
                className={dropdownTriggerClass}
                onClick={() => setOpenDropdownIndex(open ? null : index)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={`Toggle ${entry.label} menu`}
              >
                {entry.label}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform md:ml-0.5",
                    open && "rotate-180"
                  )}
                />
              </button>
              {open && (
                <ul className={dropdownPanelClass} role="menu">
                  {entry.items.map((item) => (
                    <li key={`${item.href}:${item.label}`} role="none">
                      <Link
                        href={item.href}
                        role="menuitem"
                        className={dropdownItemClass}
                        onClick={() => {
                          setOpenDropdownIndex(null);
                          handleActivate();
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
