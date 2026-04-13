"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function AdminToaster() {
  const { resolvedTheme } = useTheme();

  const theme =
    resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : "system";

  return (
    <Toaster position="top-right" richColors closeButton theme={theme} />
  );
}
