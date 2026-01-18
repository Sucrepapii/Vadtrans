import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-4xl bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-raleway font-bold text-charcoal mb-6">
            Terms of Service
          </h1>
          <p className="text-neutral-600 mb-4">
            Welcome to VadTrans. By using our website and services, you agree to
            comply with and be bound by the following terms and conditions.
          </p>
          <div className="space-y-4 text-neutral-700">
            <h2 className="text-xl font-semibold text-charcoal">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using our services, you agree to be bound by these
              Terms. If you disagree with any part of the terms, then you may
              not access the Service.
            </p>
            <h2 className="text-xl font-semibold text-charcoal">
              2. Use of Service
            </h2>
            <p>
              You must be at least 18 years old to use our service. You agree
              not to use the service for any illegal purposes.
            </p>
            <h2 className="text-xl font-semibold text-charcoal">
              3. Booking and Payments
            </h2>
            <p>
              All bookings are subject to availability. Prices are subject to
              change without notice until booking is confirmed.
            </p>
            <h2 className="text-xl font-semibold text-charcoal">
              4. Cancellations and Refunds
            </h2>
            <p>
              Cancellation policies vary by transport operator. Please review
              the specific policy for your trip before booking.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
