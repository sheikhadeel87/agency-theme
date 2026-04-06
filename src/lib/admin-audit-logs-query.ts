import { buildAuditDescription, formatAuditActorDisplay } from "@/lib/audit-description";
import {
  ADMIN_AUDIT_LOG_PAGE_SIZE,
  type AdminAuditLogFilterOptions,
  type ParsedAuditLogQuery,
} from "@/lib/admin-audit-logs-params";
import { dbConnect } from "@/lib/db";
import { AdminAuditLog } from "@/models/AdminAuditLog";
import { AdminUser } from "@/models/AdminUser";

export type { AdminAuditLogFilterOptions, ParsedAuditLogQuery } from "@/lib/admin-audit-logs-params";
export { ADMIN_AUDIT_LOG_PAGE_SIZE, adminAuditLogsQueryString, hasActiveAuditFilters, parseAdminAuditLogSearchParams } from "@/lib/admin-audit-logs-params";

export type AdminAuditLogListItem = {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  createdAt: string;
  actorLabel: string;
};

export type AdminAuditLogsPageResult = {
  items: AdminAuditLogListItem[];
  page: number;
  total: number;
  totalPages: number;
};

type PopulatedActor = { name?: string; email?: string } | null;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function actorNameEmail(actor: unknown): { name?: string; email?: string } {
  if (!actor || typeof actor !== "object") return {};
  const a = actor as PopulatedActor;
  return { name: a?.name?.trim(), email: a?.email?.trim() };
}

function actorUserColumnLabel(name?: string, email?: string): string {
  if (name) return name;
  if (email) return email;
  return "Unknown user";
}

function startOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function resolveCreatedAtRange(parsed: ParsedAuditLogQuery): { from: Date; to: Date } | null {
  const now = new Date();
  const hasExplicit = Boolean(parsed.dateFrom || parsed.dateTo);

  if (hasExplicit) {
    let from: Date | undefined;
    let to: Date | undefined;
    if (parsed.dateFrom) {
      const d = new Date(parsed.dateFrom);
      if (!Number.isNaN(d.getTime())) from = startOfUtcDay(d);
    }
    if (parsed.dateTo) {
      const d = new Date(parsed.dateTo);
      if (!Number.isNaN(d.getTime())) to = endOfUtcDay(d);
    }
    if (from && to) return from <= to ? { from, to } : { from: to, to: from };
    if (from) return { from, to: now };
    if (to) return { from: new Date(0), to };
    return null;
  }

  if (parsed.quick === "today") {
    return { from: startOfUtcDay(now), to: endOfUtcDay(now) };
  }
  if (parsed.quick === "7d") {
    return { from: new Date(now.getTime() - 7 * 86400000), to: now };
  }
  if (parsed.quick === "30d") {
    return { from: new Date(now.getTime() - 30 * 86400000), to: now };
  }
  return null;
}

async function buildAuditMatch(parsed: ParsedAuditLogQuery): Promise<Record<string, unknown>> {
  const match: Record<string, unknown> = {};

  const userQ = parsed.user.trim();
  if (userQ) {
    const re = new RegExp(escapeRegex(userQ), "i");
    const users = await AdminUser.find({
      $or: [{ name: re }, { email: re }],
    })
      .select("_id")
      .lean();
    const ids = users.map((u) => u._id);
    match.actorId = { $in: ids.length ? ids : [] };
  }

  const action = parsed.action.trim();
  if (action) {
    match.action = new RegExp(`^${escapeRegex(action)}$`, "i");
  }

  const resource = parsed.resource.trim();
  if (resource) {
    match.resource = new RegExp(`^${escapeRegex(resource)}$`, "i");
  }

  const descQ = parsed.q.trim();
  if (descQ) {
    match.description = new RegExp(escapeRegex(descQ), "i");
  }

  const range = resolveCreatedAtRange(parsed);
  if (range) {
    match.createdAt = { $gte: range.from, $lte: range.to };
  }

  return match;
}

export async function getAdminAuditLogFilterOptions(): Promise<AdminAuditLogFilterOptions> {
  await dbConnect();
  const [actions, resources] = await Promise.all([
    AdminAuditLog.distinct("action"),
    AdminAuditLog.distinct("resource"),
  ]);
  return {
    actions: (actions as string[]).filter(Boolean).sort(),
    resources: (resources as string[]).filter(Boolean).sort(),
  };
}

export async function getAdminAuditLogsPage(
  parsed: ParsedAuditLogQuery
): Promise<AdminAuditLogsPageResult> {
  await dbConnect();
  const match = await buildAuditMatch(parsed);
  const sortDir = parsed.sort === "asc" ? 1 : -1;

  const total = await AdminAuditLog.countDocuments(match);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_AUDIT_LOG_PAGE_SIZE));
  const page = Math.min(Math.max(1, parsed.page), totalPages);
  const skip = (page - 1) * ADMIN_AUDIT_LOG_PAGE_SIZE;

  const docs = await AdminAuditLog.find(match)
    .sort({ createdAt: sortDir })
    .skip(skip)
    .limit(ADMIN_AUDIT_LOG_PAGE_SIZE)
    .populate("actorId", "name email")
    .lean();

  const items: AdminAuditLogListItem[] = docs.map((d) => {
    const row = d as {
      _id: unknown;
      action?: string;
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      createdAt?: Date;
      actorId?: unknown;
    };
    const { name, email } = actorNameEmail(row.actorId);
    const actorForDescription = formatAuditActorDisplay(name, email);
    return {
      id: String(row._id),
      action: row.action ?? "",
      resource: row.resource ?? "",
      resourceId: row.resourceId,
      description: buildAuditDescription(
        row.action ?? "",
        row.resource ?? "",
        row.resourceId,
        row.metadata,
        actorForDescription
      ),
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
      actorLabel: actorUserColumnLabel(name, email),
    };
  });

  return {
    items,
    page,
    total,
    totalPages,
  };
}
