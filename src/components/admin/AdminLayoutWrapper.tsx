"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import NextTopLoader from "nextjs-toploader";
import { AdminShell } from "./AdminShell";

const adminTopLoader = (
  <NextTopLoader
    color="#2563eb"
    height={3}
    showSpinner={false}
    crawlSpeed={180}
    shadow="0 0 12px rgba(37, 99, 235, 0.35)"
    zIndex={99999}
  />
);

function isLoginRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <NextTopLoader
        color="#2563eb"
        height={3}
        showSpinner={false}
        crawlSpeed={180}
        shadow="0 0 12px rgba(37, 99, 235, 0.35)"
        zIndex={99999}
      />
      {isLoginRoute(pathname) ? (
        <div className="min-h-screen bg-muted/30">{children}</div>
      ) : (
        <AdminShell>{children}</AdminShell>
      )}
    </>
  );
}
