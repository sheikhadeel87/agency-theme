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
  turnstileToken?: string;
  /** Legacy: same as fullName */
  name?: string;
};

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("Turnstile siteverify request failed:", e);
    return false;
  }
}

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

  const turnstileToken = String(body.turnstileToken ?? "").trim();
  if (process.env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstileToken(turnstileToken);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }
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
