"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Home,
  Briefcase,
  ImageIcon,
  Users,
  FileText,
  FileStack,
  Scale,
  ThumbsUp,
  LifeBuoy,
  MessageSquareQuote,
  MapPin,
  DollarSign,
  Inbox,
  Mail,
  Send,
  Eye,
  History,
  Shield,
} from "lucide-react";
import { getNewContactMessageCountAction } from "@/lib/actions/contact-message-actions";
import { cn } from "@/lib/utils";

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Site Settings", href: "/admin/site-settings", icon: Settings },
  { label: "Page visibility", href: "/admin/page-visibility", icon: Eye },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Why Choose Us", href: "/admin/why-choose-us", icon: ThumbsUp },
  { label: "Support", href: "/admin/features-highlights", icon: LifeBuoy },
  { label: "Services", href: "/admin/services", icon: Briefcase },
  { label: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Contact & Map", href: "/admin/contact", icon: MapPin },
  { label: "Contact messages", href: "/admin/contact-messages", icon: Inbox },
  { label: "Admins", href: "/admin/admins", icon: Shield },
  { label: "Audit logs", href: "/admin/audit-logs", icon: History },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Send newsletter", href: "/admin/newsletter/send", icon: Send },
  { label: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Pages", href: "/admin/pages", icon: FileStack },
  { label: "Legal", href: "/admin/legal", icon: Scale },
] as const;

function ContactInboxBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => void getNewContactMessageCountAction().then(setCount);
    refresh();
    const t = setInterval(refresh, 30_000);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  if (count < 1) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold leading-none text-white tabular-nums dark:bg-red-500"
      title={`${count} new`}
    >
      {label}
    </span>
  );
}

export function AdminNavList({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {adminNavItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const isInbox = href === "/admin/contact-messages";
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
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {isInbox ? <ContactInboxBadge /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
