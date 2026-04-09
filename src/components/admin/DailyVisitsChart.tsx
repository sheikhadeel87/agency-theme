"use client";

import Link from "next/link";
import type { AnalyticsChartMetric, DailyVisitRow } from "@/lib/analytics-data";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  label: string;
  fullDay: string;
  count: number;
};

function formatTooltipDate(day: string): string {
  try {
    return new Date(`${day}T12:00:00.000Z`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return day;
  }
}

function countNoun(metric: AnalyticsChartMetric, count: number): string {
  if (metric === "visits") return count === 1 ? "visit" : "visits";
  if (metric === "clicks") return count === 1 ? "click" : "clicks";
  return count === 1 ? "submit" : "submits";
}

function chartTitle(metric: AnalyticsChartMetric): string {
  if (metric === "visits") return "Daily visits";
  if (metric === "clicks") return "Contact clicks";
  return "Contact submits";
}

function DailyChartTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
  metric: AnalyticsChartMetric;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const { fullDay, count } = point;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl ring-1 ring-foreground/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {formatTooltipDate(fullDay)}
      </p>
      <p className="mt-1.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
          {count.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {countNoun(metric, count)}
        </span>
      </p>
    </div>
  );
}

export function DailyVisitsChart({
  rows,
  rangeCaption,
  metric,
  metricLinks,
  showEventDateOnlyNote,
}: {
  rows: DailyVisitRow[];
  rangeCaption: string;
  metric: AnalyticsChartMetric;
  metricLinks: { visits: string; clicks: string; submits: string };
  showEventDateOnlyNote?: boolean;
}) {
  const data: ChartPoint[] = rows.map((r) => ({
    label: r.day.slice(5),
    fullDay: r.day,
    count: r.count,
  }));
  const sum = rows.reduce((a, r) => a + r.count, 0);
  const peak =
    rows.length > 0
      ? rows.reduce((best, r) => (r.count > best.count ? r : best), rows[0])
      : null;

  const title = chartTitle(metric);
  const ariaSum = `${sum} ${countNoun(metric, sum)} in range`;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-foreground/[0.04]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-chart-1/25 via-chart-3/10 to-transparent blur-3xl dark:from-chart-2/20 dark:via-chart-4/15"
        aria-hidden
      />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-muted/60 blur-2xl dark:bg-muted/25" aria-hidden />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </h2>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Chart metric">
              {(
                [
                  ["visits", "Visits", metricLinks.visits],
                  ["clicks", "Clicks", metricLinks.clicks],
                  ["submits", "Submits", metricLinks.submits],
                ] as const
              ).map(([key, label, href]) => (
                <Link
                  key={key}
                  href={href}
                  role="tab"
                  aria-selected={metric === key}
                  className={cn(
                    buttonVariants({
                      variant: metric === key ? "default" : "outline",
                      size: "sm",
                    }),
                    "h-8 px-2.5 text-xs"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {rangeCaption} · <span className="font-semibold text-foreground">{sum.toLocaleString()}</span>{" "}
            in range
          </p>
          {showEventDateOnlyNote ? (
            <p className="mt-1.5 text-[11px] leading-snug text-amber-700 dark:text-amber-500/95">
              Clicks and submits are currently filtered by date only.
            </p>
          ) : null}
        </div>
        {peak && peak.count > 0 ? (
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1.5 text-xs dark:bg-muted/30">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">Peak</span>
            <span className="font-bold tabular-nums text-foreground">{peak.count.toLocaleString()}</span>
            <span className="text-muted-foreground">· {peak.day.slice(5)}</span>
          </div>
        ) : null}
      </div>

      <div
        className="relative mt-6 h-[min(20rem,55vw)] w-full min-h-[220px] sm:min-h-[260px]"
        role="img"
        aria-label={`${title}, ${rangeCaption}, ${ariaSum}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 4 }}
            barCategoryGap="14%"
          >
            <defs>
              <linearGradient id="visitsBarGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.92} />
                <stop offset="42%" stopColor="var(--chart-3)" stopOpacity={0.88} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.72} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border)"
              strokeOpacity={0.65}
              strokeDasharray="4 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
              width={36}
              allowDecimals={false}
              tickCount={5}
            />
            <Tooltip
              content={(props) => <DailyChartTooltip {...props} metric={metric} />}
              cursor={{ fill: "var(--muted)", opacity: 0.22 }}
              animationDuration={200}
            />
            <Bar
              dataKey="count"
              fill="url(#visitsBarGradient)"
              radius={[8, 8, 2, 2]}
              maxBarSize={52}
              animationDuration={900}
              animationEasing="ease-out"
              activeBar={{
                fill: "url(#visitsBarGradient)",
                stroke: "var(--chart-2)",
                strokeWidth: 2,
                opacity: 1,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
