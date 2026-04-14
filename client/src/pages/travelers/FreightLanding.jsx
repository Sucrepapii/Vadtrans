import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import MaterialDatePicker from "../../components/MaterialDatePicker";
import ReviewSection from "../../components/ReviewSection";
import { westAfricanCountries } from "../../data/locations";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";
import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaTruck,
  FaBox,
  FaHandHoldingHeart,
  FaArrowRight,
  FaEnvelope,
  FaCube,
  FaShapes,
  FaWeightHanging,
} from "react-icons/fa";

const DHL_PRESETS = [
  { id: "envelope", label: "Envelope", icon: <FaEnvelope />, l: 32, w: 24, h: 1, weight: 0.5 },
  { id: "book", label: "Book/Flyer", icon: <FaBox />, l: 30, w: 23, h: 5, weight: 1.5 },
  { id: "shoebox", label: "Shoe Box", icon: <FaCube />, l: 35, w: 25, h: 15, weight: 2.5 },
  { id: "movingbox", label: "Large Box", icon: <FaShapes />, l: 60, w: 40, h: 40, weight: 15 },
];

const POPULAR_COUNTRIES = [
  "United Kingdom", "United States", "China", "United Arab Emirates", 
  "India", "Germany", "Canada", "South Africa", "France", "Turkey"
];

