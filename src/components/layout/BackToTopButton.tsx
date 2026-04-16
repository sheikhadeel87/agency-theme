"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 400;

export function BackToTopButton() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    setVisible(window.scrollY >= SHOW_AFTER_PX);
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    const raf = requestAnimationFrame(() => onScroll());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAdmin, onScroll]);

  if (isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full transition-[opacity,transform]",
        "bg-[#2E5BFF] text-white shadow-none hover:bg-[#2651e0]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        visible ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"
      )}
    >
      <ChevronUp className="size-6" aria-hidden />
    </button>
  );
}
