import { headers } from "next/headers";
import { buildAuditDescription, formatAuditActorDisplay } from "@/lib/audit-description";
import { dbConnect } from "@/lib/db";
import { getAdminActorIdFromSession } from "@/lib/get-admin-actor";
import { AdminAuditLog } from "@/models/AdminAuditLog";
import { AdminUser } from "@/models/AdminUser";
import type { Types } from "mongoose";

export type LogAdminActionParams = {
  actorId: string | Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  /** When omitted, `ip` / `userAgent` are not set. */
  request?: Request | null;
  /** Server actions: pass `(name) => (await headers()).get(name)` */
  getHeader?: (name: string) => string | null | undefined;
};

function clientIpFromGetter(
  get: (name: string) => string | null | undefined | void
): string | undefined {
  const forwarded = get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return undefined;
}

function clientIpFromRequest(request: Request): string | undefined {
  return clientIpFromGetter((n) => request.headers.get(n));
}

/**
 * Persists one admin audit row. Swallows errors so callers are not broken if logging fails.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    await dbConnect();
    let ip: string | undefined;
    let userAgent: string | undefined;
    if (params.request) {
      ip = clientIpFromRequest(params.request);
      const rawUa = params.request.headers.get("user-agent");
      userAgent =
        rawUa && rawUa.length > 2000 ? `${rawUa.slice(0, 1997)}...` : rawUa || undefined;
    } else if (params.getHeader) {
      const g = params.getHeader;
      ip = clientIpFromGetter(g);
      const rawUa = g("user-agent");
      userAgent =
        rawUa && rawUa.length > 2000 ? `${rawUa.slice(0, 1997)}...` : rawUa || undefined;
    }

    const user = await AdminUser.findById(params.actorId).select("email name").lean();
    const u = user as { email?: string; name?: string } | null;
    const actorDisplay = formatAuditActorDisplay(u?.name, u?.email);

    const description = buildAuditDescription(
      params.action,
      params.resource,
      params.resourceId,
      params.metadata,
      actorDisplay
    );

    await AdminAuditLog.create({
      actorId: params.actorId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      description,
      metadata: params.metadata,
      ip,
      userAgent,
    });
  } catch (e) {
    console.error("logAdminAction:", e);
  }
}

/** Server actions: resolves actor from session; skips if env-only login (no actor id in cookie). */
export async function recordAdminAudit(fields: {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const actorId = await getAdminActorIdFromSession();
  if (!actorId) return;
  const h = await headers();
  await logAdminAction({
    actorId,
    action: fields.action,
    resource: fields.resource,
    resourceId: fields.resourceId,
    metadata: fields.metadata,
    getHeader: (name) => h.get(name),
  });
}
