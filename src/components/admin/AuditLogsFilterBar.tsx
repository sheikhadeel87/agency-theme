"use client";

import Link from "next/link";
import {
  adminAuditLogsQueryString,
  type AdminAuditLogFilterOptions,
  type ParsedAuditLogQuery,
} from "@/lib/admin-audit-logs-params";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownWideNarrow,
  Calendar,
  Crosshair,
  Package,
  Search,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const inputWrap = "flex flex-col gap-1.5 min-w-0";
const labelClass =
  "flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0";

type Props = {
  query: ParsedAuditLogQuery;
  options: AdminAuditLogFilterOptions;
};

function baseQuery(q: ParsedAuditLogQuery): ParsedAuditLogQuery {
  return { ...q, page: 1 };
}

const pill = (active: boolean) =>
  cn(buttonVariants({ variant: active ? "default" : "outline", size: "sm" }), "h-7 text-xs");

export function AuditLogsFilterBar({ query, options }: Props) {
  const q1 = baseQuery(query);

  const withQuick = (quick: ParsedAuditLogQuery["quick"]) =>
    `/admin/audit-logs${adminAuditLogsQueryString({
      ...q1,
      quick,
      dateFrom: "",
      dateTo: "",
    })}`;

  const quickActive = (quick: ParsedAuditLogQuery["quick"]) =>
    query.quick === quick && !query.dateFrom && !query.dateTo;

  const allTimeHref = `/admin/audit-logs${adminAuditLogsQueryString({
    ...q1,
    quick: "",
    dateFrom: "",
    dateTo: "",
  })}`;

  const allTimeActive =
    !query.quick && !query.dateFrom && !query.dateTo;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
      <form method="GET" action="/admin/audit-logs" className="space-y-4">
        <input type="hidden" name="page" value="1" />
        {query.quick && !query.dateFrom && !query.dateTo ? (
          <input type="hidden" name="quick" value={query.quick} />
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={inputWrap}>
            <label htmlFor="audit-q" className={labelClass}>
              <Search className="size-3.5" aria-hidden />
              Search description
            </label>
            <Input
              id="audit-q"
              name="q"
              type="search"
              placeholder="Search in saved description…"
              defaultValue={query.q}
              className="w-full"
            />
          </div>
          <div className={inputWrap}>
            <label htmlFor="audit-user" className={labelClass}>
              <User className="size-3.5" aria-hidden />
              User
            </label>
            <Input
              id="audit-user"
              name="user"
              type="search"
              placeholder="Name or email…"
              defaultValue={query.user}
              className="w-full"
            />
          </div>
          <div className={inputWrap}>
            <label htmlFor="audit-action" className={labelClass}>
              <Crosshair className="size-3.5" aria-hidden />
              Action
            </label>
            <Input
              id="audit-action"
              name="action"
              list="audit-action-options"
              placeholder="Exact action code…"
              defaultValue={query.action}
              className="w-full font-mono text-xs"
            />
            <datalist id="audit-action-options">
              {options.actions.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
          <div className={inputWrap}>
            <label htmlFor="audit-resource" className={labelClass}>
              <Package className="size-3.5" aria-hidden />
              Resource
            </label>
            <Input
              id="audit-resource"
              name="resource"
              list="audit-resource-options"
              placeholder="Exact resource key…"
              defaultValue={query.resource}
              className="w-full"
            />
            <datalist id="audit-resource-options">
              {options.resources.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className={cn(inputWrap, "lg:col-span-5")}>
            <span className={labelClass}>
              <Calendar className="size-3.5" aria-hidden />
              Date range
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="audit-from"
                name="dateFrom"
                type="date"
                defaultValue={query.dateFrom}
                className="min-w-[10rem] flex-1"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                id="audit-to"
                name="dateTo"
                type="date"
                defaultValue={query.dateTo}
                className="min-w-[10rem] flex-1"
              />
            </div>
          </div>

          <div className={cn(inputWrap, "lg:col-span-4")}>
            <span className={labelClass}>
              <Zap className="size-3.5" aria-hidden />
              Quick filter
            </span>
            <div className="flex flex-wrap gap-2">
              <Link href={allTimeHref} className={pill(allTimeActive)}>
                All time
              </Link>
              <Link href={withQuick("today")} className={pill(quickActive("today"))}>
                Today
              </Link>
              <Link href={withQuick("7d")} className={pill(quickActive("7d"))}>
                7 days
              </Link>
              <Link href={withQuick("30d")} className={pill(quickActive("30d"))}>
                30 days
              </Link>
            </div>
          </div>

          <div className={cn(inputWrap, "lg:col-span-3")}>
            <label htmlFor="audit-sort" className={labelClass}>
              <ArrowDownWideNarrow className="size-3.5" aria-hidden />
              Sort
            </label>
            <select
              id="audit-sort"
              name="sort"
              defaultValue={query.sort}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button type="submit" size="sm">
            Apply filters
          </Button>
          <Link
            href="/admin/audit-logs"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
