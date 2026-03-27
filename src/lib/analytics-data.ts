import { dbConnect } from "@/lib/db";
import { FUNNEL_EVENTS } from "@/lib/track-event";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { ContactMessage } from "@/models/ContactMessage";
import { PageVisit } from "@/models/PageVisit";

export type TopRow = { label: string; count: number };

export type DailyVisitRow = { day: string; count: number };

export type RecentVisitRow = {
  path: string;
  country: string;
  device: string;
  createdAt: Date;
};

export type AnalyticsSnapshot = {
  totalVisits: number;
  topPages: TopRow[];
  topCountries: TopRow[];
  devices: TopRow[];
  trafficSources: TopRow[];
  recentActivity: RecentVisitRow[];
  totalContactMessages: number;
  /** contact messages ÷ total visits × 100; null if there are no visits. */
  conversionRatePercent: number | null;
  /** Last 14 calendar days (UTC), including zeros. */
  dailyVisits: DailyVisitRow[];
  /** Funnel event rows (`AnalyticsEvent` by name), all time. */
  funnel: {
    visits: number;
    clickContact: number;
    contactSubmit: number;
  };
  /** Short heuristic notes for the dashboard. */
  insights: string[];
};

const DAILY_CHART_DAYS = 14;

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

async function getDailyVisitsUtc(days: number): Promise<DailyVisitRow[]> {
  const labels = lastNDaysUtcIso(days);
  const start = new Date(`${labels[0]}T00:00:00.000Z`);

  const raw = await PageVisit.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: start } } },
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

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  await dbConnect();

  const [
    totalVisits,
    topPagesRaw,
    topCountriesRaw,
    devicesRaw,
    trafficSourcesRaw,
    recentDocs,
    totalContactMessages,
    dailyVisits,
    funnelVisits,
    funnelClickContact,
    funnelContactSubmit,
  ] = await Promise.all([
    PageVisit.countDocuments(),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    PageVisit.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    PageVisit.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: { $ifNull: ["$source", "direct"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    PageVisit.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("path country device createdAt")
      .lean(),
    ContactMessage.countDocuments(),
    getDailyVisitsUtc(DAILY_CHART_DAYS),
    AnalyticsEvent.countDocuments({ name: FUNNEL_EVENTS.visitHomepage }),
    AnalyticsEvent.countDocuments({ name: FUNNEL_EVENTS.clickContact }),
    AnalyticsEvent.countDocuments({ name: FUNNEL_EVENTS.contactSubmit }),
  ]);

  const mapRows = (rows: { _id: string; count: number }[]): TopRow[] =>
    rows.map((r) => ({ label: r._id || "—", count: r.count }));

  const countryLabel = (code: string): string => {
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
  };

  const recentActivity: RecentVisitRow[] = recentDocs.map((d) => {
    const x = d as {
      path: string;
      country: string;
      device: string;
      createdAt: Date;
    };
    return {
      path: x.path,
      country: countryLabel(x.country),
      device: x.device,
      createdAt: x.createdAt,
    };
  });

  const conversionRatePercent =
    totalVisits === 0 ? null : (totalContactMessages / totalVisits) * 100;

  const topPages = mapRows(topPagesRaw);
  const funnel = {
    visits: funnelVisits,
    clickContact: funnelClickContact,
    contactSubmit: funnelContactSubmit,
  };

  return {
    totalVisits,
    topPages,
    topCountries: mapRows(topCountriesRaw).map((r) => ({
      ...r,
      label: countryLabel(r.label),
    })),
    devices: mapRows(devicesRaw),
    trafficSources: mapRows(trafficSourcesRaw),
    recentActivity,
    totalContactMessages,
    conversionRatePercent,
    dailyVisits,
    funnel,
    insights: insightNotes(totalVisits, topPages, funnel),
  };
}
