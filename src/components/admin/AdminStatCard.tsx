import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  href: string;
  icon: LucideIcon;
  className?: string;
}

export function AdminStatCard({
  title,
  href,
  icon: Icon,
  className,
}: AdminStatCardProps) {
  return (
    <Link href={href} className="block h-full transition-opacity hover:opacity-90">
      <Card
        className={cn(
          "group flex h-full flex-row items-stretch gap-4 transition-colors hover:ring-2 hover:ring-primary/20",
          className
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center ml-2 rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="size-5" />
        </span>
        <CardHeader className="flex flex-1 flex-col gap-0 py-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-auto">Manage &rarr;</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
