import { NextResponse } from "next/server";
import { deleteNewsletterSubscriberForAdmin } from "@/controllers/newsletter-controller";
import { logAdminAction } from "@/lib/audit-log";
import { verifyAdminApiAuth } from "@/lib/admin-api-auth";
import { getAdminActorIdFromRequest } from "@/lib/get-admin-actor";

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
  const actorId = await getAdminActorIdFromRequest(request);
  if (actorId) {
    await logAdminAction({
      actorId,
      action: "DELETE_NEWSLETTER_SUBSCRIBER",
      resource: "newsletter",
      resourceId: id,
      request,
    });
  }
  return NextResponse.json({ success: true });
}
