import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-4xl bg-white rounded-lg p-8 shadow-sm text-neutral-800">
          <h1 className="text-3xl font-raleway font-bold text-charcoal mb-2">
            Vadtrans.com – Refund Policy
          </h1>
          <p className="text-sm text-neutral-500 mb-1">
            <span className="font-medium">Marketplace-Level</span>
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Effective Date: 21st February 2026
          </p>

          <div className="space-y-6">
            <p>
              Vadtrans.com is an online marketplace connecting travelers with
              independent transport providers. Each transport provider listed on
              our platform sets its own refund policy.
            </p>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                1. Provider Refund Policies
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  All transport providers on Vadtrans.com must display their
                  refund policy clearly on their booking page.
                </li>
                <li>
                  Refunds for tickets, cancellations, and other service issues
                  are governed by the provider's stated policy.
                </li>
                <li>
                  Vadtrans.com facilitates bookings and payments but does not
                  directly control provider refund terms.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                2. Marketplace Responsibilities
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Vadtrans.com ensures that all providers comply with displaying
                  their refund policies.
                </li>
                <li>
                  Vadtrans.com will assist in processing refund requests by
                  communicating with providers but is not responsible for the
                  provider's refund decisions.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                3. Exceptions
              </h2>
              <p>
                In cases of duplicate payments, payment errors, or technical
                issues on Vadtrans.com, we will review and issue refunds where
                applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-charcoal mb-2">
                4. Contact
              </h2>
              <p>For issues related to refunds or providers:</p>
              <div className="mt-2 space-y-1">
                <p>
                  Email:{" "}
                  <a
                    href="mailto:support@vadtrans.com"
                    className="text-primary hover:underline">
                    support@vadtrans.com
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a
                    href="https://www.vadtrans.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline">
                    www.vadtrans.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
