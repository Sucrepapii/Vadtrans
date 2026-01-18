import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-4xl bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-raleway font-bold text-charcoal mb-6">
            Privacy Policy
          </h1>
          <p className="text-neutral-600 mb-4">
            Your privacy is important to us. It is VadTrans' policy to respect
            your privacy regarding any information we may collect from you
            across our website.
          </p>
          <div className="space-y-4 text-neutral-700">
            <h2 className="text-xl font-semibold text-charcoal">
              1. Information We Collect
            </h2>
            <p>
              We only ask for personal information when we truly need it to
              provide a service to you. We collect it by fair and lawful means,
              with your knowledge and consent.
            </p>
            <h2 className="text-xl font-semibold text-charcoal">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to operate and maintain our
              website, improve your experience, and process your bookings.
            </p>
            <h2 className="text-xl font-semibold text-charcoal">
              3. Data Security
            </h2>
            <p>
              We protect the data we store within commercially acceptable means
              to prevent loss and theft, as well as unauthorized access,
              disclosure, copying, use, or modification.
            </p>
            <h2 className="text-xl font-semibold text-charcoal">
              4. Sharing of Information
            </h2>
            <p>
              We do not share any personally identifying information publicly or
              with third-parties, except when required to by law.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
