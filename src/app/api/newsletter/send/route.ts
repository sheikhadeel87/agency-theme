import { NextResponse } from "next/server";
import { sendNewsletterBroadcast } from "@/controllers/newsletter-controller";
import { verifyAdminApiAuth } from "@/lib/admin-api-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await verifyAdminApiAuth(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as { subject?: unknown; message?: unknown; emails?: unknown };
  const subject = typeof b.subject === "string" ? b.subject : "";
  const message = typeof b.message === "string" ? b.message : "";

  let emails: string[] | undefined;
  if (b.emails !== undefined && b.emails !== null) {
    if (!Array.isArray(b.emails)) {
      return NextResponse.json(
        { success: false, message: "Field \"emails\" must be an array of strings." },
        { status: 400 }
      );
    }
    emails = b.emails.filter((x): x is string => typeof x === "string");
  }

  const result = await sendNewsletterBroadcast(subject, message, emails);

  if (!result.ok) {
    const msg = result.message;
    const status =
      msg.includes("not configured") ? 503
      : msg.includes("No subscribers") || msg.includes("Select at least") || msg.includes("None of the") || msg.includes("No valid") || msg.includes("required") || msg.includes("too long")
        ? 400
        : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }

  return NextResponse.json({
    success: true,
    sent: result.sent,
    failed: result.failed,
  });
}
