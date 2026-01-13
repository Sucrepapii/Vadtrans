import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaBus,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

const CompanyLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FaUsers,
      title: "Reach More Customers",
      description:
        "Connect with thousands of travelers looking for reliable transport services",
    },
    {
      icon: FaChartLine,
      title: "Grow Your Business",
      description:
        "Increase bookings and revenue with our easy-to-use platform",
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payments",
      description:
        "Get paid quickly and securely with our trusted payment system",
    },
  ];

  const benefits = [
    "Access to thousands of potential customers",
    "Easy online booking management",
    "Real-time ticket sales tracking",
    "Automated payment processing",
    "24/7 customer support",
    "Marketing and promotional tools",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20 px-4">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h1 className="text-5xl font-raleway font-bold text-charcoal mb-4 leading-tight">
                Grow Your Transport Business with{" "}
                <span className="text-primary">VadTrans</span>
              </h1>
              <p className="text-lg text-neutral-600 mb-8">
                Join Nigeria's leading transportation booking platform and
                connect with thousands of travelers daily.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/company/register")}
                  className="px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                  Register Your Company
                </button>
                <button
                  onClick={() => navigate("/signin")}
                  className="px-8 py-4 bg-white border-2 border-charcoal text-charcoal rounded-lg font-medium hover:bg-neutral-50 transition-colors">
                  Sign In
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-neutral-600">Companies</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50k+</p>
                  <p className="text-sm text-neutral-600">Daily Bookings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">1M+</p>
                  <p className="text-sm text-neutral-600">Happy Travelers</p>
                </div>
              </div>
            </div>

            {/* Right side - Illustration/Image */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="/company-hero.jpg"
                  alt="Transport Company"
                  className="w-full h-auto rounded-lg shadow-xl"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect fill='%23FFE5E5' width='600' height='400'/%3E%3Ccircle cx='300' cy='200' r='80' fill='%23FF6B6B'/%3E%3Ctext x='300' y='210' text-anchor='middle' font-size='24' fill='white'%3EYour Company%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
              Why Partner with VadTrans?
            </h2>
            <p className="text-neutral-600">
              Everything you need to manage and grow your transport business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-3xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits List */}
            <div>
              <h2 className="text-3xl font-raleway font-bold text-charcoal mb-6">
                What You Get as a Partner
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaCheckCircle className="text-green-600 text-sm" />
                    </div>
                    <p className="text-neutral-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:block">
              <img
                src="/benefits-image.jpg"
                alt="Benefits"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 500'%3E%3Crect fill='%23F5F5F5' width='600' height='500'/%3E%3Crect x='100' y='100' width='400' height='300' rx='10' fill='%23FFB4A3'/%3E%3Ctext x='300' y='260' text-anchor='middle' font-size='28' fill='%23FF6B6B'%3EGrow Together%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
              How It Works
            </h2>
            <p className="text-neutral-600">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Register Your Company
              </h3>
              <p className="text-neutral-600">
                Fill out the registration form with your company details
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Upload Documents
              </h3>
              <p className="text-neutral-600">
                Submit required documents for verification
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Start Selling
              </h3>
              <p className="text-neutral-600">
                Once verified, start listing tickets and receiving bookings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="container-custom max-w-4xl text-center text-white">
          <h2 className="text-3xl font-raleway font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join hundreds of transport companies already using VadTrans
          </p>
          <button
            onClick={() => navigate("/company/register")}
            className="px-8 py-4 bg-white text-primary rounded-lg font-medium hover:bg-neutral-100 transition-colors">
            Get Started Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompanyLanding;
