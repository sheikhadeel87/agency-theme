import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { submitContactSubmission } from "@/lib/contact-submission";

export const dynamic = "force-dynamic";

type Body = {
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  /** Legacy: same as fullName */
  name?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const fullName = (body.fullName ?? body.name ?? "").trim();
  const result = await submitContactSubmission({
    fullName,
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    subject: String(body.subject ?? ""),
    message: String(body.message ?? ""),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status ?? 400 }
    );
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/contact-messages");

  return NextResponse.json({
    ok: true,
    id: result.id,
    emailSent: result.emailSent,
    ...(result.emailError ? { emailError: result.emailError } : {}),
  });
}