const FreightLanding = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const { states } = useLocationsAPI();

  // Unified locations memo
  const unifiedLocations = useMemo(() => {
    const nigeriaStates = states.map(s => s.name);
    // Combine West African countries with popular international ones
    const internationalCountries = [...new Set([...westAfricanCountries, ...POPULAR_COUNTRIES])]
      .filter(c => c !== "Nigeria") // Ensure Nigeria isn't in both lists
      .sort();

    return {
      nigeria: nigeriaStates,
      international: internationalCountries
    };
  }, [states]);

  // Redirect company users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === "company") {
      navigate("/company/tickets");
    }
  }, [isAuthenticated, user, navigate]);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: getTodayDate(),
    transportType: "inter-state", // Initial default
    fromState: "",
    toState: "",
    fromCountry: "Nigeria",
    toCountry: "",
    serviceCategory: "freight",
    length: "",
    width: "",
    height: "",
    weight: "",
  });

  const handleLocationChange = (type, value) => {
    const isInternational = unifiedLocations.international.includes(value);
    const updatedData = { ...searchData };

    if (type === "origin") {
      if (isInternational) {
        updatedData.fromCountry = value;
        updatedData.fromState = "";
        updatedData.from = "";
      } else {
        updatedData.fromState = value;
        updatedData.fromCountry = "Nigeria";
        updatedData.from = "";
      }
    } else {
      if (isInternational) {
        updatedData.toCountry = value;
        updatedData.toState = "";
        updatedData.to = "";
      } else {
        updatedData.toState = value;
        updatedData.toCountry = "Nigeria";
        updatedData.to = "";
      }
    }

    // Smart transportType detection
    const anyInternational = 
      unifiedLocations.international.includes(updatedData.fromCountry !== "Nigeria" ? updatedData.fromCountry : "") ||
      unifiedLocations.international.includes(updatedData.fromState === "" ? updatedData.fromCountry : "") || 
      unifiedLocations.international.includes(updatedData.toCountry !== "Nigeria" ? updatedData.toCountry : "") ||
      unifiedLocations.international.includes(updatedData.toState === "" ? updatedData.toCountry : "");

    // Simpler check: is the selection in the international list?
    const fromIsIntl = unifiedLocations.international.includes(value) && type === "origin" || 
                      (type === "destination" && unifiedLocations.international.includes(updatedData.fromCountry !== "Nigeria" ? updatedData.fromCountry : ""));
    const toIsIntl = (type === "destination" && unifiedLocations.international.includes(value)) ||
                    (type === "origin" && unifiedLocations.international.includes(updatedData.toCountry !== "Nigeria" ? updatedData.toCountry : ""));

    if (fromIsIntl || toIsIntl) {
      updatedData.transportType = "international";
    } else {
      updatedData.transportType = "inter-state";
    }

    setSearchData(updatedData);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!showDetails) {
      setShowDetails(true);
      return;
    }
    navigate("/search", { state: searchData });
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setSearchData({
      ...searchData,
      length: preset.l,
      width: preset.w,
      height: preset.h,
      weight: preset.weight,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <section className="relative bg-neutral-900 overflow-hidden py-16 sm:py-24 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #EF4444 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="container-custom max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-primary/30">
                <FaTruck />
                Global Shipping
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-raleway font-black mb-6 leading-tight">
                Ship Now, <br />
                <span className="text-primary">Worldwide.</span>
              </h1>
              <p className="text-lg text-neutral-400 mb-8 max-w-lg leading-relaxed">
                Experience the gold standard in logistics. Fast, reliable, and secure freight services across Africa and beyond.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                    <FaShieldAlt />
                  </div>
                  <span className="text-sm font-medium text-neutral-300">Safe Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
                    <FaClock />
                  </div>
                  <span className="text-sm font-medium text-neutral-300">On-time Everytime</span>
                </div>
              </div>
            </div>

            {/* Right side - DHL STYLE SEARCH CARD */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 w-full max-w-xl mx-auto lg:mx-0 relative">
              <form onSubmit={handleSearch} className="p-5 sm:p-8 space-y-6">
                {!showDetails ? (
                  <>
                    {/* Origin/Destination Fields Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Where from?</label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <select
                            value={searchData.fromState || searchData.fromCountry || ""}
                            onChange={(e) => handleLocationChange("origin", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary font-medium appearance-none text-sm sm:text-base pointer-events-auto"
                            required>
                            <option value="">Origin</option>
                            <optgroup label="Nigeria">
                              {unifiedLocations.nigeria.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </optgroup>
                            <optgroup label="International">
                              {unifiedLocations.international.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Where to?</label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <select
                            value={searchData.toState || searchData.toCountry || ""}
                            onChange={(e) => handleLocationChange("destination", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary font-medium appearance-none text-sm sm:text-base"
                            required>
                            <option value="">Destination</option>
                            <optgroup label="Nigeria">
                              {unifiedLocations.nigeria.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </optgroup>
                            <optgroup label="International">
                              {unifiedLocations.international.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Shipping Date</label>
                      <MaterialDatePicker
                        label="Date"
                        value={searchData.date}
                        onChange={(dateObj) => {
                          if (dateObj) {
                            const year = dateObj.getFullYear();
                            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
                            const day = String(dateObj.getDate()).padStart(2, "0");
                            setSearchData({ ...searchData, date: `${year}-${month}-${day}` });
                          }
                        }}
                        minDate={new Date()}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-xl transition-all flex items-center justify-center gap-3">
                      Describe Your Shipment
                      <FaArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="space-y-6 pb-20 sm:pb-0">
                    {/* Brand Themed Expanded Box */}
                    <div className="bg-primary/5 -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 p-6 sm:p-8 space-y-6 animate-fadeIn border-b border-primary/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-raleway font-black uppercase tracking-tight text-xl sm:text-2xl text-charcoal">Shipment Details</h3>
                        <button 
                          type="button"
                          onClick={() => setShowDetails(false)}
                          className="text-primary hover:text-primary-dark text-xs font-bold uppercase underline">
                          Go Back
                        </button>
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {DHL_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset)}
                            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${
                              selectedPreset === preset.id
                                ? "bg-white border-primary shadow-lg"
                                : "bg-white/50 border-transparent hover:bg-white hover:shadow-md"
                            }`}>
                            <div className={`text-xl sm:text-2xl ${selectedPreset === preset.id ? "text-primary" : "text-charcoal/40"}`}>
                              {preset.icon}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-charcoal">{preset.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Manual Dimension Fields */}
                      <div>
                        <p className="text-[10px] font-black uppercase text-charcoal tracking-widest mb-3 text-center sm:text-left">Dimensions (CM)</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-neutral-400 tracking-widest block text-center">L</label>
                            <input
                              type="number"
                              placeholder="L"
                              value={searchData.length}
                              onChange={(e) => setSearchData({...searchData, length: e.target.value})}
                              className="w-full px-1 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-bold text-center border border-neutral-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-neutral-400 tracking-widest block text-center">W</label>
                            <input
                              type="number"
                              placeholder="W"
                              value={searchData.width}
                              onChange={(e) => setSearchData({...searchData, width: e.target.value})}
                              className="w-full px-1 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-bold text-center border border-neutral-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-neutral-400 tracking-widest block text-center">H</label>
                            <input
                              type="number"
                              placeholder="H"
                              value={searchData.height}
                              onChange={(e) => setSearchData({...searchData, height: e.target.value})}
                              className="w-full px-1 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-bold text-center border border-neutral-100 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Weight Field */}
                      <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm transition-all focus-within:border-primary">
                        <div className="text-primary text-lg sm:text-xl">
                          <FaWeightHanging />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[9px] font-black uppercase text-charcoal tracking-widest block">Total Weight (kg)</label>
                          <input
                            type="number"
                            placeholder="0.0"
                            step="0.1"
                            value={searchData.weight}
                            onChange={(e) => setSearchData({...searchData, weight: e.target.value})}
                            className="w-full bg-transparent text-lg sm:text-xl font-bold focus:outline-none placeholder:text-charcoal/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Final Actions - Static on Desktop, Hidden on Mobile Sticky to avoid double buttons */}
                    <div className="p-2 space-y-4 hidden sm:block">
                        <div className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                          By clicking "Find Carriers", you agree that your shipment adheres to international shipping standards and restricted items policies.
                        </div>
                        <button
                          type="submit"
                          className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-xl transition-all flex items-center justify-center gap-3">
                          Find Carriers
                          <FaArrowRight size={14} />
                        </button>
                    </div>

                    {/* Mobile Sticky CTA */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:hidden z-50 animate-slideUp">
                       <button
                          type="submit"
                          className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/30">
                          Find Carriers
                          <FaArrowRight size={14} />
                        </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-b border-neutral-100 px-4">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
             <div className="flex items-center gap-4 bg-neutral-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">
                  <FaShieldAlt />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Insured Shipping</h4>
                  <p className="text-xs text-neutral-500">Protection for goods</p>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-neutral-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">
                  <FaClock />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Real-time Track</h4>
                  <p className="text-xs text-neutral-500">Always know location</p>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-neutral-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">
                  <FaCheckCircle />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Verified Fleets</h4>
                  <p className="text-xs text-neutral-500">Trusted transit partners</p>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-neutral-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">
                  <FaHandHoldingHeart />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Support 24/7</h4>
                  <p className="text-xs text-neutral-500">Dedicated assistance</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewSection />

      <Footer />
    </div>
  );
};

export default FreightLanding;
