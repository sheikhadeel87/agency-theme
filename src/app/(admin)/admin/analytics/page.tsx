import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DailyVisitsChart } from "@/components/admin/DailyVisitsChart";
import {
  ANALYTICS_DEVICE_OPTIONS,
  analyticsPageHref,
  formatAnalyticsCountryLabel,
  formatAnalyticsRangeCaption,
  getAnalyticsSnapshot,
  getDailyChartRows,
  getDistinctCountriesForRange,
  getRecentPageVisitsPage,
  parseAnalyticsUrl,
  RECENT_ACTIVITY_PAGE_SIZE,
  type AnalyticsUrlParams,
  type TopRow,
} from "@/lib/analytics-data";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const filterSelectClass =
  "h-9 min-w-[6.5rem] max-w-[10rem] rounded-lg border border-input bg-background px-2 text-sm text-foreground";

function recentActivityPageWindow(totalPages: number, page: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function ListCard({
  title,
  rows,
  empty,
  rowHref,
  activeFilterKey,
}: {
  title: string;
  rows: TopRow[];
  empty: string;
  rowHref?: (filterKey: string) => string;
  activeFilterKey?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.map((r, i) => {
            const clickable = Boolean(rowHref && r.filterKey);
            const active =
              activeFilterKey !== undefined &&
              r.filterKey !== undefined &&
              r.filterKey === activeFilterKey;
            const rowShell = cn(
              "flex items-center justify-between gap-3 text-sm border-b border-border/60 pb-2 last:border-0 last:pb-0"
            );
            const interactive = cn(
              "-mx-1 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-1 py-0.5 outline-none ring-offset-background",
              active ? "bg-muted/50 font-semibold text-foreground" : "hover:bg-muted/35",
              "focus-visible:ring-2 focus-visible:ring-ring"
            );
            const inner = (
              <>
                <span className="min-w-0 truncate" title={r.label}>
                  {i + 1}. {r.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{r.count}</span>
              </>
            );
            return (
              <li key={`${r.filterKey ?? r.label}-${i}`} className={rowShell}>
                {clickable ? (
                  <Link href={rowHref!(r.filterKey!)} className={interactive}>
                    {inner}
                  </Link>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ra = parseAnalyticsUrl(sp);
  const [data, recent, countryCodes] = await Promise.all([
    getAnalyticsSnapshot({
      from: ra.from,
      to: ra.to,
      country: ra.country,
      device: ra.device,
      source: ra.source,
    }),
    getRecentPageVisitsPage(ra),
    getDistinctCountriesForRange(ra.from, ra.to),
  ]);
  const chartRows = await getDailyChartRows({
    metric: ra.metric,
    from: ra.from,
    to: ra.to,
    visitsRows: data.dailyVisits,
  });
  const countryOptions = Array.from(
    new Set([...countryCodes, ...(ra.country ? [ra.country] : [])])
  ).sort((a, b) => a.localeCompare(b));
  const { rows: activityRows, total: activityTotal, page: activityPage } = recent;
  const totalActivityPages = Math.max(1, Math.ceil(activityTotal / RECENT_ACTIVITY_PAGE_SIZE) || 1);
  const activityFrom =
    activityTotal === 0 ? 0 : (activityPage - 1) * RECENT_ACTIVITY_PAGE_SIZE + 1;
  const activityTo = Math.min(activityPage * RECENT_ACTIVITY_PAGE_SIZE, activityTotal);
  const hrefActivity = (over: Partial<{ q: string; page: number }>) =>
    analyticsPageHref(
      {
        from: ra.from,
        to: ra.to,
        q: ra.q,
        page: activityPage,
        country: ra.country,
        device: ra.device,
        source: ra.source,
        metric: ra.metric,
        ...over,
      },
      "recent-activity"
    );
  const chartHref = (metric: typeof ra.metric) =>
    analyticsPageHref({
      from: ra.from,
      to: ra.to,
      q: ra.q,
      page: activityPage,
      country: ra.country,
      device: ra.device,
      source: ra.source,
      metric,
    });

  /** Merge URL params for filter links; `page` defaults to 1 when applying filters from lists. */
  const filterHref = (
    patch: Partial<Pick<AnalyticsUrlParams, "country" | "device" | "source">> & { page?: number }
  ) =>
    analyticsPageHref({
      from: ra.from,
      to: ra.to,
      q: ra.q,
      page: patch.page ?? 1,
      country: patch.country !== undefined ? patch.country : ra.country,
      device: patch.device !== undefined ? patch.device : ra.device,
      source: patch.source !== undefined ? patch.source : ra.source,
      metric: ra.metric,
    });

  const rangeCaption = formatAnalyticsRangeCaption(ra.from, ra.to);
  const visitFiltersActive = Boolean(ra.country || ra.device || ra.source);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="Simple page views and contact volume (Phase 1 — no unique visitors or sessions)."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Range: <span className="font-medium text-foreground">{rangeCaption}</span>. Visits, chart, and
            lists respect country, device, and traffic source when set (use rows or chips); messages and
            funnel use the date range only.
          </p>
        </div>
        <form
          method="GET"
          action="/admin/analytics"
          className="flex flex-wrap items-end gap-2 sm:shrink-0"
        >
          <input type="hidden" name="page" value="1" />
          {ra.q ? <input type="hidden" name="q" value={ra.q} /> : null}
          {ra.metric !== "visits" ? (
            <input type="hidden" name="metric" value={ra.metric} />
          ) : null}
          {ra.source ? <input type="hidden" name="source" value={ra.source} /> : null}
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            From
            <input
              type="date"
              name="from"
              defaultValue={ra.from}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            />
          </label>
          <span className="hidden pb-2 text-muted-foreground sm:inline" aria-hidden>
            →
          </span>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            To
            <input
              type="date"
              name="to"
              defaultValue={ra.to}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Country
            <select
              name="country"
              defaultValue={ra.country}
              className={filterSelectClass}
              aria-label="Filter by country"
            >
              <option value="">All</option>
              {countryOptions.map((code) => (
                <option key={code} value={code}>
                  {formatAnalyticsCountryLabel(code)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Device
            <select
              name="device"
              defaultValue={ra.device}
              className={filterSelectClass}
              aria-label="Filter by device"
            >
              <option value="">All</option>
              {ANALYTICS_DEVICE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            Apply
          </button>
        </form>
      </div>

      {visitFiltersActive ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filters:</span>
          {ra.country ? (
            <Link
              href={filterHref({ country: "", page: 1 })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-muted/70"
            >
              {formatAnalyticsCountryLabel(ra.country)}
              <span className="text-muted-foreground" aria-hidden>
                ✕
              </span>
              <span className="sr-only">Remove country filter</span>
            </Link>
          ) : null}
          {ra.device ? (
            <Link
              href={filterHref({ device: "", page: 1 })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium capitalize text-foreground hover:bg-muted/70"
            >
              {ra.device}
              <span className="text-muted-foreground" aria-hidden>
                ✕
              </span>
              <span className="sr-only">Remove device filter</span>
            </Link>
          ) : null}
          {ra.source ? (
            <Link
              href={filterHref({ source: "", page: 1 })}
              className="inline-flex max-w-[14rem] items-center gap-1 truncate rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-muted/70"
              title={ra.source}
            >
              <span className="truncate">{ra.source}</span>
              <span className="shrink-0 text-muted-foreground" aria-hidden>
                ✕
              </span>
              <span className="sr-only">Remove source filter</span>
            </Link>
          ) : null}
          <Link
            href={filterHref({ country: "", device: "", source: "", page: 1 })}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total visits
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.totalVisits.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contact messages
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.totalContactMessages.toLocaleString()}
          </p>
          <Link
            href="/admin/contact-messages"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            View messages →
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Conversion rate
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.conversionRatePercent === null ? "—" : `${data.conversionRatePercent.toFixed(2)}%`}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Messages ÷ filtered visits
            {visitFiltersActive ? " (messages unfiltered)" : ""}.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Insights</h2>
        <p className="mt-1 text-xs text-muted-foreground">From funnel + top pages in this period.</p>
        {data.insights.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No notable patterns yet.</p>
        ) : (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground">
            {data.insights.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Funnel</h2>
        <p className="mt-1 text-xs text-muted-foreground">Homepage → contact click → submit (same period)</p>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          {(
            [
              ["Visits", data.funnel.visits],
              ["Click contact", data.funnel.clickContact],
              ["Contact submit", data.funnel.contactSubmit],
            ] as const
          ).map(([label, value], i) => (
            <div key={label} className="flex min-w-0 flex-1 items-end gap-3 sm:contents">
              {i > 0 ? (
                <span className="hidden text-lg text-muted-foreground sm:inline" aria-hidden>
                  →
                </span>
              ) : null}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DailyVisitsChart
        rows={chartRows}
        rangeCaption={rangeCaption}
        metric={ra.metric}
        metricLinks={{
          visits: chartHref("visits"),
          clicks: chartHref("clicks"),
          submits: chartHref("submits"),
        }}
        showEventDateOnlyNote={
          visitFiltersActive && (ra.metric === "clicks" || ra.metric === "submits")
        }
      />

      <section
        id="recent-activity"
        className="overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/10"
      >
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
          <form
            method="GET"
            action="/admin/analytics#recent-activity"
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="from" value={ra.from} />
            <input type="hidden" name="to" value={ra.to} />
            <input type="hidden" name="page" value="1" />
            {ra.metric !== "visits" ? (
              <input type="hidden" name="metric" value={ra.metric} />
            ) : null}
            {ra.source ? <input type="hidden" name="source" value={ra.source} /> : null}
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Country
              <select
                name="country"
                defaultValue={ra.country}
                className={filterSelectClass}
                aria-label="Filter recent activity by country"
              >
                <option value="">All</option>
                {countryOptions.map((code) => (
                  <option key={code} value={code}>
                    {formatAnalyticsCountryLabel(code)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Device
              <select
                name="device"
                defaultValue={ra.device}
                className={filterSelectClass}
                aria-label="Filter recent activity by device"
              >
                <option value="">All</option>
                {ANALYTICS_DEVICE_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="search"
              name="q"
              defaultValue={ra.q}
              placeholder="Search path…"
              className="h-9 min-w-[10rem] flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
              aria-label="Search by path"
            />
            <button type="submit" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              Search
            </button>
          </form>
        </div>
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">Page visits in this period (newest first)</p>
        </div>
        {activityTotal === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No visits in this period.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Path</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Country</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Device</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityRows.map((row, i) => (
                  <TableRow key={`${row.createdAt.toISOString()}-${row.path}-${i}`}>
                    <TableCell className="max-w-[14rem] truncate font-medium" title={row.path}>
                      {row.path}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{row.country}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{row.device}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                      {row.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {activityFrom}–{activityTo}
                </span>{" "}
                of <span className="font-medium text-foreground">{activityTotal.toLocaleString()}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={hrefActivity({ page: activityPage - 1 })}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    activityPage <= 1 && "pointer-events-none opacity-50"
                  )}
                  aria-disabled={activityPage <= 1}
                >
                  Prev
                </Link>
                {recentActivityPageWindow(totalActivityPages, activityPage).map((p) => (
                  <Link
                    key={p}
                    href={hrefActivity({ page: p })}
                    className={cn(
                      buttonVariants({
                        variant: p === activityPage ? "default" : "outline",
                        size: "sm",
                      }),
                      "min-w-9 px-0"
                    )}
                  >
                    {p}
                  </Link>
                ))}
                <Link
                  href={hrefActivity({ page: activityPage + 1 })}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    activityPage >= totalActivityPages && "pointer-events-none opacity-50"
                  )}
                  aria-disabled={activityPage >= totalActivityPages}
                >
                  Next
                </Link>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard title="Top pages" rows={data.topPages} empty="No visits recorded yet." />
        <ListCard
          title="Top countries"
          rows={data.topCountries}
          empty="No country data yet (often Unknown outside edge/CDN)."
          rowHref={(key) => filterHref({ country: key, page: 1 })}
          activeFilterKey={ra.country || undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard
          title="Traffic source"
          rows={data.trafficSources}
          empty="No source data yet."
          rowHref={(key) => filterHref({ source: key, page: 1 })}
          activeFilterKey={ra.source || undefined}
        />
        <ListCard
          title="Device breakdown"
          rows={data.devices}
          empty="No device data yet."
          rowHref={(key) => filterHref({ device: key, page: 1 })}
          activeFilterKey={ra.device || undefined}
        />
      </div>
    </div>
  );
}
