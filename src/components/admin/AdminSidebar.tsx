"use client";

import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminNavList } from "./admin-nav";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar sm:flex"
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-semibold text-sidebar-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              N
            </span>
            Nexora Admin
          </Link>
        </div>
        <AdminNavList />
      </aside>

      {/* Mobile: Sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 border-sidebar-border bg-sidebar p-0 sm:hidden"
          showCloseButton={true}
        >
          <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-semibold text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                N
              </span>
              Nexora Admin
            </Link>
          </div>
          <AdminNavList onLinkClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
