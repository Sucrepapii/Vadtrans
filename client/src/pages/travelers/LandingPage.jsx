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
import api from "../../services/api";
import { subscribeUserToPush } from "../../utils/pushHelper";
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
  FaCar,
  FaUsers,
  FaHandHoldingHeart,
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

  const [activePrivateRides, setActivePrivateRides] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "company") {
      const fetchPrivateRequests = async () => {
        try {
          const res = await api.get("/private-rides");
          const active = res.data.requests?.filter(r => !['completed', 'cancelled'].includes(r.status)) || [];
          setActivePrivateRides(active);

          // If they have active requests, prompt for push notifications
          if (active.length > 0) {
            const subscription = await subscribeUserToPush();
            if (subscription) {
              await api.post("/auth/push-subscribe", { subscription }).catch(e => console.error("Push subscribe err:", e));
            }
          }
        } catch (err) {
          console.error("Error fetching private requests:", err);
        }
      };
      fetchPrivateRequests();
    }
  }, [isAuthenticated, user]);

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
    fromState: "", // For carpooling trips
    toState: "", // For carpooling trips
    fromCountry: "Nigeria", // Default
    toCountry: "",
    serviceCategory: "passenger", // passenger or freight
    freightType: "",
    rideType: "shared", // "shared" or "private"
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
    // For both inter-state and carpooling, return the API states
    return states.map(s => s.name);
  }, [searchData.transportType, states]);

  // Get cities for selected state
  const fromCities = useMemo(() => apiFromCities, [apiFromCities]);
  const toCities = useMemo(() => apiToCities, [apiToCities]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchData.rideType === "private") {
      navigate("/request-private-ride", { state: searchData });
    } else {
      navigate("/search", { state: searchData });
    }
  };

  return (
    <div className="min-h-screen flex flex-col premium-gradient-bg">
      <Navbar variant="desktop" />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] py-12 sm:py-16 md:py-24 px-4 overflow-hidden flex items-center">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero_bus_mature.mp4" type="video/mp4" />
          </video>
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-charcoal/30"></div>
        </div>

        <div className="container-custom max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Search Form */}
            <div className="animate-slide-up">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-raleway font-black text-white mb-6 leading-none">
                Find a ride.
                <br />
                <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent drop-shadow-sm">Save money.</span>
              </h1>
              <p className="text-base sm:text-lg text-white/90 mb-8 font-medium leading-relaxed">
                Carpool with people going your way. Find a ride to work, school, or anywhere in Lagos and beyond.
              </p>

              {/* Active Private Rides Widget */}
              {activePrivateRides.length > 0 && (
                <div className="mb-6 bg-white/95 backdrop-blur-md border border-primary/30 rounded-xl p-4 shadow-xl animate-slide-up">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-charcoal flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      Your Active Private Rides
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {activePrivateRides.slice(0, 2).map(req => (
                      <div key={req.id} className="bg-white rounded-lg p-3 border border-neutral-200 flex justify-between items-center shadow-sm hover:border-primary/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">{req.rideType.replace('-', ' ')}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${req.status === 'awaiting_payment' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {req.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-charcoal">{req.pickupLocation} <span className="text-neutral-400 font-normal mx-1">→</span> {req.destination}</p>
                          {req.status === 'awaiting_payment' && (
                            <p className="text-xs text-amber-600 font-bold mt-1">Driver bid received!</p>
                          )}
                        </div>
                        <Button 
                          onClick={() => {
                            if (["driver_assigned", "en_route", "arrived", "started"].includes(req.status)) {
                              navigate('/tracking', { state: { bookingId: req.requestId } });
                            } else {
                              navigate('/request-private-ride');
                            }
                          }}
                          variant="primary" 
                          className="py-1.5 px-3 text-xs whitespace-nowrap"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {activePrivateRides.length > 2 && (
                      <button onClick={() => navigate('/my-bookings')} className="w-full text-center text-xs text-primary font-bold hover:underline pt-1">
                        View all {activePrivateRides.length} active rides
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Find/Offer Ride Interaction */}
              <div className="mb-8 p-5 bg-white/80 backdrop-blur-md rounded-premium shadow-premium border border-white/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                    Primary Feature: FIND OR SHARE A RIDE
                  </p>
                  <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                    <FaHandHoldingHeart className="text-[8px]" /> Smart Choice
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setSearchData({...searchData, transportType: 'carpooling'});
                      const searchSection = document.getElementById('search-form');
                      searchSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all border border-primary/20 group hover:-translate-y-0.5">
                    <FaUsers className="text-2xl text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-charcoal">Find a ride</span>
                    <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider mt-0.5">Eco-friendly</span>
                  </button>
                  <button 
                    onClick={() => navigate('/offer-ride')}
                    className="flex flex-col items-center justify-center p-4 bg-charcoal/5 hover:bg-charcoal/10 rounded-xl transition-all border border-charcoal/20 group hover:-translate-y-0.5">
                    <FaCar className="text-2xl text-charcoal mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-charcoal">Offer a ride</span>
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">Earn fuel fee</span>
                  </button>
                </div>
              </div>

              {/* Search Form */}
              <form
                id="search-form"
                onSubmit={handleSearch}
                className="bg-white rounded-premium shadow-premium p-6 space-y-4 border border-neutral-200/50">
                
                {(() => {
                  const activeTransportType = searchData.rideType === "private" ? "carpooling" : searchData.transportType;
                  return (
                    <>
                      {/* Ride Type Toggle */}
                      <div className="flex p-1 bg-neutral-100 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setSearchData({ ...searchData, rideType: "shared" })}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                      searchData.rideType === "shared"
                        ? "bg-white text-primary shadow-sm"
                        : "text-neutral-500 hover:text-charcoal"
                    }`}
                  >
                    Shared Ride
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchData({ ...searchData, rideType: "private" })}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${
                      searchData.rideType === "private"
                        ? "bg-white text-primary shadow-sm"
                        : "text-neutral-500 hover:text-charcoal"
                    }`}
                  >
                    Private Ride
                  </button>
                </div>

                {/* Transport Type */}
                <div className={searchData.rideType === "private" ? "hidden" : "block"}>
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
                    <option value="inter-state" disabled>Inter-State (Nigeria) - Coming Soon</option>
                    <option value="international">
                      Cross-Border (West Africa)
                    </option>
                    <option value="carpooling">
                      Carpooling (Lagos & Beyond)
                    </option>
                    <option value="freight" disabled>Freight & Logistics - Coming Soon</option>
                  </select>
                </div>

                {/* FROM LOCATION */}
                {activeTransportType === "international" ? (
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
                ) : activeTransportType === "all" ? (
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
                        {activeTransportType === "carpooling" && searchData.rideType !== "private" ? "State" : "Departure State"}
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
                        <select
                          value={searchData.fromState}
                          onChange={(e) =>
                            setSearchData({
                              ...searchData,
                              fromState: e.target.value,
                              toState: activeTransportType === "carpooling" && searchData.rideType !== "private" ? e.target.value : searchData.toState,
                              from: "",
                              to: activeTransportType === "carpooling" && searchData.rideType !== "private" ? "" : searchData.to,
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
                {activeTransportType === "international" ? (
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
                ) : activeTransportType === "all" ? (
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
                    {(activeTransportType === "inter-state" || searchData.rideType === "private") && (
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
                  {searchData.rideType === "private" ? "Request Private Ride" : "Search Trips"}
                </button>
                    </>
                  );
                })()}
              </form>
            </div>

            {/* Right side - Empty to showcase the background video */}
            <div className="hidden lg:block h-full"></div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bus / Carpooling Card */}
            <div 
              onClick={() => navigate("/search?type=carpooling")}
              className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all border border-neutral-200 cursor-pointer group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaBus className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2 font-raleway">Carpooling</h3>
              <p className="text-sm text-neutral-500 mb-4 h-12 flex items-center justify-center">
                Comfortable shared rides for city-to-city travel
              </p>
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 block mb-1">Starting from</span>
                <p className="text-xl font-bold text-primary">₦15,000</p>
              </div>
            </div>

            {/* International Card */}
            <div 
              onClick={() => navigate("/search?type=international")}
              className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all border border-neutral-200 cursor-pointer group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FaBus className="text-3xl text-blue-600 rotate-12" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2 font-raleway">International</h3>
              <p className="text-sm text-neutral-500 mb-4 h-12 flex items-center justify-center">
                Cross-border transport within West Africa
              </p>
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 block mb-1">Starting from</span>
                <p className="text-xl font-bold text-primary">₦45,000</p>
              </div>
            </div>

            {/* Inter-state Card - GATED */}
            <div className="relative bg-white rounded-2xl p-6 text-center border border-neutral-200 opacity-60 overflow-hidden cursor-not-allowed">
              <div className="absolute top-4 right-[-35px] bg-primary text-white text-[10px] font-bold py-1 px-10 rotate-45 z-10 shadow-md">
                COMING SOON
              </div>
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaBus className="text-3xl text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2 font-raleway">Inter-state</h3>
              <p className="text-sm text-neutral-500 mb-4 h-12 flex items-center justify-center">
                State-to-state travel across Nigeria
              </p>
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 block mb-1">Starting from</span>
                <p className="text-xl font-bold text-neutral-400">₦25,000</p>
              </div>
            </div>

            {/* Freight Card - GATED */}
            <div className="relative bg-white rounded-2xl p-6 text-center border border-neutral-200 opacity-60 overflow-hidden cursor-not-allowed">
              <div className="absolute top-4 right-[-35px] bg-primary text-white text-[10px] font-bold py-1 px-10 rotate-45 z-10 shadow-md">
                COMING SOON
              </div>
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaTruck className="text-3xl text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2 font-raleway">Freight</h3>
              <p className="text-sm text-neutral-500 mb-4 h-12 flex items-center justify-center">
                Fast and secure cargo delivery services
              </p>
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-400 block mb-1">Starting from</span>
                <p className="text-xl font-bold text-neutral-400">₦10,000</p>
              </div>
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
