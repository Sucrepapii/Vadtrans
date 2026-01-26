import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-4xl bg-white rounded-lg p-8 shadow-sm text-neutral-800">
          <h1 className="text-3xl font-raleway font-bold text-charcoal mb-2">
            Vadtrans.com – Terms of Service
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            Last Updated: 2026-01-26
          </p>

          <div className="space-y-6">
            <p>
              Welcome to Vadtrans.com ("Vadtrans", "we", "our", or "us").
              Vadtrans is an online marketplace that connects passengers with
              transport companies and individual transport providers for journey
              bookings. By accessing or using our website, mobile applications,
              or services (collectively, the "Platform"), you agree to these
              Terms of Service ("Terms"). If you do not agree, please do not use
              the Platform.
            </p>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                1. Eligibility
              </h2>
              <p>
                You must be at least 18 years old and legally capable of
                entering into a binding contract to use Vadtrans. By using the
                Platform, you represent that you meet these requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                2. Our Role
              </h2>
              <p>Vadtrans is a technology platform and marketplace. We:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Facilitate discovery and booking of transport services.</li>
                <li>Do not own, operate, or control transport vehicles.</li>
                <li>
                  Are not a transport provider, travel agency, or carrier.
                </li>
              </ul>
              <p className="mt-2">
                Transport services are provided by independent third‑party
                transport companies or individuals ("Transport Providers"). Any
                contract for transport is strictly between you and the Transport
                Provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                3. Account Registration
              </h2>
              <p>
                To access certain features, you may be required to create an
                account.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  You agree to provide accurate and up‑to‑date information.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your login details.
                </li>
                <li>
                  You are responsible for all activities under your account.
                </li>
                <li>
                  We reserve the right to suspend or terminate accounts that
                  provide false information or violate these Terms.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                4. Bookings and Payments
              </h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Prices, routes, schedules, and availability are determined by
                  Transport Providers.
                </li>
                <li>
                  Payments may be processed through third‑party payment
                  processors.
                </li>
                <li>
                  Vadtrans may charge a service or platform fee, which will be
                  clearly disclosed.
                </li>
                <li>
                  Refunds, cancellations, and rescheduling are subject to the
                  Transport Provider’s policy unless otherwise stated.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                5. User Responsibilities
              </h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Use the Platform lawfully and respectfully.</li>
                <li>
                  Not misuse, disrupt, or attempt to gain unauthorized access to
                  the Platform.
                </li>
                <li>Provide accurate booking and contact information.</li>
              </ul>
              <p className="mt-2">
                You must not use Vadtrans for fraudulent, illegal, or harmful
                activities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                6. Transport Providers’ Responsibilities
              </h2>
              <p>Transport Providers are solely responsible for:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Compliance with all applicable laws, licenses, and
                  regulations.
                </li>
                <li>Vehicle safety, insurance, and driver qualifications.</li>
                <li>
                  The quality, safety, and execution of transport services.
                </li>
              </ul>
              <p className="mt-2">
                Vadtrans does not guarantee the performance or conduct of any
                Transport Provider.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                7. Ratings and Reviews
              </h2>
              <p>Users may leave ratings and reviews. You agree that:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Reviews must be honest and non‑defamatory.</li>
                <li>Vadtrans may remove reviews that violate our policies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                8. Intellectual Property
              </h2>
              <p>
                All content on Vadtrans (logos, text, graphics, software) is
                owned by or licensed to Vadtrans and protected by intellectual
                property laws. You may not copy, modify, or distribute our
                content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                9. Disclaimer of Warranties
              </h2>
              <p>
                Vadtrans is provided on an "as is" and "as available" basis. We
                do not guarantee:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Continuous or error‑free operation.</li>
                <li>Accuracy of listings provided by Transport Providers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                10. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, Vadtrans shall not be
                liable for:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Accidents, delays, cancellations, injuries, or losses caused
                  by Transport Providers.
                </li>
                <li>Indirect, incidental, or consequential damages.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                11. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold Vadtrans harmless from any
                claims arising out of:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Your use of the Platform.</li>
                <li>Your violation of these Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                12. Termination
              </h2>
              <p>
                We may suspend or terminate your access at any time for
                violation of these Terms or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                13. Governing Law
              </h2>
              <p>
                These Terms shall be governed by the laws of the Federal
                Republic of Nigeria, without regard to conflict of law
                principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                14. Changes to Terms
              </h2>
              <p>
                We may update these Terms from time to time. Continued use of
                the Platform constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                15. Contact Information
              </h2>
              <p>Vadtrans.com</p>
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

export default TermsOfService;
