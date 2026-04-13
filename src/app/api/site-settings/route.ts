import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { logAdminAction } from "@/lib/audit-log";
import { getAdminActorIdFromRequest } from "@/lib/get-admin-actor";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { parseFooterColumnsPayload } from "@/lib/footer-links";
import {
  getDefaultNavigation,
  navigationPersistedShapeChanged,
  normalizeNavigationInput,
  parseNavigationPayload,
} from "@/lib/navigation";

/**
 * GET /api/site-settings — public navigation payload.
 * Seeds default navigation in DB when a site document exists but navigation is empty.
 */
export async function GET() {
  try {
    await dbConnect();
    const doc = await SiteSettings.findOne().lean();
    if (!doc) {
      return NextResponse.json({ navigation: getDefaultNavigation() });
    }
    const raw = (doc as { navigation?: unknown }).navigation;
    if (!Array.isArray(raw) || raw.length === 0) {
      const defaults = getDefaultNavigation();
      await SiteSettings.updateOne({ _id: doc._id }, { $set: { navigation: defaults } });
      return NextResponse.json({ navigation: defaults });
    }
    const navigation = normalizeNavigationInput(raw);
    if (navigationPersistedShapeChanged(raw)) {
      await SiteSettings.updateOne({ _id: doc._id }, { $set: { navigation } });
    }
    return NextResponse.json({ navigation });
  } catch (e) {
    console.error("GET /api/site-settings:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load navigation" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/site-settings — admin only.
 * Body: `{ navigation: NavItem[] }` and/or `{ footerColumns: FooterColumn[] }` (at least one).
 */
export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const hasNav = "navigation" in b;
    const hasFooter = "footerColumns" in b;
    if (!hasNav && !hasFooter) {
      return NextResponse.json(
        { error: 'Expected \"navigation\" and/or \"footerColumns\"' },
        { status: 400 }
      );
    }

    await dbConnect();
    const $set: Record<string, unknown> = {};

    if (hasFooter) {
      try {
        $set.footerColumns = parseFooterColumnsPayload(b.footerColumns);
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Invalid footer columns" },
          { status: 400 }
        );
      }
    }

    if (hasNav) {
      try {
        $set.navigation = parseNavigationPayload(b.navigation);
      } catch (e) {
        return NextResponse.json(
          { error: e instanceof Error ? e.message : "Invalid navigation" },
          { status: 400 }
        );
      }
    }

    await SiteSettings.findOneAndUpdate({}, { $set }, { upsert: true, new: true });

    try {
      revalidatePath("/");
      revalidatePath("/admin/site-settings");
      revalidatePath("/admin/site-settings/navigation");
      revalidatePath("/admin/site-settings/footer");
      revalidatePath("/blog");
      revalidatePath("/portfolio");
    } catch (revalErr) {
      console.warn("revalidatePath after PUT /api/site-settings:", revalErr);
    }

    const actorId = await getAdminActorIdFromRequest(request);
    if (actorId) {
      if (hasNav && $set.navigation) {
        await logAdminAction({
          actorId,
          action: "UPDATE_NAVIGATION",
          resource: "site-settings",
          request,
          metadata: { itemCount: ($set.navigation as { length: number }).length },
        });
      }
      if (hasFooter && $set.footerColumns) {
        const fc = $set.footerColumns as Array<{ links: unknown[] }>;
        await logAdminAction({
          actorId,
          action: "UPDATE_FOOTER_LINKS",
          resource: "site-settings",
          request,
          metadata: {
            columnCount: fc.length,
            linkCount: fc.reduce((n, c) => n + (Array.isArray(c.links) ? c.links.length : 0), 0),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...(hasNav ? { navigation: $set.navigation } : {}),
      ...(hasFooter ? { footerColumns: $set.footerColumns } : {}),
    });
  } catch (e) {
    console.error("PUT /api/site-settings:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save site settings" },
      { status: 500 }
    );
  }
}
