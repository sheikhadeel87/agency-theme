import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAnalyticsSnapshot, type DailyVisitRow } from "@/lib/analytics-data";

export const dynamic = "force-dynamic";

function DailyVisitsChart({ rows }: { rows: DailyVisitRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const sum = rows.reduce((a, r) => a + r.count, 0);
  return (
    <section className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Daily visits
        </h2>
        <p className="text-xs text-muted-foreground">
          Last 14 days (UTC) · {sum.toLocaleString()} in range
        </p>
      </div>
      <div className="mt-4 flex h-36 items-end gap-px sm:gap-1">
        {rows.map(({ day, count }) => (
          <div key={day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="flex h-28 w-full flex-col justify-end"
              title={`${day}: ${count}`}
            >
              <div
                className="w-full min-h-px rounded-t bg-primary/80"
                style={{ height: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] leading-none text-muted-foreground">
              {day.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; count: number }[];
  empty: string;
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
          {rows.map((r, i) => (
            <li
              key={`${r.label}-${i}`}
              className="flex items-center justify-between gap-3 text-sm border-b border-border/60 pb-2 last:border-0 last:pb-0"
            >
              <span className="min-w-0 truncate font-medium text-foreground" title={r.label}>
                {i + 1}. {r.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{r.count}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsSnapshot();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="Simple page views and contact volume (Phase 1 — no unique visitors or sessions)."
      />

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
            Messages ÷ visits (all time)
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Insights</h2>
        <p className="mt-1 text-xs text-muted-foreground">From funnel + top pages (all time).</p>
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
        <p className="mt-1 text-xs text-muted-foreground">Homepage → contact click → submit (all time)</p>
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

      <DailyVisitsChart rows={data.dailyVisits} />

      <section className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Latest 10 page visits</p>
        {data.recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No visits recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Path</th>
                  <th className="pb-2 pr-3 font-medium">Country</th>
                  <th className="pb-2 pr-3 font-medium">Device</th>
                  <th className="pb-2 font-medium">Time (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.map((row, i) => (
                  <tr
                    key={`${row.createdAt.toISOString()}-${row.path}-${i}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="max-w-[14rem] truncate py-2 pr-3 font-medium text-foreground" title={row.path}>
                      {row.path}
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">{row.country}</td>
                    <td className="py-2 pr-3 capitalize text-muted-foreground">{row.device}</td>
                    <td className="py-2 whitespace-nowrap tabular-nums text-muted-foreground">
                      {row.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard title="Top pages" rows={data.topPages} empty="No visits recorded yet." />
        <ListCard
          title="Top countries"
          rows={data.topCountries}
          empty="No country data yet (often Unknown outside edge/CDN)."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard
          title="Traffic source"
          rows={data.trafficSources}
          empty="No source data yet."
        />
        <ListCard
          title="Device breakdown"
          rows={data.devices}
          empty="No device data yet."
        />
      </div>
    </div>
  );
}
