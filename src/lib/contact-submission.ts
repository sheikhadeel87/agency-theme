import { dbConnect } from "@/lib/db";
import { createMailTransporter, getMailFromUser } from "@/lib/mail-transport";
import { FUNNEL_EVENTS } from "@/lib/track-event";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { ContactMessage } from "@/models/ContactMessage";

/** Where contact form submissions are delivered (default: adeel@cybernest.com). */
const DEFAULT_CONTACT_TO = "adeel@cybernest.com";

export type ContactSubmissionPayload = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ContactSubmissionResult =
  | {
      ok: true;
      id: string;
      emailSent: boolean;
      emailError?: string;
    }
  | { ok: false; error: string; status?: number };

function validatePayload(input: ContactSubmissionPayload): string | null {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!fullName || !email || !message) {
    return "Please fill in your name, email, and message.";
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return "Please enter a valid email address.";
  }

  if (fullName.length > 200 || email.length > 320) {
    return "Name or email is too long.";
  }

  if (input.phone.length > 50 || input.subject.length > 300 || message.length > 20000) {
    return "One or more fields are too long.";
  }

  return null;
}

async function sendAdminNotification(
  payload: ContactSubmissionPayload,
  docId: string
): Promise<{ sent: boolean; error?: string }> {
  const smtpUser = getMailFromUser();
  const transporter = createMailTransporter();

  if (!smtpUser || !transporter) {
    console.error(
      "contact submission: missing EMAIL_USER or EMAIL_PASS — message saved as",
      docId
    );
    return { sent: false, error: "SMTP not configured" };
  }

  const to =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() || DEFAULT_CONTACT_TO;

  const { fullName, email, phone, subject, message } = payload;

  const body = [
    "New contact form submission",
    `Message ID: ${docId}`,
    "",
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    `Subject: ${subject || "—"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const mailSubject = subject
    ? `[Contact] ${subject}`
    : `[Contact] Message from ${fullName}`;

  try {
    await transporter.sendMail({
      from: `"Website contact" <${smtpUser}>`,
      to,
      replyTo: email,
      subject: mailSubject,
      text: body,
    });

    return { sent: true };
  } catch (e) {
    console.error("sendAdminNotification:", e);
    return {
      sent: false,
      error: e instanceof Error ? e.message : "SMTP error",
    };
  }
}

/**
 * Validates input, persists to MongoDB, then sends admin email when SMTP is configured.
 * The message is always stored first so it is never lost if email fails.
 */
export async function submitContactSubmission(
  raw: ContactSubmissionPayload
): Promise<ContactSubmissionResult> {
  const payload: ContactSubmissionPayload = {
    fullName: raw.fullName.trim(),
    email: raw.email.trim(),
    phone: (raw.phone ?? "").trim(),
    subject: (raw.subject ?? "").trim(),
    message: raw.message.trim(),
  };

  const validationError = validatePayload(payload);
  if (validationError) {
    return { ok: false, error: validationError, status: 400 };
  }

  try {
    await dbConnect();
    const doc = await ContactMessage.create({
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      subject: payload.subject,
      message: payload.message,
      status: "new",
    });

    const id = String(doc._id);
    try {
      await AnalyticsEvent.create({ name: FUNNEL_EVENTS.contactSubmit });
    } catch (e) {
      console.error("contact_submit event:", e);
    }
    const emailResult = await sendAdminNotification(payload, id);

    return {
      ok: true,
      id,
      emailSent: emailResult.sent,
      emailError: emailResult.error,
    };
  } catch (e) {
    console.error("submitContactSubmission:", e);
    return {
      ok: false,
      error: "Could not save your message. Please try again later.",
      status: 500,
    };
  }
}
