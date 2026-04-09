import { dbConnect } from "@/lib/db";
import { FUNNEL_EVENTS } from "@/lib/track-event";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { ContactMessage } from "@/models/ContactMessage";
import { PageVisit } from "@/models/PageVisit";

/** Mongo filter shape for PageVisit queries (avoids mongoose FilterQuery typing quirks). */
type PageVisitFilter = Record<string, unknown>;

/** `filterKey` = raw value for URL filters (country code, device, traffic source); optional for display-only rows. */
export type TopRow = { label: string; count: number; filterKey?: string };

export type DailyVisitRow = { day: string; count: number };

export type RecentVisitRow = {
  path: string;
  country: string;
  device: string;
  createdAt: Date;
};

export type AnalyticsKpiMetrics = {
  visits: number;
  messages: number;
  /** messages ÷ visits × 100; null if visits === 0 */
  conversion: number | null;
};

/** KPI compare: same filters; previous = equal-length UTC window ending day before current `from`. */
export type AnalyticsKpiCompare = {
  current: AnalyticsKpiMetrics;
  previous: AnalyticsKpiMetrics;
  visitsChangePercent: number;
  messagesChangePercent: number;
  /** Relative % change of conversion rate; null if either period has no rate. */
  conversionChangePercent: number | null;
};

