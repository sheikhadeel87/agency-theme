import { NextResponse } from "next/server";
import { deleteNewsletterSubscriberForAdmin } from "@/controllers/newsletter-controller";
import { verifyAdminApiAuth } from "@/lib/admin-api-auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminApiAuth(request))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const r = await deleteNewsletterSubscriberForAdmin(id);
  if (!r.ok) {
    const status = r.message.includes("not found") ? 404 : 400;
    return NextResponse.json({ success: false, message: r.message }, { status });
  }
  return NextResponse.json({ success: true });
}
