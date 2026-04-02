import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaBook,
  FaSearch,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import { contactAPI } from "../../services/api";

const HelpSupport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await import("../../services/api").then((m) =>
          m.faqAPI.getFAQs(),
        );
        // Transform flat API response to grouped format expected by UI
        // Future improvement: Add 'category' to backend model
        const transformedFaqs = [
          {
            category: "General Questions",
            questions: data.data.map((f) => ({
              q: f.question,
              a: f.answer,
            })),
          },
        ];

        if (transformedFaqs[0].questions.length > 0) {
          setFaqs(transformedFaqs);
        } else {
          // Fallback if no APIs are in DB yet, so page isn't empty
          setFaqs([]);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (sending) return;

    try {
      setSending(true);
      const response = await contactAPI.sendMessage(contactForm);

      if (response.data.success) {
        toast.success("Message sent! We'll get back to you shortly.");
        setContactForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Contact Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-raleway font-bold text-charcoal mb-2">
              Help & Support
            </h1>
            <p className="text-neutral-600">
              Find answers to common questions or contact us
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to="/about">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                <FaBook className="text-4xl text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Getting Started</h3>
                <p className="text-sm text-neutral-600">
                  Learn how to use Vadtrans
                </p>
              </Card>
            </Link>
            <Link to="/contact">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                <FaEnvelope className="text-4xl text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Contact Support</h3>
                <p className="text-sm text-neutral-600">
                  Get in touch with our team
                </p>
              </Card>
            </Link>
            <a href="tel:+2349123284931">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                <FaPhone className="text-4xl text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-sm text-neutral-600">+234-912-328-4931</p>
              </Card>
            </a>
          </div>

          {/* FAQs */}
          <div className="mb-8">
            <h2 className="text-2xl font-raleway font-bold text-charcoal mb-4">
              Frequently Asked Questions
            </h2>
            {filteredFaqs.map((category) => (
              <div key={category.category} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.questions.map((faq, idx) => (
                    <Card key={idx}>
                      <div className="flex gap-3">
                        <FaQuestionCircle className="text-primary text-xl flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-charcoal mb-2">
                            {faq.q}
                          </h4>
                          <p className="text-neutral-600 text-sm">{faq.a}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <Card className="text-center py-8">
                <p className="text-neutral-600">
                  No FAQs found matching your search.
                </p>
              </Card>
            )}
          </div>

          {/* Contact Form */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Still Need Help?</h2>
            <p className="text-neutral-600 mb-6">
              Send us a message and we'll get back to you as soon as possible.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                label="Subject"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                required
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  rows="5"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={sending}>
                <div className="flex items-center justify-center gap-2">
                  {sending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                  <span>{sending ? "Sending..." : "Send Message"}</span>
                </div>
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpSupport;
