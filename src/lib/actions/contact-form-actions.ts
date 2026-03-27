"use server";

import { submitContactSubmission } from "@/lib/contact-submission";

export type SendContactMessageState = {
  success?: boolean;
  error?: string;
  emailSent?: boolean;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString().trim() ?? "";
}

/**
 * Public homepage contact form (server action).
 * Persists to MongoDB then sends admin email when SMTP is configured.
 * Accepts `fullName` or legacy `name` field.
 */
export async function sendContactMessage(
  formData: FormData
): Promise<SendContactMessageState> {
  const fullName = str(formData, "fullName") || str(formData, "name");
  const result = await submitContactSubmission({
    fullName,
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    subject: str(formData, "subject"),
    message: str(formData, "message"),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  return {
    success: true,
    emailSent: result.emailSent,
  };
}
