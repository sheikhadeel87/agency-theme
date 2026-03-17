import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold text-[#0f172a] sm:text-4xl lg:text-5xl">
            Privacy Policy
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
                Welcome to our website. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                2. Information We Collect
              </h2>
              <p className="mt-3">
                We may collect personal information such as your name, email address, phone number, and any other details you provide through our contact forms or services.
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-1">
                <li>Name and contact details</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                3. How We Use Your Information
              </h2>
              <p className="mt-3">
                We use your information to:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-1">
                <li>Provide and maintain our services</li>
                <li>Respond to your inquiries</li>
                <li>Improve user experience</li>
                <li>Send updates and marketing communications</li>
              </ul>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="mt-3">
                We use cookies and similar tracking technologies to monitor activity on our website and improve our services.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                5. Data Security
              </h2>
              <p className="mt-3">
                We take reasonable measures to protect your personal data. However, no method of transmission over the internet is completely secure.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                6. Third-Party Services
              </h2>
              <p className="mt-3">
                We may use third-party services such as analytics tools or payment processors that collect, monitor, and analyze information.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                7. Your Rights
              </h2>
              <p className="mt-3">
                You have the right to access, update, or delete your personal information. You may contact us for any privacy-related requests.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                8. Changes to This Policy
              </h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page.
              </p>
            </section>

            {/* Section */}
            <section>
              <h2 className="text-xl font-semibold text-[#0f172a]">
                9. Contact Us
              </h2>
              <p className="mt-3">
                If you have any questions about this Privacy Policy, please contact us through our website contact form.
              </p>
            </section>

          </div>
        </div>
      </Container>
      </main>
      <Footer />
    </>
  );
}