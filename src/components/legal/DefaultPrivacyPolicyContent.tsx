/** Static fallback when no custom HTML is saved in the CMS. */
export function DefaultPrivacyPolicyContent() {
  return (
    <div className="mt-10 space-y-8 leading-relaxed text-muted-foreground">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
        <p className="mt-3">
          Welcome to our website. Your privacy is important to us. This Privacy Policy explains how we collect,
          use, and protect your information when you use our services.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
        <p className="mt-3">
          We may collect personal information such as your name, email address, phone number, and any other
          details you provide through our contact forms or services.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>Name and contact details</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Usage data and analytics</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
        <p className="mt-3">We use your information to:</p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>Provide and maintain our services</li>
          <li>Respond to your inquiries</li>
          <li>Improve user experience</li>
          <li>Send updates and marketing communications</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Cookies and Tracking Technologies</h2>
        <p className="mt-3">
          We use cookies and similar tracking technologies to monitor activity on our website and improve our
          services.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
        <p className="mt-3">
          We take reasonable measures to protect your personal data. However, no method of transmission over the
          internet is completely secure.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
        <p className="mt-3">
          We may use third-party services such as analytics tools or payment processors that collect, monitor,
          and analyze information.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
        <p className="mt-3">
          You have the right to access, update, or delete your personal information. You may contact us for any
          privacy-related requests.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
        <p className="mt-3">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground">9. Contact Us</h2>
        <p className="mt-3">
          If you have any questions about this Privacy Policy, please contact us through our website contact
          form.
        </p>
      </section>
    </div>
  );
}
