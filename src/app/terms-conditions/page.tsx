import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getSiteSettings, getPublishedPages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function TermsConditionsPage() {
  const [siteSettings, dynamicPages] = await Promise.all([
    getSiteSettings(),
    getPublishedPages(),
  ]);
  return (
    <>
      <Header siteSettings={siteSettings} dynamicPages={dynamicPages.map((p) => ({ title: p.title, slug: p.slug }))} />
      <main className="bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold text-[#0f172a] sm:text-4xl lg:text-5xl">
            Terms & Conditions
          </h1>

          <p className="mt-4 text-gray-600">
            Last updated: {new Date().getFullYear()}
          </p>

          <div className="mt-10 space-y-8 text-gray-700 leading-relaxed">

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                1. Introduction
              </h2>
              <p className="mt-3">
                These Terms & Conditions govern your use of our website and services. By accessing or using our website, you agree to comply with these terms.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                2. Use of Services
              </h2>
              <p className="mt-3">
                You agree to use our services only for lawful purposes and in accordance with these Terms. You must not misuse our platform or attempt to access it using unauthorized methods.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                3. Intellectual Property
              </h2>
              <p className="mt-3">
                All content on this website, including text, graphics, logos, and software, is the property of our company and is protected by applicable copyright and intellectual property laws.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                4. User Responsibilities
              </h2>
              <p className="mt-3">
                You are responsible for maintaining the confidentiality of your information and for all activities that occur under your use of the website.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                5. Limitation of Liability
              </h2>
              <p className="mt-3">
                We are not liable for any direct, indirect, incidental, or consequential damages resulting from your use of our services.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                6. Third-Party Links
              </h2>
              <p className="mt-3">
                Our website may contain links to third-party websites. We are not responsible for the content or practices of those websites.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                7. Termination
              </h2>
              <p className="mt-3">
                We reserve the right to terminate or suspend access to our services at any time, without prior notice, for any reason.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                8. Changes to Terms
              </h2>
              <p className="mt-3">
                We may update these Terms & Conditions from time to time. Continued use of the website means you accept those changes.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                9. Governing Law
              </h2>
              <p className="mt-3">
                These Terms shall be governed and interpreted in accordance with applicable laws in your jurisdiction.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                10. Contact Information
              </h2>
              <p className="mt-3">
                If you have any questions about these Terms & Conditions, please contact us through our website.
              </p>
            </section>

          </div>
        </div>
      </Container>
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
