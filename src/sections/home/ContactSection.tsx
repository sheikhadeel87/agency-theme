"use client";

import { Container } from "@/components/ui/Container";
import type { SiteSettingsData } from "@/lib/admin-data";

const DEFAULT_MAP_EMBED =
  "https://maps.google.com/maps?q=Lahore%20Pakistan&t=&z=13&ie=UTF8&iwloc=&output=embed";

export type ContactSectionProps = {
  siteSettings?: SiteSettingsData | null;
};

export function ContactSection({ siteSettings }: ContactSectionProps) {
  const mapSrc =
    siteSettings?.mapEmbedUrl?.trim() || DEFAULT_MAP_EMBED;
  const hasContactInfo =
    siteSettings?.contactEmail?.trim() ||
    siteSettings?.phone?.trim() ||
    siteSettings?.address?.trim();

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#f8f8fb] py-16 sm:py-20 lg:py-24"
      aria-labelledby="contact-heading"
    >
      <Container as="div" className="relative">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="contact-heading"
            className="text-3xl font-semibold leading-tight tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl"
          >
            Let&apos;s Stay Connected
          </h2>
          <p className="mt-4 text-gray-600 sm:mt-6 sm:text-lg">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The
            point of using.
          </p>
        </header>

        {hasContactInfo && (
          <div className="mx-auto mt-8 max-w-6xl rounded-2xl border border-gray-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-3xl sm:p-8">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-600">
              {siteSettings?.contactEmail?.trim() && (
                <li>
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  <a
                    href={`mailto:${siteSettings.contactEmail.trim()}`}
                    className="text-blue-600 hover:underline"
                  >
                    {siteSettings.contactEmail.trim()}
                  </a>
                </li>
              )}
              {siteSettings?.phone?.trim() && (
                <li>
                  <span className="font-medium text-gray-700">Phone:</span>{" "}
                  <a
                    href={`tel:${siteSettings.phone.trim()}`}
                    className="text-blue-600 hover:underline"
                  >
                    {siteSettings.phone.trim()}
                  </a>
                </li>
              )}
              {siteSettings?.address?.trim() && (
                <li className="w-full sm:w-auto">
                  <span className="font-medium text-gray-700">Address:</span>{" "}
                  {siteSettings.address.trim()}
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-10">
          {/* Left: map */}
          <div className="min-h-[520px] overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-3xl">
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
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-3xl sm:p-8 min-h-[520px]">
            <form
              className="flex h-full flex-col gap-5 sm:gap-6"
              onSubmit={(e) => e.preventDefault()}
              noValidate
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Full name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Devid Wonder"
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Email address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Phone number</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+009 3342 3432"
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">Subject</span>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Type your subject"
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              </div>

              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  name="message"
                  rows={6}
                  placeholder="Message"
                  className="min-h-[180px] resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}