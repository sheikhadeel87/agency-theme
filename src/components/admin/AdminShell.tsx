"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

const titleByPath: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/site-settings": "Site Settings",
  "/admin/site-settings/edit": "Edit Site Settings",
  "/admin/homepage": "Homepage",
  "/admin/homepage/hero": "Edit Hero",
  "/admin/services": "Services",
  "/admin/services/new": "New Service",
  "/admin/portfolio": "Portfolio",
  "/admin/portfolio/new": "New Project",
  "/admin/portfolio/edit": "Edit Project",
  "/admin/team": "Team",
  "/admin/blog": "Blog",
  "/admin/blog/new": "New Post",
  "/admin/blog/edit": "Edit Post",
  "/admin/pages": "Pages",
  "/admin/legal": "Legal",
};

function getTitle(pathname: string): string {
  if (pathname?.startsWith("/admin/portfolio/edit/")) return "Edit Project";
  if (pathname?.startsWith("/admin/blog/edit/")) return "Edit Post";
  return titleByPath[pathname] ?? "Admin";
}

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const title = getTitle(pathname ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="sm:pl-64">
        <AdminTopbar
          title={title}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}