export type AnalyticsSnapshot = {
  totalVisits: number;
  topPages: TopRow[];
  topCountries: TopRow[];
  devices: TopRow[];
  trafficSources: TopRow[];
  totalContactMessages: number;
  /** contact messages ÷ total visits × 100; null if there are no visits. */
  conversionRatePercent: number | null;
  kpiCompare: AnalyticsKpiCompare;
  /** One row per calendar day (UTC) in the selected range, including zeros. */
  dailyVisits: DailyVisitRow[];
  /** Funnel event counts in the selected date range. */
  funnel: {
    visits: number;
    clickContact: number;
    contactSubmit: number;
  };
  /** Short heuristic notes for the dashboard. */
  insights: string[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Default window when `from` / `to` missing or invalid: last 30 UTC calendar days. */
const DEFAULT_RANGE_DAYS = 30;
/** Inclusive day count cap (UTC). */
const MAX_RANGE_DAYS = 366;

export const RECENT_ACTIVITY_PAGE_SIZE = 10;

export const ANALYTICS_DEVICE_OPTIONS = ["desktop", "mobile", "unknown"] as const;
export type AnalyticsDeviceFilter = (typeof ANALYTICS_DEVICE_OPTIONS)[number];

/** Daily chart series; URL query `metric`. Clicks/submits use `AnalyticsEvent` names `click_contact` / `contact_submit`. */
export const ANALYTICS_CHART_METRICS = ["visits", "clicks", "submits"] as const;
export type AnalyticsChartMetric = (typeof ANALYTICS_CHART_METRICS)[number];

function countryLabel(code: string): string {
  if (!code || code === "Unknown" || code === "Local dev") return code || "—";
  if (code.length === 2 && /^[a-z]{2}$/i.test(code)) {
    try {
      const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase());
      if (name) return name;
    } catch {
      /* fall through */
    }
    return code.toUpperCase();
  }
  return code;
}

/** Display label for country codes in admin UI (e.g. dropdown). */
export function formatAnalyticsCountryLabel(code: string): string {
  return countryLabel(code);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function paramStr(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

function parseDeviceFilter(sp: Record<string, string | string[] | undefined>): string {
  const raw = paramStr(sp, "device").trim().toLowerCase();
  return ANALYTICS_DEVICE_OPTIONS.includes(raw as AnalyticsDeviceFilter) ? raw : "";
}

function parseChartMetric(sp: Record<string, string | string[] | undefined>): AnalyticsChartMetric {
  const raw = paramStr(sp, "metric").trim().toLowerCase();
  return ANALYTICS_CHART_METRICS.includes(raw as AnalyticsChartMetric)
    ? (raw as AnalyticsChartMetric)
    : "visits";
}

function addUtcDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function lastNDaysUtcIso(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(Date.UTC(y, m, d - i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}

function defaultFromTo(): { from: string; to: string } {
  const labels = lastNDaysUtcIso(DEFAULT_RANGE_DAYS);
  return { from: labels[0]!, to: labels[labels.length - 1]! };
}

function utcDaysInclusive(fromIso: string, toIso: string): string[] {
  const out: string[] = [];
  let cur = fromIso;
  while (cur <= toIso) {
    out.push(cur);
    cur = addUtcDays(cur, 1);
  }
  return out;
}

/** Inclusive day count for [from, to] (UTC). */
function utcRangeDayCount(fromIso: string, toIso: string): number {
  return utcDaysInclusive(fromIso, toIso).length;
}

/**
 * Previous period with same duration as [from, to], non-overlapping, immediately before.
 * rangeDays = inclusive span; prevTo = day before `from`; prevFrom = prevTo − (rangeDays − 1).
 */
function previousPeriodFromTo(fromIso: string, toIso: string): { from: string; to: string } {
  const rangeDays = utcRangeDayCount(fromIso, toIso);
  const prevTo = addUtcDays(fromIso, -1);
  const prevFrom = addUtcDays(prevTo, -(rangeDays - 1));
  return { from: prevFrom, to: prevTo };
}

function kpiConversionRate(visits: number, messages: number): number | null {
  if (visits === 0) return null;
  return (messages / visits) * 100;
}

/** % change; if previous === 0 → 100 when current > 0 else 0. */
export function kpiCountChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function kpiConversionChangePercent(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null) return null;
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Filtered visits + date-scoped messages + conversion for one range (assumes db already connected). */
async function queryAnalyticsKpiMetrics(opts: {
  from: string;
  to: string;
  country: string;
  device: string;
  source: string;
}): Promise<AnalyticsKpiMetrics> {
  const pv = pageVisitMatch(opts);
  const time = visitCreatedAtRange(opts.from, opts.to);
  const [visits, messages] = await Promise.all([
    PageVisit.countDocuments(pv),
    ContactMessage.countDocuments(time),
  ]);
  return { visits, messages, conversion: kpiConversionRate(visits, messages) };
}

/** Same as snapshot KPI logic; standalone for reuse (e.g. API). */
export async function getAnalyticsKpiMetricsForRange(opts: {
  from: string;
  to: string;
  country: string;
  device: string;
  source: string;
}): Promise<AnalyticsKpiMetrics> {
  await dbConnect();
  return queryAnalyticsKpiMetrics(opts);
}

/** Human-readable range for UI (UTC calendar days). */
export function formatAnalyticsRangeCaption(fromIso: string, toIso: string): string {
  const opt: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  };
  const a = new Date(`${fromIso}T12:00:00.000Z`).toLocaleDateString("en-GB", opt);
  const b = new Date(`${toIso}T12:00:00.000Z`).toLocaleDateString("en-GB", opt);
  return `${a} – ${b} (UTC)`;
}

export type AnalyticsUrlParams = {
  from: string;
  to: string;
  q: string;
  page: number;
  country: string;
  device: string;
  source: string;
  metric: AnalyticsChartMetric;
};

export function parseAnalyticsUrl(
  sp: Record<string, string | string[] | undefined>
): AnalyticsUrlParams {
  const q = typeof sp.q === "string" ? sp.q : "";
  const pageRaw = sp.page;
  const page = Math.max(
    1,
    parseInt(String(Array.isArray(pageRaw) ? pageRaw[0] : pageRaw ?? "1"), 10) || 1
  );
  const device = parseDeviceFilter(sp);
  const metric = parseChartMetric(sp);
  const countryRaw = paramStr(sp, "country").trim();
  const country =
    !countryRaw || countryRaw.toLowerCase() === "all" ? "" : countryRaw.slice(0, 64);
  const sourceRaw = paramStr(sp, "source").trim();
  const source = sourceRaw.toLowerCase() === "all" ? "" : sourceRaw.slice(0, 128);

  let from = paramStr(sp, "from").slice(0, 10);
  let to = paramStr(sp, "to").slice(0, 10);
  if (!ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    const d = defaultFromTo();
    return { ...d, q, page, country, device, source, metric };
  }
  if (from > to) {
    const t = from;
    from = to;
    to = t;
  }
  const span =
    Math.floor(
      (new Date(`${to}T00:00:00.000Z`).getTime() - new Date(`${from}T00:00:00.000Z`).getTime()) /
        86400000
    ) + 1;
  if (span > MAX_RANGE_DAYS) {
    from = addUtcDays(to, -(MAX_RANGE_DAYS - 1));
  }

  return { from, to, q, page, country, device, source, metric };
}

/** `/admin/analytics` URL with query; optional `#recent-activity` for table anchor. */
export function analyticsPageHref(
  p: {
    from: string;
    to: string;
    q: string;
    page: number;
    country: string;
    device: string;
    source: string;
    metric: AnalyticsChartMetric;
  },
  hash?: "recent-activity"
): string {
  const s = new URLSearchParams();
  s.set("from", p.from);
  s.set("to", p.to);
  s.set("page", String(p.page));
  if (p.q.trim()) s.set("q", p.q.trim());
  if (p.country.trim()) s.set("country", p.country.trim());
  if (p.device.trim()) s.set("device", p.device.trim());
  if (p.source.trim()) s.set("source", p.source.trim());
  if (p.metric !== "visits") s.set("metric", p.metric);
  const url = `/admin/analytics?${s.toString()}`;
  return hash ? `${url}#${hash}` : url;
}

function visitCreatedAtRange(fromIso: string, toIso: string): { createdAt: { $gte: Date; $lt: Date } } {
  const start = new Date(`${fromIso}T00:00:00.000Z`);
  const endExclusive = new Date(`${addUtcDays(toIso, 1)}T00:00:00.000Z`);
  return { createdAt: { $gte: start, $lt: endExclusive } };
}

/**
 * Mongo filter for PageVisit: date range plus optional exact country, device, path.
 * Do not use for ContactMessage or AnalyticsEvent.
 */
export function pageVisitMatch(opts: {
  from: string;
  to: string;
  country?: string;
  device?: string;
  source?: string;
  path?: string;
}): PageVisitFilter {
  const filter: PageVisitFilter = { ...visitCreatedAtRange(opts.from, opts.to) };
  const c = opts.country?.trim();
  if (c && c.toLowerCase() !== "all") {
    filter.country = c.slice(0, 64);
  }
  const d = opts.device?.trim().toLowerCase();
  if (d && ANALYTICS_DEVICE_OPTIONS.includes(d as AnalyticsDeviceFilter)) {
    filter.device = d;
  }
  const src = opts.source?.trim();
  if (src && src.toLowerCase() !== "all") {
    filter.source = src.slice(0, 128);
  }
  const p = opts.path?.trim();
  if (p) {
    filter.path = p.slice(0, 500);
  }
  return filter;
}

/** Distinct country values in the date range (unfiltered); for filter dropdown options. */
export async function getDistinctCountriesForRange(from: string, to: string): Promise<string[]> {
  await dbConnect();
  const time = visitCreatedAtRange(from, to);
  const codes = await PageVisit.distinct("country", time);
  return (codes as string[])
    .filter((c) => typeof c === "string" && c.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

export async function getRecentPageVisitsPage(opts: {
  q: string;
  page: number;
  from: string;
  to: string;
  country: string;
  device: string;
  source: string;
}): Promise<{ rows: RecentVisitRow[]; total: number; page: number }> {
  await dbConnect();
  const perPage = RECENT_ACTIVITY_PAGE_SIZE;
  const requested = Math.max(1, opts.page);
  const q = opts.q.trim();
  const base = pageVisitMatch({
    from: opts.from,
    to: opts.to,
    country: opts.country,
    device: opts.device,
    source: opts.source,
  });
  const filter: PageVisitFilter =
    q.length > 0
      ? { $and: [base, { path: { $regex: escapeRegex(q), $options: "i" } }] }
      : base;

  const total = await PageVisit.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requested, totalPages);

  const docs = await PageVisit.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .select("path country device createdAt")
    .lean();

  const rows: RecentVisitRow[] = docs.map((d) => {
    const x = d as { path: string; country: string; device: string; createdAt: Date };
    return {
      path: x.path,
      country: countryLabel(x.country),
      device: x.device,
      createdAt: x.createdAt,
    };
  });

  return { rows, total, page };
}

async function getDailyVisitsInRange(
  fromIso: string,
  toIso: string,
  country: string,
  device: string,
  source: string
): Promise<DailyVisitRow[]> {
  const labels = utcDaysInclusive(fromIso, toIso);
  const match = pageVisitMatch({ from: fromIso, to: toIso, country, device, source });

  const raw = await PageVisit.aggregate<{ _id: string; count: number }>([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(raw.map((r) => [r._id, r.count]));
  return labels.map((day) => ({ day, count: map.get(day) ?? 0 }));
}

/** UTC daily counts for one `AnalyticsEvent.name` (date range only; no country/device). */
export async function getDailyEventsInRange(
  fromIso: string,
  toIso: string,
  eventName: string
): Promise<DailyVisitRow[]> {
  await dbConnect();
  const labels = utcDaysInclusive(fromIso, toIso);
  const start = new Date(`${fromIso}T00:00:00.000Z`);
  const endExclusive = new Date(`${addUtcDays(toIso, 1)}T00:00:00.000Z`);
  const match = { name: eventName, createdAt: { $gte: start, $lt: endExclusive } };

  const raw = await AnalyticsEvent.aggregate<{ _id: string; count: number }>([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(raw.map((r) => [r._id, r.count]));
  return labels.map((day) => ({ day, count: map.get(day) ?? 0 }));
}

/** Chart rows: visits reuse snapshot series; clicks/submits load events by day (date-only). */
export async function getDailyChartRows(opts: {
  metric: AnalyticsChartMetric;
  from: string;
  to: string;
  visitsRows: DailyVisitRow[];
}): Promise<DailyVisitRow[]> {
  if (opts.metric === "visits") return opts.visitsRows;
  const name =
    opts.metric === "clicks"
      ? FUNNEL_EVENTS.clickContact
      : FUNNEL_EVENTS.contactSubmit;
  return getDailyEventsInRange(opts.from, opts.to, name);
}

function insightNotes(
  totalVisits: number,
  topPages: TopRow[],
  funnel: AnalyticsSnapshot["funnel"]
): string[] {
  const n: string[] = [];
  const { visits, clickContact, contactSubmit } = funnel;
  if (visits >= 15 && clickContact < Math.max(1, visits * 0.04)) {
    n.push(
      "Low clicks on contact relative to homepage visits—try clearer CTAs or placement."
    );
  }
  const top = topPages[0];
  if (
    totalVisits >= 20 &&
    top?.label.split("?")[0] === "/" &&
    top.count / totalVisits >= 0.55
  ) {
    n.push(
      "Users mostly stay on the homepage—surface key inner pages in nav and content."
    );
  }
  if (clickContact >= 6 && contactSubmit < clickContact * 0.2) {
    n.push(
      "Contact clicks don’t all become submissions—check form friction or mobile UX."
    );
  }
  return n;
}

export async function getAnalyticsSnapshot(opts: {
  from: string;
  to: string;
  country: string;
  device: string;
  source: string;
}): Promise<AnalyticsSnapshot> {
  await dbConnect();
  const { from, to, country, device, source } = opts;
  const pv = pageVisitMatch({ from, to, country, device, source });
  const time = visitCreatedAtRange(from, to);
  const { from: prevFrom, to: prevTo } = previousPeriodFromTo(from, to);

  const [
    totalVisits,
    topPagesRaw,
    topCountriesRaw,
    devicesRaw,
    trafficSourcesRaw,
    totalContactMessages,
    previousKpi,
    dailyVisits,
    funnelVisits,
    funnelClickContact,
    funnelContactSubmit,
  ] = await Promise.all([
    PageVisit.countDocuments(pv),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $match: pv },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $match: pv },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $match: pv },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $match: pv },
      {
        $group: {
          _id: { $ifNull: ["$source", "direct"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    ContactMessage.countDocuments(time),
    queryAnalyticsKpiMetrics({ from: prevFrom, to: prevTo, country, device, source }),
    getDailyVisitsInRange(from, to, country, device, source),
    AnalyticsEvent.countDocuments({ name: FUNNEL_EVENTS.visitHomepage, ...time }),
    AnalyticsEvent.countDocuments({ name: FUNNEL_EVENTS.clickContact, ...time }),
    AnalyticsEvent.countDocuments({ name: FUNNEL_EVENTS.contactSubmit, ...time }),
  ]);

  const mapRows = (rows: { _id: string; count: number }[]): TopRow[] =>
    rows.map((r) => ({ label: r._id || "—", count: r.count }));

  const conversionRatePercent = kpiConversionRate(totalVisits, totalContactMessages);

  const currentKpi: AnalyticsKpiMetrics = {
    visits: totalVisits,
    messages: totalContactMessages,
    conversion: conversionRatePercent,
  };
  const kpiCompare: AnalyticsKpiCompare = {
    current: currentKpi,
    previous: previousKpi,
    visitsChangePercent: kpiCountChangePercent(currentKpi.visits, previousKpi.visits),
    messagesChangePercent: kpiCountChangePercent(currentKpi.messages, previousKpi.messages),
    conversionChangePercent: kpiConversionChangePercent(
      currentKpi.conversion,
      previousKpi.conversion
    ),
  };

  const topPages = mapRows(topPagesRaw);
  const funnel = {
    visits: funnelVisits,
    clickContact: funnelClickContact,
    contactSubmit: funnelContactSubmit,
  };

  return {
    totalVisits,
    topPages,
    topCountries: topCountriesRaw.map((r) => ({
      label: countryLabel(r._id),
      count: r.count,
      filterKey: r._id || "",
    })),
    devices: mapRows(devicesRaw).map((r) => ({
      ...r,
      filterKey: (r.label || "").toLowerCase(),
    })),
    trafficSources: mapRows(trafficSourcesRaw).map((r) => ({
      ...r,
      filterKey: r.label,
    })),
    totalContactMessages,
    conversionRatePercent,
    kpiCompare,
    dailyVisits,
    funnel,
    insights: insightNotes(totalVisits, topPages, funnel),
  };
}
