import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { fetchCountryCodeForIp, getClientIp } from "@/lib/geo-ip";
import { normalizeTrafficSource } from "@/lib/traffic-source";
import { PageVisit } from "@/models/PageVisit";

export const dynamic = "force-dynamic";

/** ISO country code from common edge/CDN/proxy headers (first match wins). */
const COUNTRY_HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-amz-cf-ipcountry",
  "fastly-geo-country-code",
  "fly-client-country",
  "x-country-code",
  "x-appengine-country",
] as const;

function countryFromHeaders(h: Headers): string {
  for (const key of COUNTRY_HEADER_KEYS) {
    const v = h.get(key)?.trim();
    if (v) return v;
  }
  return "Unknown";
}

function deviceFromUA(ua: string | null): string {
  if (!ua) return "unknown";
  return /Mobile|Android|iPhone|iPad|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    ? "mobile"
    : "desktop";
}

export async function POST(request: Request) {
  let path = "/";
  let referrer: string | undefined;
  try {
    const body = (await request.json()) as { path?: unknown; referrer?: unknown };
    if (typeof body?.path === "string" && body.path.startsWith("/")) {
      path = body.path.slice(0, 500);
    }
    if (typeof body?.referrer === "string" && body.referrer.length <= 2000) {
      referrer = body.referrer;
    }
  } catch {
    // ignore invalid body
  }

  const h = request.headers;
  let country = countryFromHeaders(h);
  if (country === "Unknown") {
    const ip = getClientIp(h);
    if (ip) {
      const fromApi = await fetchCountryCodeForIp(ip);
      if (fromApi) country = fromApi;
    }
  }
  if (country === "Unknown" && process.env.NODE_ENV === "development") {
    country = "Local dev";
  }

  const device = deviceFromUA(h.get("user-agent"));
  const source = normalizeTrafficSource(referrer);

  try {
    await dbConnect();
    await PageVisit.create({ path, country, device, source });
  } catch (e) {
    console.error("track-visit:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
