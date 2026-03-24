import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
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
 * PUT /api/site-settings — replace navigation (admin only).
 * Body: { navigation: NavItem[] }
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

    if (!body || typeof body !== "object" || !("navigation" in body)) {
      return NextResponse.json(
        { error: "Expected JSON object with \"navigation\" array" },
        { status: 400 }
      );
    }

    const navigation = parseNavigationPayload(
      (body as { navigation: unknown }).navigation
    );

    await dbConnect();
    await SiteSettings.findOneAndUpdate(
      {},
      { $set: { navigation } },
      { upsert: true, new: true }
    );

    try {
      revalidatePath("/");
      revalidatePath("/admin/site-settings");
      revalidatePath("/admin/site-settings/navigation");
      revalidatePath("/blog");
      revalidatePath("/portfolio");
    } catch (revalErr) {
      console.warn("revalidatePath after PUT /api/site-settings:", revalErr);
    }

    return NextResponse.json({ success: true, navigation });
  } catch (e) {
    console.error("PUT /api/site-settings:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save navigation" },
      { status: 500 }
    );
  }
}
