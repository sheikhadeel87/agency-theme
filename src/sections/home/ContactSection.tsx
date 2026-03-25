"use client";

import { useState, useTransition } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { SiteSettingsData } from "@/lib/admin-data";
import { sendContactMessage } from "@/lib/actions/contact-form-actions";

const DEFAULT_MAP_EMBED =
  "https://maps.google.com/maps?q=Lahore%20Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed";

export type ContactSectionProps = {
  siteSettings?: SiteSettingsData | null;
};

export function ContactSection({ siteSettings }: ContactSectionProps) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const mapSrc =
    siteSettings?.mapEmbedUrl?.trim() || DEFAULT_MAP_EMBED;
  const email = siteSettings?.contactEmail?.trim() ?? "";
  const phone = siteSettings?.phone?.trim() ?? "";
  const address = siteSettings?.address?.trim() ?? "";
  const hasContactInfo = Boolean(email || phone || address);
  const contactColumnCount = [email, phone, address].filter(Boolean).length;
  const contactGridClass =
    contactColumnCount === 1
      ? "grid-cols-1 max-w-sm mx-auto"
      : contactColumnCount === 2
        ? "grid-cols-1 sm:grid-cols-2 sm:max-w-3xl sm:mx-auto"
        : "grid-cols-1 sm:grid-cols-3";

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await sendContactMessage(formData);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setFormSuccess(true);
      form.reset();
    });
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-24"
      aria-labelledby="contact-heading"
    >
      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="contact-heading"
            className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Let&apos;s Stay Connected
          </h2>
          <p className="mt-4 text-muted-foreground sm:mt-6 sm:text-lg">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The
            point of using.
          </p>
        </header>

        {hasContactInfo && (
          <div className="mx-auto mt-8 max-w-6xl rounded-2xl border border-border bg-card px-4 py-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-3xl sm:px-8 sm:py-10 dark:shadow-none">
            <ul
              className={`grid gap-8 sm:gap-0 sm:divide-x sm:divide-border ${contactGridClass}`}
            >
              {email && (
                <li className="flex flex-col items-center text-center sm:px-6 lg:px-8">
                  <span
                    className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground"
                    aria-hidden
                  >
                    <Mail className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1.5 break-all text-sm font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline hover:decoration-muted-foreground"
                  >
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li className="flex flex-col items-center text-center sm:px-6 lg:px-8">
                  <span
                    className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground"
                    aria-hidden
                  >
                    <Phone className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </span>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="mt-1.5 text-sm font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline hover:decoration-muted-foreground"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex flex-col items-center text-center sm:px-6 lg:px-8">
                  <span
                    className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground"
                    aria-hidden
                  >
                    <MapPin className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Address
                  </span>
                  <p className="mt-1.5 max-w-xs text-pretty text-sm font-medium leading-relaxed text-foreground sm:max-w-none">
                    {address}
                  </p>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-10">
          {/* Left: map */}
          <div className="min-h-[520px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-3xl dark:shadow-none">
            <iframe
              title="Office location map"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
            />
          </div>

          {/* Right: form */}
          <div className="min-h-[520px] rounded-2xl border border-border bg-card p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-3xl sm:p-8 dark:shadow-none">
            <form
              className="flex h-full flex-col gap-5 sm:gap-6"
              onSubmit={handleContactSubmit}
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">Full name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="M.Adeel"
                    disabled={pending}
                    className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Email address</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="adeel@cybernest.com"
                    disabled={pending}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+923004199389"
                    disabled={pending}
                    className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">Subject</span>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Confirmation"
                    disabled={pending}
                    className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                </label>
              </div>

              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Message</span>
                <textarea
                  name="message"
                  rows={6}
                  required
                  placeholder="Please confirm my order and dispatch date"
                  disabled={pending}
                  className="min-h-[180px] resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />
              </label>

              {formError && (
                <p className="text-sm text-red-600" role="alert">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="text-sm text-green-700" role="status">
                  Thanks — your message was sent. We&apos;ll get back to you soon.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}