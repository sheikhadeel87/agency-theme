import nodemailer from "nodemailer";

/** Same SMTP settings as the contact form (EMAIL_USER, EMAIL_PASS, SMTP_*). */
export function createMailTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "") ?? "";
  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === "false" ? false : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function getMailFromUser(): string | undefined {
  return process.env.EMAIL_USER?.trim();
}
