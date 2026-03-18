import Link from "next/link";
import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";

interface AdminCardProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function AdminCard({
  title,
  description,
  actionLabel = "Edit",
  actionHref,
  onClick,
  className,
  children,
}: AdminCardProps) {
  const action = actionHref ? (
    <Link
      href={actionHref}
      className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
    >
      {actionLabel}
      <ChevronRight className="size-4" />
    </Link>
  ) : onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
    >
      {actionLabel}
      <ChevronRight className="size-4" />
    </button>
  ) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
