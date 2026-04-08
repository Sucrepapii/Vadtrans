import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import MaterialDatePicker from "../../components/MaterialDatePicker";
import ReviewSection from "../../components/ReviewSection";
import { westAfricanCountries, westAfricanStates } from "../../data/locations";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";
import {
  FaMapMarkerAlt,
  FaCalendar,
  FaBus,
  FaPlane,
  FaTrain,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

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
    transportType: "all",
    fromState: "", // For intra-state trips
    toState: "", // For intra-state trips
    fromCountry: "Nigeria", // Default
    toCountry: "",
    serviceCategory: "passenger", // passenger or freight
    freightType: "",
  });

  const { states, getCitiesForState } = useLocationsAPI();
  const [apiFromCities, setApiFromCities] = useState([]);
  const [apiToCities, setApiToCities] = useState([]);

  // Fetch cities when fromState is selected
  useEffect(() => {
    let isMounted = true;
    if (searchData.fromState && searchData.transportType !== "international") {
      getCitiesForState(searchData.fromState).then(fetchedCities => {
        if (isMounted) setApiFromCities(fetchedCities || []);
      });
    } else {
      setApiFromCities([]);
    }
    return () => { isMounted = false; };
  }, [searchData.transportType, searchData.fromState, getCitiesForState]);

  // Fetch cities when toState is selected
  useEffect(() => {
    let isMounted = true;
    if (searchData.toState && searchData.transportType !== "international") {
      getCitiesForState(searchData.toState).then(fetchedCities => {
        if (isMounted) setApiToCities(fetchedCities || []);
      });
    } else {
      setApiToCities([]);
    }
    return () => { isMounted = false; };
  }, [searchData.transportType, searchData.toState, getCitiesForState]);

  // Determine location options based on transport type
  const locationOptions = useMemo(() => {
    if (searchData.transportType === "international") {
      return westAfricanCountries;
    }
    // For both inter-state and intra-state, return the API states
    return states.map(s => s.name);
  }, [searchData.transportType, states]);

  // Get cities for selected state
  const fromCities = useMemo(() => apiFromCities, [apiFromCities]);
  const toCities = useMemo(() => apiToCities, [apiToCities]);

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
                Book tickets and move cargo with ease. Safe, reliable, and
                affordable transport logistics across Nigeria and West Africa.
              </p>

              {/* Service Category Tabs */}
              <div className="flex bg-white rounded-t-lg overflow-hidden border-b border-neutral-100 shadow-md">
                <button
                  type="button"
                  onClick={() =>
                    setSearchData({
                      ...searchData,
                      serviceCategory: "passenger",
                    })
                  }
                  className={`flex-1 py-3 sm:py-4 px-2 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
                    searchData.serviceCategory === "passenger"
                      ? "bg-primary text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}>
                  <FaBus className="text-xl" />
                  <span className="hidden sm:inline">Passenger Travel</span>
                  <span className="sm:hidden">Passenger</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSearchData({ ...searchData, serviceCategory: "freight" })
                  }
                  className={`flex-1 py-3 sm:py-4 px-2 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
                    searchData.serviceCategory === "freight"
                      ? "bg-primary text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}>
                  <FaTruck className="text-xl" />
                  <span className="hidden sm:inline">Freight Transport</span>
                  <span className="sm:hidden">Freight</span>
                </button>
              </div>

              {/* Search Form */}
              <form
                onSubmit={handleSearch}
                className="bg-white rounded-b-lg shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
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
                        fromState: "",
                        toState: "",
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary sm:text-base text-base">
                    <option value="all">All Types</option>
                    <option value="inter-state">Inter-State (Nigeria)</option>
                    <option value="international">
                      International (West Africa)
                    </option>
                    <option value="intra-state">
                      Intra-State (City-to-City)
                    </option>
                  </select>
                </div>

                {/* Freight Type - Only show if serviceCategory is freight */}
                {searchData.serviceCategory === "freight" && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Freight Classification
                    </label>
                    <select
                      value={searchData.freightType || ""}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          freightType: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary sm:text-base text-base">
                      <option value="">Any Cargo Size</option>
                      <option value="Small Parcel">
                        Small Parcel (Documents, E-commerce)
                      </option>
                      <option value="Medium Cargo">
                        Medium Cargo (Boxes, Commercial goods)
                      </option>
                      <option value="Large/Bulk Cargo">
                        Large/Bulk Cargo (Industrial, FTL)
                      </option>
                    </select>
                  </div>
                )}

                {/* FROM LOCATION */}
                {searchData.transportType === "international" ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        From Country
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                        <select
                          value={searchData.fromCountry}
                          onChange={(e) =>
                            setSearchData({
                              ...searchData,
                              fromCountry: e.target.value,
                              fromState: "",
                              from: "",
                            })
                          }
                          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                          required>
                          <option value="">Select departure country</option>
                          {westAfricanCountries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {searchData.fromCountry && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          From State/Region
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                          <select
                            value={searchData.fromState}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                fromState: e.target.value,
                                from: "",
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                            required>
                            <option value="">Select state/region</option>
                            {westAfricanStates[searchData.fromCountry]?.map(
                              (state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ) : searchData.transportType === "all" ? (
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
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                        required>
                        <option value="">Select departure location</option>
                        {locationOptions.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        {searchData.transportType === "intra-state" ? "State (for city-to-city trip)" : "Departure State"}
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                        <select
                          value={searchData.fromState}
                          onChange={(e) =>
                            setSearchData({
                              ...searchData,
                              fromState: e.target.value,
                              toState: searchData.transportType === "intra-state" ? e.target.value : searchData.toState,
                              from: "",
                              to: searchData.transportType === "intra-state" ? "" : searchData.to,
                            })
                          }
                          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                          required>
                          <option value="">Select departure state</option>
                          {locationOptions.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {searchData.fromState && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          From City
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                          <select
                            value={searchData.from}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                from: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                            required>
                            <option value="">Select departure city</option>
                            {fromCities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* TO LOCATION */}
                {searchData.transportType === "international" ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        To Country
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                        <select
                          value={searchData.toCountry}
                          onChange={(e) =>
                            setSearchData({
                              ...searchData,
                              toCountry: e.target.value,
                              toState: "",
                              to: "",
                            })
                          }
                          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                          required>
                          <option value="">Select destination country</option>
                          {westAfricanCountries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {searchData.toCountry && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          To State/Region
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                          <select
                            value={searchData.toState}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                toState: e.target.value,
                                to: "",
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                            required>
                            <option value="">Select state/region</option>
                            {westAfricanStates[searchData.toCountry]?.map(
                              (state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ) : searchData.transportType === "all" ? (
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
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                        required>
                        <option value="">Select destination location</option>
                        {locationOptions.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    {searchData.transportType === "inter-state" && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          Destination State
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                          <select
                            value={searchData.toState}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                toState: e.target.value,
                                to: "",
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                            required>
                            <option value="">Select destination state</option>
                            {locationOptions.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {searchData.toState && (
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          To City
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                          <select
                            value={searchData.to}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                to: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base"
                            required>
                            <option value="">Select destination city</option>
                            {toCities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Date
                  </label>
                  <MaterialDatePicker
                    label="Date"
                    value={searchData.date}
                    onChange={(dateObj) => {
                      if (dateObj) {
                        // Create date string manually using local time to prevent timezone shift issues
                        // toISOString() converts to UTC which can shift date back by one day
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(dateObj.getDate()).padStart(2, "0");
                        const dateStr = `${year}-${month}-${day}`;
                        setSearchData({ ...searchData, date: dateStr });
                      } else {
                        setSearchData({ ...searchData, date: "" });
                      }
                    }}
                    minDate={new Date()} // Prevent past dates
                    className="w-full"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 sm:py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors sm:text-base text-base">
                  Search Trips
                </button>
              </form>
            </div>

            {/* Right side - Hero Image/Illustration */}
            <div className="mt-8 lg:mt-0 lg:block">
              <div className="relative">
                <img
                  src="/hero_bus_mature.png"
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

          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-shadow border border-neutral-200 max-w-sm w-full">
              <FaBus className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Bus</h3>
              <p className="text-neutral-600 mb-4">
                Comfortable and affordable bus services
              </p>
              <p className="text-2xl font-bold text-primary">From ₦25,000</p>
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

      {/* Reviews Section */}
      <ReviewSection />

      <Footer />
    </div>
  );
};

export default LandingPage;
