import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import {
  FaBus,
  FaPlane,
  FaTrain,
  FaCar,
  FaShip,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaHeadset,
  FaMobileAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

const Services = () => {
  const navigate = useNavigate();

  const transportServices = [
    {
      icon: FaBus,
      title: "Bus Services",
      description:
        "Comfortable and affordable bus travel across Nigeria and Africa",
      features: [
        "Air-conditioned buses",
        "Reclining seats",
        "Onboard entertainment",
        "Rest stops included",
      ],
      priceFrom: "₦2,500",
      routes: "Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu",
    },
    {
      icon: FaCar,
      title: "Car Rental",
      description: "Self-drive or chauffeur-driven car rental services",
      features: [
        "Wide range of vehicles",
        "Flexible rental periods",
        "GPS navigation",
        "24/7 roadside assistance",
      ],
      priceFrom: "₦15,000/day",
      routes: "Available in major cities nationwide",
    },
  ];

  const additionalServices = [
    {
      icon: FaCheckCircle,
      title: "Ticket Booking",
      description: "Easy online booking with instant confirmation",
    },
    {
      icon: FaClock,
      title: "Schedule Management",
      description: "Real-time updates on departure and arrival times",
    },
    {
      icon: FaShieldAlt,
      title: "Travel Insurance",
      description: "Comprehensive insurance coverage for your journey",
    },
    {
      icon: FaHeadset,
      title: "24/7 Support",
      description: "Round-the-clock customer service assistance",
    },
    {
      icon: FaMobileAlt,
      title: "Mobile Tracking",
      description: "Track your journey in real-time via mobile app",
    },
    {
      icon: FaMoneyBillWave,
      title: "Flexible Payment",
      description: "Multiple secure payment options available",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-16 px-4">
        <div className="container-custom max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-raleway font-bold text-charcoal mb-4">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Comprehensive transportation solutions tailored to meet all your
            travel needs across Nigeria and beyond
          </p>
        </div>
      </section>

      {/* Main Transport Services */}
      <section className="py-16 px-4 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
              Transportation Services
            </h2>
            <p className="text-neutral-600">
              Choose from our wide range of transport options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {transportServices.map((service, index) => (
              <div
                key={index}
                className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <service.icon className="text-3xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">
                  {service.title}
                </h3>
                <p className="text-neutral-600 mb-4 text-sm">
                  {service.description}
                </p>

                <div className="mb-4">
                  <h4 className="font-semibold text-charcoal text-sm mb-2">
                    Features:
                  </h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-neutral-600">
                        <FaCheckCircle className="text-primary mr-2 text-xs flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <p className="text-sm text-neutral-600 mb-1">Starting from</p>
                  <p className="text-2xl font-bold text-primary mb-3">
                    {service.priceFrom}
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    <strong>Routes:</strong> {service.routes}
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate("/search")}>
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
              Additional Services
            </h2>
            <p className="text-neutral-600">
              Comprehensive support for your entire journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <service.icon className="text-2xl text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  {service.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
              How It Works
            </h2>
            <p className="text-neutral-600">
              Simple steps to book your journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Search",
                description:
                  "Enter your departure, destination, and travel date",
              },
              {
                step: "2",
                title: "Select",
                description: "Choose from available transport options",
              },
              {
                step: "3",
                title: "Book",
                description: "Fill in passenger details and make payment",
              },
              {
                step: "4",
                title: "Travel",
                description: "Receive e-ticket and enjoy your journey",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="container-custom max-w-4xl text-center text-white">
          <h2 className="text-3xl font-raleway font-bold mb-4">
            Ready to Book Your Trip?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of satisfied travelers who trust VadTrans
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate("/search")}
            className="bg-white text-primary hover:bg-neutral-100">
            Get Started Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
