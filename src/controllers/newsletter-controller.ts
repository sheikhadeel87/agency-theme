import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { looksLikeHtml, stripHtmlToText } from "@/lib/html-to-text";
import { createMailTransporter, getMailFromUser } from "@/lib/mail-transport";
import { getClientIp } from "@/lib/geo-ip";
import { normalizeNewsletterEmail } from "@/lib/newsletter-email";
import { newsletterSubscribeEmailMiddleware } from "@/lib/newsletter-subscribe-email-middleware";
import { isNewsletterCheckRateLimited, isNewsletterSubscribeRateLimited } from "@/lib/newsletter-rate-limit";
import { Newsletter } from "@/models/Newsletter";

export type SubscribeNewsletterSuccess = {
  status: 201;
  body: { success: true; message: string };
};

export type SubscribeNewsletterDuplicate = {
  status: 409;
  body: { success: false; message: string };
};

export type SubscribeNewsletterError = {
  status: 400 | 429 | 500 | 503;
  body: { success: false; message: string };
};

export type SubscribeNewsletterResult =
  | SubscribeNewsletterSuccess
  | SubscribeNewsletterDuplicate
  | SubscribeNewsletterError;

function clientKeyFromRequest(request: Request): string {
  return getClientIp(request.headers) ?? "unknown";
}

/**
 * Validates email (regex + length), applies rate limit, persists new subscriber or reports duplicate.
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
  const email = normalizeNewsletterEmail(body?.email);
  if (!email) {
    return {
      status: 400,
      body: { success: false, message: "Invalid email" },
    };
  }

  const domainCheck = await newsletterSubscribeEmailMiddleware(email);
  if (!domainCheck.ok) {
    const status: SubscribeNewsletterError["status"] =
      domainCheck.httpStatus === 503 ? 503 : 400;
    return {
      status,
      body: { success: false, message: domainCheck.message },
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
    if (e instanceof mongoose.Error.ValidationError) {
      return {
        status: 400,
        body: { success: false, message: "Invalid email" },
      };
    }
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
  const email = normalizeNewsletterEmail(url.searchParams.get("email"));
  if (!email) {
    return { status: 400, body: { success: false, message: "Invalid email" } };
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Strip scripts / inline handlers from admin HTML before emailing. */
function sanitizeNewsletterHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/**
 * Sends one message per subscriber (sequential). Invalid addresses are skipped and counted as failed.
 * If `explicitEmails` is omitted, uses every address in the Newsletter collection.
 * If provided, only sends to those that exist in the DB (prevents arbitrary recipients).
 */
export async function sendNewsletterBroadcast(
  subjectRaw: string,
  messageRaw: string,
  explicitEmails: string[] | undefined
): Promise<{ ok: true; sent: number; failed: number } | { ok: false; message: string }> {
  const subject = subjectRaw.trim();
  const rawMessage = messageRaw.trim();
  if (!subject || !rawMessage) {
    return { ok: false, message: "Subject and message are required." };
  }
  if (subject.length > 300) {
    return { ok: false, message: "Subject is too long." };
  }
  if (rawMessage.length > 50_000) {
    return { ok: false, message: "Message is too long." };
  }

  const textBody = looksLikeHtml(rawMessage) ? stripHtmlToText(rawMessage) : rawMessage;
  if (!textBody) {
    return { ok: false, message: "Message cannot be empty." };
  }

  const smtpUser = getMailFromUser();
  const transporter = createMailTransporter();
  if (!smtpUser || !transporter) {
    return { ok: false, message: "Email (SMTP) is not configured." };
  }

  await dbConnect();

  let rawList: string[];
  if (explicitEmails === undefined) {
    const docs = await Newsletter.find({}).select("email").lean();
    rawList = docs.map((d) => d.email);
    if (rawList.length === 0) {
      return { ok: false, message: "No subscribers to send to." };
    }
  } else {
    if (explicitEmails.length === 0) {
      return {
        ok: false,
        message: "Select at least one subscriber, or omit the list to send to everyone.",
      };
    }
    const normalized = [
      ...new Set(
        explicitEmails
          .map((e) => normalizeNewsletterEmail(e))
          .filter((e): e is string => e !== null)
      ),
    ];
    if (normalized.length === 0) {
      return { ok: false, message: "No valid email addresses in selection." };
    }
    const inDb = await Newsletter.find({ email: { $in: normalized } })
      .select("email")
      .lean();
    const allowed = new Set(inDb.map((d) => d.email));
    rawList = normalized.filter((e) => allowed.has(e));
    if (rawList.length === 0) {
      return { ok: false, message: "None of the selected addresses are subscribed." };
    }
  }

  const recipients: string[] = [];
  let failedCount = 0;
  const seen = new Set<string>();
  for (const raw of rawList) {
    const addr = normalizeNewsletterEmail(raw);
    if (!addr) {
      failedCount++;
      continue;
    }
    if (seen.has(addr)) continue;
    seen.add(addr);
    recipients.push(addr);
  }

  if (recipients.length === 0) {
    return { ok: false, message: "No valid recipients to send to." };
  }

  const html = looksLikeHtml(rawMessage)
    ? `<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;font-size:15px;color:#1f2937;">${sanitizeNewsletterHtml(rawMessage)}</div>`
    : `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(rawMessage)}</pre>`;

  let successCount = 0;
  for (const to of recipients) {
    try {
      await transporter.sendMail({
        from: `"Newsletter" <${smtpUser}>`,
        to,
        subject,
        text: textBody,
        html,
      });
      successCount++;
    } catch (e) {
      failedCount++;
      console.error("sendNewsletterBroadcast:", to, e);
    }
  }

  return { ok: true, sent: successCount, failed: failedCount };
}
