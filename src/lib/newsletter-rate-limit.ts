/** In-memory sliding window (per server instance). Use Redis/Upstash at scale. */
const buckets = new Map<string, number[]>();

/** @returns true if this key is over the limit (should reject request). */
export function slidingWindowRateLimited(
  bucketKey: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = buckets.get(bucketKey) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(bucketKey, recent);
    return true;
  }
  recent.push(now);
  buckets.set(bucketKey, recent);
  return false;
}

export function isNewsletterSubscribeRateLimited(clientKey: string): boolean {
  return slidingWindowRateLimited(`newsletter:sub:${clientKey}`, 8, 15 * 60 * 1000);
}

export function isNewsletterCheckRateLimited(clientKey: string): boolean {
  return slidingWindowRateLimited(`newsletter:chk:${clientKey}`, 60, 15 * 60 * 1000);
}
