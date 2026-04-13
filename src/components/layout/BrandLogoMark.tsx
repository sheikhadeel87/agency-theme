import Image from "next/image";
import { Zap } from "lucide-react";
import type { SiteSettingsData } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";
import { cn } from "@/lib/utils";

/** Header/footer brand icon: uploaded logo when `logoUrl` is set, else default Zap mark. */
export function BrandLogoMark({
  siteSettings,
  className,
}: {
  siteSettings?: SiteSettingsData | null;
  className?: string;
}) {
  const url = siteSettings?.logoUrl?.trim();
  if (url) {
    return (
      <span
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background",
          className
        )}
      >
        <Image
          src={url}
          alt=""
          width={36}
          height={36}
          className="object-contain"
          unoptimized={shouldUseUnoptimizedImage(url)}
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white",
        className
      )}
    >
      <Zap className="size-5" />
    </span>
  );
}
