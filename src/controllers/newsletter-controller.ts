import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { getClientIp } from "@/lib/geo-ip";
import { isNewsletterCheckRateLimited, isNewsletterSubscribeRateLimited } from "@/lib/newsletter-rate-limit";
import { Newsletter } from "@/models/Newsletter";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeNewsletterSuccess = {
  status: 201;
  body: { success: true; message: string };
};

export type SubscribeNewsletterDuplicate = {
  status: 409;
  body: { success: false; message: string };
};

export type SubscribeNewsletterError = {
  status: 400 | 429 | 500;
  body: { success: false; message: string };
};

export type SubscribeNewsletterResult =
  | SubscribeNewsletterSuccess
  | SubscribeNewsletterDuplicate
  | SubscribeNewsletterError;

function clientKeyFromRequest(request: Request): string {
  return getClientIp(request.headers) ?? "unknown";
}

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 320) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

/**
 * Validates email, applies rate limit, persists new subscriber or reports duplicate.
 */
export async function subscribeNewsletter(request: Request): Promise<SubscribeNewsletterResult> {
  const key = clientKeyFromRequest(request);
  if (isNewsletterSubscribeRateLimited(key)) {
    return {
      status: 429,
      body: {
        success: false,
        message: "Too many subscription attempts. Please try again later.",
      },
    };
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return { status: 400, body: { success: false, message: "Invalid JSON body." } };
  }

  const body = payload as { email?: unknown };
  const email = normalizeEmail(body?.email);
  if (!email) {
    return {
      status: 400,
      body: { success: false, message: "A valid email address is required." },
    };
  }

  try {
    await dbConnect();
    const existing = await Newsletter.findOne({ email }).lean();
    if (existing) {
      return {
        status: 409,
        body: { success: false, message: "Email already subscribed" },
      };
    }

    await Newsletter.create({ email });
    return {
      status: 201,
      body: { success: true, message: "You are subscribed. Thank you!" },
    };
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code?: number }).code : undefined;
    if (code === 11000) {
      return {
        status: 409,
        body: { success: false, message: "Email already subscribed" },
      };
    }
    console.error("subscribeNewsletter:", e);
    return {
      status: 500,
      body: { success: false, message: "Could not save your subscription. Please try again later." },
    };
  }
}

export type CheckNewsletterResult =
  | { status: 200; body: { subscribed: boolean } }
  | { status: 400 | 429 | 500; body: { success: false; message: string } };

/** GET ?email= — for debounced UI check (rate-limited; enables light email enumeration). */
export async function checkNewsletterSubscription(request: Request): Promise<CheckNewsletterResult> {
  const key = clientKeyFromRequest(request);
  if (isNewsletterCheckRateLimited(key)) {
    return {
      status: 429,
      body: { success: false, message: "Too many checks. Try again shortly." },
    };
  }

  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("email"));
  if (!email) {
    return { status: 400, body: { success: false, message: "Invalid or missing email." } };
  }

  try {
    await dbConnect();
    const existing = await Newsletter.findOne({ email }).select("_id").lean();
    return { status: 200, body: { subscribed: Boolean(existing) } };
  } catch (e) {
    console.error("checkNewsletterSubscription:", e);
    return {
      status: 500,
      body: { success: false, message: "Could not verify email." },
    };
  }
}

export type NewsletterAdminRow = { id: string; email: string; createdAt: string };

export async function listNewsletterSubscribersForAdmin(): Promise<
  { ok: true; items: NewsletterAdminRow[] } | { ok: false; message: string }
> {
  try {
    await dbConnect();
    const docs = await Newsletter.find({})
      .sort({ createdAt: -1 })
      .select("email createdAt")
      .lean();
    const items: NewsletterAdminRow[] = docs.map((d) => ({
      id: String(d._id),
      email: d.email,
      createdAt: (d.createdAt instanceof Date ? d.createdAt : new Date(String(d.createdAt))).toISOString(),
    }));
    return { ok: true, items };
  } catch (e) {
    console.error("listNewsletterSubscribersForAdmin:", e);
    return { ok: false, message: "Could not load subscribers." };
  }
}

export async function deleteNewsletterSubscriberForAdmin(
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, message: "Invalid subscriber id." };
  }
  try {
    await dbConnect();
    const res = await Newsletter.findByIdAndDelete(id).lean();
    if (!res) return { ok: false, message: "Subscriber not found." };
    return { ok: true };
  } catch (e) {
    console.error("deleteNewsletterSubscriberForAdmin:", e);
    return { ok: false, message: "Could not delete subscriber." };
  }
}
