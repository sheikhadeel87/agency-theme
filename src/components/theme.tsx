"use client";

import { Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  if (!mounted) return <span className="inline-block size-8 shrink-0" aria-hidden />;
  const dark = resolvedTheme === "dark";
  return (
    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Toggle theme">
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
