"use server";

import nodemailer from "nodemailer";

/** Where contact form submissions are delivered (default: adeel@cybernest.com). */
const DEFAULT_CONTACT_TO = "adeel@cybernest.com";

export type SendContactMessageState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString().trim() ?? "";
}

/**
 * Sends the public homepage contact form via SMTP.
 * Configure EMAIL_USER + EMAIL_PASS (e.g. Gmail app password).
 * Optional: CONTACT_NOTIFICATION_EMAIL — recipient (defaults to adeel@cybernest.com).
 * Optional: SMTP_HOST, SMTP_PORT, SMTP_SECURE (defaults work for Gmail).
 */
export async function sendContactMessage(
  formData: FormData
): Promise<SendContactMessageState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const phone = str(formData, "phone");
  const subject = str(formData, "subject");
  const message = str(formData, "message");

  if (!name || !email || !message) {
    return { error: "Please fill in your name, email, and message." };
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return { error: "Please enter a valid email address." };
  }

  const smtpUser = process.env.EMAIL_USER?.trim();
  // Gmail app passwords are often shown with spaces
  const smtpPass = process.env.EMAIL_PASS?.replace(/\s/g, "") ?? "";

  if (!smtpUser || !smtpPass) {
    console.error("sendContactMessage: missing EMAIL_USER or EMAIL_PASS");
    return {
      error: "Contact form email is not configured. Please try again later.",
    };
  }

  const to =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() || DEFAULT_CONTACT_TO;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE === "false" ? false : port === 465;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const body = [
      "New contact form submission",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      `Subject: ${subject || "—"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const mailSubject = subject
      ? `[Contact] ${subject}`
      : `[Contact] Message from ${name}`;

    await transporter.sendMail({
      from: `"Website contact" <${smtpUser}>`,
      to,
      replyTo: email,
      subject: mailSubject,
      text: body,
    });

    return { success: true };
  } catch (e) {
    console.error("sendContactMessage:", e);
    return {
      error: "Could not send your message. Please try again later.",
    };
  }
}
