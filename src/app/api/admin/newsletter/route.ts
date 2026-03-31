import { NextResponse } from "next/server";
import {
  listNewsletterSubscribersForAdmin,
} from "@/controllers/newsletter-controller";
import { verifyAdminApiAuth } from "@/lib/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await verifyAdminApiAuth(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const r = await listNewsletterSubscribersForAdmin();
  if (!r.ok) {
    return NextResponse.json({ success: false, message: r.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, items: r.items, total: r.items.length });
}
