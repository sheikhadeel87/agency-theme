"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "./AdminShell";

function isLoginRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {isLoginRoute(pathname) ? (
        <div className="min-h-screen bg-muted/30">{children}</div>
      ) : (
        <AdminShell>{children}</AdminShell>
      )}
    </>
  );
}
