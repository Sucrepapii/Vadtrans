import React, { useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    agreeToPrivacy: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeToPrivacy) {
      toast.error("Please agree to the privacy policy");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({
      fullName: "",
      email: "",
      subject: "",
      message: "",
      agreeToPrivacy: false,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-charcoal/90 to-charcoal/70 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/bus-interior.jpg"
            alt="Contact Us"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <h1 className="relative text-5xl font-raleway font-bold text-white">
          CONTACT US
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Contact Form */}
            <div>
              <div className="mb-8">
                <p className="text-primary font-semibold mb-2">Get In Touch!</p>
                <h2 className="text-3xl font-raleway font-bold text-charcoal">
                  Let's Chat, Reach out to Us
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    placeholder="Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onChange={handleChange}
                    className="w-4 h-4 mt-1 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <label className="ml-2 text-sm text-charcoal">
                    By sending this form I confirm that I have read and accept
                    the <span className="text-primary">Privacy Policy</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                  Submit
                </button>
              </form>
            </div>

            {/* Right side - Contact Information & Image */}
            <div className="space-y-6">
              {/* Image */}
              <div className="rounded-lg overflow-hidden h-64 bg-neutral-200">
                <img
                  src="/contact-image.jpg"
                  alt="Contact"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23FFB4A3' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23FF6B6B'%3EContact Us%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Contact Information Cards */}
              <Card className="flex items-start gap-4 p-4 bg-red-50 border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">
                    Office address
                  </h3>
                  <p className="text-sm text-neutral-600">
                    46, Amos Olagboyega Street, Ikeja, Lagos
                  </p>
                </div>
              </Card>

              <Card className="flex items-start gap-4 p-4 bg-red-50 border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">
                    Phone number
                  </h3>
                  <p className="text-sm text-neutral-600">+234-912-328-4931</p>
                </div>
              </Card>

              <Card className="flex items-start gap-4 p-4 bg-red-50 border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">
                    Email address
                  </h3>
                  <p className="text-sm text-neutral-600">
                    contact@vadtrans.com
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;
