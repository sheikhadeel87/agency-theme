/**
 * URL / search-param helpers for audit logs — safe to import from Client Components (no Mongoose).
 */

export const ADMIN_AUDIT_LOG_PAGE_SIZE = 20;

export type ParsedAuditLogQuery = {
  page: number;
  q: string;
  user: string;
  action: string;
  resource: string;
  dateFrom: string;
  dateTo: string;
  quick: "" | "today" | "7d" | "30d";
  sort: "asc" | "desc";
};

export type AdminAuditLogFilterOptions = {
  actions: string[];
  resources: string[];
};

export function parseAdminAuditLogSearchParams(
  sp: Record<string, string | string[] | undefined>
): ParsedAuditLogQuery {
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Math.max(1, Number(g("page")) || 1);
  const sort = g("sort") === "asc" ? "asc" : "desc";
  const quickRaw = (g("quick") ?? "").trim();
  const quick =
    quickRaw === "today" || quickRaw === "7d" || quickRaw === "30d"
      ? quickRaw
      : ("" as const);

  return {
    page,
    q: (g("q") ?? "").trim(),
    user: (g("user") ?? "").trim(),
    action: (g("action") ?? "").trim(),
    resource: (g("resource") ?? "").trim(),
    dateFrom: (g("dateFrom") ?? "").trim(),
    dateTo: (g("dateTo") ?? "").trim(),
    quick,
    sort,
  };
}

export function hasActiveAuditFilters(p: ParsedAuditLogQuery): boolean {
  return Boolean(
    p.q ||
      p.user ||
      p.action ||
      p.resource ||
      p.dateFrom ||
      p.dateTo ||
      p.quick ||
      p.sort !== "desc"
  );
}

export function adminAuditLogsQueryString(
  q: ParsedAuditLogQuery,
  overrides?: Partial<ParsedAuditLogQuery>
): string {
  const m = { ...q, ...overrides };
  const p = new URLSearchParams();
  if (m.q) p.set("q", m.q);
  if (m.user) p.set("user", m.user);
  if (m.action) p.set("action", m.action);
  if (m.resource) p.set("resource", m.resource);
  if (m.dateFrom) p.set("dateFrom", m.dateFrom);
  if (m.dateTo) p.set("dateTo", m.dateTo);
  if (m.quick) p.set("quick", m.quick);
  if (m.sort !== "desc") p.set("sort", m.sort);
  if (m.page > 1) p.set("page", String(m.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}
