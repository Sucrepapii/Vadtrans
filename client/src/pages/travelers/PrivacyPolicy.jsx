import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-4xl bg-white rounded-lg p-8 shadow-sm text-neutral-800">
          <h1 className="text-3xl font-raleway font-bold text-charcoal mb-2">
            Vadtrans.com – Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            Last Updated: 2026-01-26
          </p>

          <div className="space-y-6">
            <p>
              Vadtrans respects your privacy. This Privacy Policy explains how
              we collect, use, disclose, and protect your personal information.
            </p>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                1. Information We Collect
              </h2>
              <p>We may collect:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Personal Information: Name, phone number, email address,
                  payment details.
                </li>
                <li>Booking Information: Routes, travel dates, preferences.</li>
                <li>
                  Technical Data: IP address, device information, cookies, and
                  usage data.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                2. How We Use Your Information
              </h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide and improve our services.</li>
                <li>
                  Facilitate bookings between users and Transport Providers.
                </li>
                <li>Process payments and send notifications.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                3. Sharing of Information
              </h2>
              <p>We may share information with:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Transport Providers (to fulfill bookings).</li>
                <li>Payment processors and service providers.</li>
                <li>Legal authorities when required by law.</li>
              </ul>
              <p className="mt-2">We do not sell your personal data.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                4. Data Security
              </h2>
              <p>
                We implement reasonable technical and organizational measures to
                protect your data. However, no system is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                5. Cookies
              </h2>
              <p>
                We use cookies and similar technologies to improve user
                experience and analyze platform usage. You may control cookies
                through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                6. Data Retention
              </h2>
              <p>
                We retain personal data only as long as necessary for the
                purposes outlined in this policy or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                7. Your Rights
              </h2>
              <p>Depending on applicable law, you may have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Access your personal data.</li>
                <li>Request correction or deletion.</li>
                <li>Withdraw consent for certain processing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                8. Third‑Party Links
              </h2>
              <p>
                Vadtrans may contain links to third‑party websites. We are not
                responsible for their privacy practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                9. Children’s Privacy
              </h2>
              <p>
                Vadtrans does not knowingly collect personal information from
                children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Updates
                will be posted on the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                11. Contact Us
              </h2>
              <p>If you have questions about this Privacy Policy, contact:</p>
              <p className="mt-2">Vadtrans.com</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@vadtrans.com"
                  className="text-primary hover:underline">
                  support@vadtrans.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
