import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(2); // Third item open by default

  const faqs = [
    {
      question: "How can I use VadTrans?",
      answer:
        "VadTrans is easy to use. Simply search for your destination, select your preferred transport company, choose your seat, and make payment. You will receive your ticket via email and SMS.",
    },
    {
      question: "What services does VadTrans offer?",
      answer:
        "VadTrans offers a comprehensive platform for booking bus, train, and flight tickets across Nigeria. We partner with verified transport companies to provide you with safe and reliable travel options.",
    },
    {
      question: "Can I pay for trips in installments?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus.",
    },
    {
      question: "How safe are the transport companies here?",
      answer:
        "All transport companies on VadTrans are thoroughly vetted and verified. We ensure they meet safety standards and have valid licenses. You can also view ratings and reviews from other travelers.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-charcoal/90 to-charcoal/70 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/bus-interior.jpg"
            alt="FAQs"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <h1 className="relative text-5xl font-raleway font-bold text-white">
          FAQs
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left side - FAQs */}
            <div>
              <div className="mb-8">
                <p className="text-primary font-semibold mb-2">
                  Frequently Asked Questions
                </p>
                <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
                  Do you have any question?
                </h2>
                <p className="text-neutral-600">
                  Here you can find information on our services, products,
                  technical and legal issues
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-neutral-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors">
                      <span className="font-medium text-charcoal pr-4">
                        {faq.question}
                      </span>
                      {openIndex === index ? (
                        <FaChevronUp className="text-primary flex-shrink-0" />
                      ) : (
                        <FaChevronDown className="text-neutral-400 flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === index && (
                      <div className="px-4 pb-4 text-neutral-600 text-sm leading-relaxed border-t border-neutral-100 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:block">
              <div className="rounded-lg overflow-hidden sticky top-8">
                <img
                  src="/faq-image.jpg"
                  alt="FAQ"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 700'%3E%3Crect fill='%23FFF5F3' width='600' height='700'/%3E%3Ccircle cx='300' cy='250' r='80' fill='%23FFE0D8'/%3E%3Crect x='200' y='330' width='200' height='200' rx='10' fill='%23FFD4C8'/%3E%3Ccircle cx='250' cy='600' r='40' fill='%23FFB4A3'/%3E%3Ccircle cx='350' cy='600' r='40' fill='%23FFB4A3'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
