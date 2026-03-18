"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Home,
  Briefcase,
  ImageIcon,
  Users,
  FileText,
  FileStack,
  Scale,
  ThumbsUp,
  MessageSquareQuote,
  MapPin,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Site Settings", href: "/admin/site-settings", icon: Settings },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Why Choose Us", href: "/admin/why-choose-us", icon: ThumbsUp },
  { label: "Services", href: "/admin/services", icon: Briefcase },
  { label: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Contact & Map", href: "/admin/contact", icon: MapPin },
  { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Pages", href: "/admin/pages", icon: FileStack },
  { label: "Legal", href: "/admin/legal", icon: Scale },
] as const;

export function AdminNavList({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {adminNavItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm mb-3 font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-gray-200 hover:text-gray-900"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
