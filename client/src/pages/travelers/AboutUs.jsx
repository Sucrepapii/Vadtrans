import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import {
  FaBus,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkedAlt,
  FaHandshake,
  FaAward,
  FaLightbulb,
} from "react-icons/fa";
import { faqAPI } from "../../services/api";

const AboutUs = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const values = [
    {
      icon: FaUsers,
      title: "Customer Obsession",
      description:
        "We exist to create seamless, reliable, and satisfying experiences for every customer.",
    },
    {
      icon: FaAward,
      title: "Excellence",
      description:
        "Creating exceptional products and delivering high-quality service is central to who we are.",
    },
    {
      icon: FaLightbulb,
      title: "Innovation & Diversity",
      description:
        "We foster inclusive thinking and continuous innovation to create solutions that improve lives across communities.",
    },
  ];

  const stats = [
    { number: "500+", label: "Transport Companies" },
    { number: "50,000+", label: "Daily Bookings" },
    { number: "1M+", label: "Happy Travelers" },
    { number: "100+", label: "Routes Covered" },
  ];

  const [faqs, setFaqs] = useState([]);

  React.useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await faqAPI.getFAQs();
        setFaqs(data.data);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      }
    };
    fetchFAQs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-12 sm:py-16 md:py-20 px-4">
        <div className="container-custom max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-raleway font-bold text-charcoal mb-4 leading-tight">
              About <span className="text-primary">VadTrans</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 max-w-3xl mx-auto mb-6">
              Nigeria's leading transportation booking platform, connecting
              travelers with reliable transport companies across the country and
              beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal mb-4">
                Our Mission
              </h2>
              <p className="text-neutral-700 mb-4 leading-relaxed">
                To make travel simple and enjoyable by connecting travelers with
                trusted transport providers, while empowering individuals to
                launch and grow their own transport services through an
                easy-to-use online marketplace—designed to be enhanced over time
                by data-driven and AI-powered tools that optimize pricing,
                routes, and user experience as we scale.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm sm:text-base">
                    Verified Companies
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm sm:text-base">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm sm:text-base">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-neutral-50 rounded-lg p-4 sm:p-6 text-center border border-neutral-200">
                  <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                    {stat.number}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 px-4 bg-neutral-50">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal mb-3">
              Our Core Values
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape the experience
              we deliver to our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-3xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-neutral-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal mb-3">
              Why Choose VadTrans?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <FaHandshake className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Trusted Platform
              </h3>
              <p className="text-neutral-700">
                Over 1 million travelers trust us for their journeys. Join our
                growing community of satisfied customers.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <FaAward className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Award Winning
              </h3>
              <p className="text-neutral-700">
                Recognized as Nigeria's best transportation booking platform for
                customer satisfaction and innovation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <FaBus className="text-4xl text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Best Selection
              </h3>
              <p className="text-neutral-700">
                Choose from hundreds of verified transport companies and
                thousands of daily trips to your destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4 bg-neutral-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600">
              Got questions? We've got answers. Find quick solutions to common
              inquiries below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors">
                  <span className="font-semibold text-charcoal pr-4 text-sm sm:text-base">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <FaChevronUp className="text-primary flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 sm:px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                    <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center bg-blue-50 rounded-lg p-6 sm:p-8 border border-blue-200">
            <h3 className="text-lg sm:text-xl font-semibold text-charcoal mb-2">
              Still have questions?
            </h3>
            <p className="text-neutral-600 mb-4">
              Our customer support team is always ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => navigate("/help")}
                className="whitespace-nowrap">
                Contact Support
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/")}
                className="whitespace-nowrap">
                Start Booking
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
