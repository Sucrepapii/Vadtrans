import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { nigerianStates, westAfricanCountries } from "../../data/locations";
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaBus,
  FaPlane,
  FaTrain,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    transportType: "all",
  });

  // Determine location options based on transport type
  const locationOptions = useMemo(() => {
    if (searchData.transportType === "international") {
      return westAfricanCountries;
    }
    return nigerianStates;
  }, [searchData.transportType]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/search", { state: searchData });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-12 sm:py-16 md:py-20 px-4">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Search Form */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-raleway font-bold text-charcoal mb-4 leading-tight">
                Travel Anywhere,
                <br />
                <span className="text-primary">Anytime</span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 mb-6 sm:mb-8">
                Book bus, train, and flight tickets with ease. Safe, reliable,
                and affordable travel across Nigeria and Africa.
              </p>

              {/* Search Form */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Transport Type - Show first so it affects location options */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Transport Type
                  </label>
                  <select
                    value={searchData.transportType}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        transportType: e.target.value,
                        from: "", // Reset locations when transport type changes
                        to: "",
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary text-sm sm:text-base">
                    <option value="all">All Types</option>
                    <option value="bus-domestic">Bus - Domestic</option>
                    <option value="bus-international">
                      Bus - International
                    </option>
                    <option value="car-domestic">Car - Domestic</option>
                    <option value="car-international">
                      Car - International
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    From
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                    <select
                      value={searchData.from}
                      onChange={(e) =>
                        setSearchData({ ...searchData, from: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none text-sm sm:text-base"
                      required>
                      <option value="">
                        Select departure{" "}
                        {searchData.transportType === "flight"
                          ? "city/country"
                          : "state"}
                      </option>
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    To
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                    <select
                      value={searchData.to}
                      onChange={(e) =>
                        setSearchData({ ...searchData, to: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none text-sm sm:text-base"
                      required>
                      <option value="">
                        Select destination{" "}
                        {searchData.transportType === "flight"
                          ? "city/country"
                          : "state"}
                      </option>
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) =>
                        setSearchData({ ...searchData, date: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 sm:py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm sm:text-base">
                  Search Trips
                </button>
              </form>
            </div>

            {/* Right side - Hero Image/Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="/hero-bus.jpg"
                  alt="Travel"
                  className="w-full h-auto rounded-lg shadow-xl"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect fill='%23FFE5E5' width='600' height='400'/%3E%3Crect x='150' y='100' width='300' height='200' rx='20' fill='%23FF6B6B'/%3E%3Crect x='180' y='130' width='60' height='60' rx='5' fill='white'/%3E%3Crect x='270' y='130' width='60' height='60' rx='5' fill='white'/%3E%3Crect x='360' y='130' width='60' height='60' rx='5' fill='white'/%3E%3Ccircle cx='220' cy='320' r='25' fill='%23333'/%3E%3Ccircle cx='380' cy='320' r='25' fill='%23333'/%3E%3C/svg%3E";
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
              Why Choose VadTrans?
            </h2>
            <p className="text-neutral-600">
              We make traveling across Nigeria simple, safe, and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Verified Companies
              </h3>
              <p className="text-neutral-600">
                All transport companies are thoroughly vetted and verified for
                your safety
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                24/7 Support
              </h3>
              <p className="text-neutral-600">
                Round-the-clock customer support to assist you at any time
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Secure Payments
              </h3>
              <p className="text-neutral-600">
                Safe and secure payment options to protect your transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transport Types Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
              Choose Your Transport
            </h2>
            <p className="text-neutral-600">
              Multiple options to suit your travel needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow border border-neutral-200">
              <FaBus className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Bus</h3>
              <p className="text-neutral-600 mb-4">
                Comfortable and affordable bus services
              </p>
              <p className="text-2xl font-bold text-primary">From ₦25,000</p>
            </div>

            <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow border border-neutral-200">
              <FaTrain className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Train
              </h3>
              <p className="text-neutral-600 mb-4">
                Fast and reliable train journeys
              </p>
              <p className="text-2xl font-bold text-primary">From ₦5,000</p>
            </div>

            <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow border border-neutral-200">
              <FaPlane className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">
                Flight
              </h3>
              <p className="text-neutral-600 mb-4">
                Quick flights to major cities
              </p>
              <p className="text-2xl font-bold text-primary">From ₦250,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="container-custom max-w-4xl text-center text-white">
          <h2 className="text-3xl font-raleway font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of travelers who trust VadTrans for their trips
          </p>
          <button
            onClick={() => navigate("/search")}
            className="px-8 py-4 bg-white text-primary rounded-lg font-medium hover:bg-neutral-100 transition-colors">
            Book Your Trip Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
