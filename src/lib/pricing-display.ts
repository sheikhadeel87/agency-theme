export const PRICING_MAX_AMOUNT = 1_000_000;

export function sanitizePlanPrice(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0 || value > PRICING_MAX_AMOUNT) return 0;
    return Math.round(value * 100) / 100;
  }
  const s = String(value).replace(/,/g, "").trim();
  if (!s) return 0;
  if (/e/i.test(s)) return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0 || n > PRICING_MAX_AMOUNT) return 0;
  return Math.round(n * 100) / 100;
}

export function formatPlanPriceForDisplay(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    useGrouping: false,
  }).format(amount);
}
