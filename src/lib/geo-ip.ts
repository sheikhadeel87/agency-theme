/** Map IPv4-mapped IPv6 (::ffff:x.x.x.x) to IPv4 for geo + private checks. */
export function normalizeIp(ip: string): string {
  const t = ip.trim();
  return t.startsWith("::ffff:") ? t.slice(7) : t;
}

/** Client IP from proxy headers (first routable/public hop in XFF). */
export function getClientIp(h: Headers): string | null {
  const xf = h.get("x-forwarded-for");
  if (xf) {
    for (const part of xf.split(",")) {
      const ip = normalizeIp(part);
      if (ip && !isNonRoutableIp(ip)) return ip;
    }
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) {
    const ip = normalizeIp(real);
    if (ip && !isNonRoutableIp(ip)) return ip;
  }
  return null;
}

export function isNonRoutableIp(ip: string): boolean {
  const n = normalizeIp(ip);
  if (n === "::1" || n === "127.0.0.1") return true;
  if (n.startsWith("10.")) return true;
  if (n.startsWith("192.168.")) return true;
  if (n.startsWith("169.254.")) return true;
  if (n.startsWith("172.")) {
    const seg = Number(n.split(".")[1]);
    if (seg >= 16 && seg <= 31) return true;
  }
  return false;
}

/** ipapi.co — free tier, no key for basic country code. */
export async function fetchCountryCodeForIp(ip: string): Promise<string | null> {
  const ipUse = normalizeIp(ip);
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ipUse)}/country_code/`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    if (text.length === 2 && /^[A-Za-z]{2}$/.test(text)) return text.toUpperCase();
  } catch {
    /* ignore */
  }
  return null;
}
