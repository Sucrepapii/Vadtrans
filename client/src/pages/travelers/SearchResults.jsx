import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { tripAPI } from "../../services/api";
import {
  FaBus,
  FaCar,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
  FaArrowLeft,
  FaTruck,
  FaCheckCircle,
  FaFilter,
  FaSyncAlt,
  FaSnowflake,
  FaPaw,
  FaMusic,
  FaSmoking,
  FaSmokingBan,
  FaSuitcase,
  FaShieldAlt,
  FaCalendar,
  FaBox,
  FaTimes,
} from "react-icons/fa";
import Pagination from "../../components/Pagination";

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams] = useSearchParams();
  const companyId = urlSearchParams.get("companyId");
  const urlTransportType = urlSearchParams.get("transportType");

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: getTodayDate(),
    transportType: "all",
    serviceCategory: "passenger",
    freightType: "",
    companyId: companyId || "",
  });
  const [localSearchParams, setLocalSearchParams] = useState({
    from: "",
    to: "",
    date: getTodayDate(),
    transportType: "all",
  });

  useEffect(() => {
    setLocalSearchParams({
      from: searchParams.from || "",
      to: searchParams.to || "",
      date: searchParams.date || getTodayDate(),
      transportType: searchParams.transportType || "all",
    });
  }, [searchParams]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (localSearchParams.transportType === "private") {
      navigate("/request-private-ride", { state: { 
        from: localSearchParams.from, 
        to: localSearchParams.to, 
        date: localSearchParams.date 
      } });
      return;
    }
    setSearchParams(prev => ({
      ...prev,
      ...localSearchParams
    }));
  };

  // Debounce form inputs to automatically trigger search after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger if localSearchParams actually differs from searchParams
      if (
        localSearchParams.from !== searchParams.from ||
        localSearchParams.to !== searchParams.to ||
        localSearchParams.date !== searchParams.date ||
        localSearchParams.transportType !== searchParams.transportType
      ) {
        if (localSearchParams.transportType === "private") {
          navigate("/request-private-ride", { state: { 
            from: localSearchParams.from, 
            to: localSearchParams.to, 
            date: localSearchParams.date 
          } });
          return;
        }
        
        setSearchParams((prev) => ({
          ...prev,
          ...localSearchParams,
        }));
      }
    }, 450); // 450ms debounce delay

    return () => clearTimeout(timer);
  }, [localSearchParams, searchParams.from, searchParams.to, searchParams.date, searchParams.transportType, navigate]);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStops, setSelectedStops] = useState({}); // { tripId: stopIndex }
  const [exactMatch, setExactMatch] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Trigger login redirect for company booking links
  useEffect(() => {
    if (companyId && !isAuthenticated && !authLoading) {
      toast.info("Please login to view this company's booking page", {
        toastId: "company-auth-redirect",
      });
      navigate("/signin", {
        replace: true,
        state: { from: location.pathname + location.search }
      });
    }
  }, [companyId, isAuthenticated, authLoading, navigate, location]);

  useEffect(() => {
    // Get search params from location state or URL
    if (location.state) {
      const stateData = { ...location.state, companyId: companyId || "" };
      if (stateData.transportType === "intra-state") {
        stateData.transportType = "carpooling";
      }
      setSearchParams(stateData);
    } else if (companyId || urlTransportType) {
      // If no location state but params are in URL, update them
      setSearchParams(prev => ({ 
        ...prev, 
        companyId: companyId || prev.companyId,
        transportType: urlTransportType === "intra-state" ? "carpooling" : (urlTransportType || prev.transportType)
      }));
    }
  }, [location, companyId, urlTransportType]);

  useEffect(() => {
    // Fetch trips when search params change
    if (
      searchParams.from ||
      searchParams.to ||
      searchParams.transportType !== "all"
    ) {
      fetchTrips();
    } else {
      // Fetch all trips if no filters
      fetchTrips();
    }
  }, [searchParams]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setExactMatch(true);

      const params = { status: "active" };

      if (searchParams.from) params.from = searchParams.from;
      if (searchParams.to) params.to = searchParams.to;
      if (searchParams.date) params.date = searchParams.date;
      if (searchParams.serviceCategory)
        params.serviceCategory = searchParams.serviceCategory;
      if (searchParams.freightType)
        params.freightType = searchParams.freightType;
      if (searchParams.companyId)
        params.companyId = searchParams.companyId;
      if (searchParams.transportType !== "all")
        params.transportType = searchParams.transportType;
      if (searchParams.fromState) params.fromState = searchParams.fromState;
      if (searchParams.toState) params.toState = searchParams.toState;
      if (searchParams.fromCountry) params.fromCountry = searchParams.fromCountry;
      if (searchParams.toCountry) params.toCountry = searchParams.toCountry;

      let response = await tripAPI.getAllTrips(params);
      let foundTrips = response.data?.trips || [];

      // Transform backend intra-state trips to carpooling for UI consistency
      foundTrips = foundTrips.map((trip) => {
        const isIntraState =
          trip.transportType === "intra-state" ||
          (trip.transportType === "inter-state" &&
            trip.fromState &&
            trip.toState &&
            trip.fromState === trip.toState);
        return {
          ...trip,
          transportType: isIntraState ? "carpooling" : trip.transportType,
        };
      });

      if (searchParams.transportType && searchParams.transportType !== "all") {
        foundTrips = foundTrips.filter((trip) =>
          trip.transportType
            ?.toLowerCase()
            .includes(searchParams.transportType.toLowerCase()),
        );
      }

      // If no trips found for the EXACT route, fetch ALL available trips for the category as fallback
      if (foundTrips.length === 0 && (searchParams.from || searchParams.to)) {
        setExactMatch(false);
        const fallbackParams = { status: "active" };
        if (searchParams.serviceCategory)
          fallbackParams.serviceCategory = searchParams.serviceCategory;
        if (searchParams.freightType)
          fallbackParams.freightType = searchParams.freightType;
        if (searchParams.companyId)
          fallbackParams.companyId = searchParams.companyId;
        if (searchParams.transportType !== "all")
          fallbackParams.transportType = searchParams.transportType;
        if (searchParams.fromState) fallbackParams.fromState = searchParams.fromState;
        if (searchParams.toState) fallbackParams.toState = searchParams.toState;
        if (searchParams.fromCountry) fallbackParams.fromCountry = searchParams.fromCountry;
        if (searchParams.toCountry) fallbackParams.toCountry = searchParams.toCountry;

        const fallbackResponse = await tripAPI.getAllTrips(fallbackParams);
        let fallbackTrips = fallbackResponse.data?.trips || [];

        // Transform backend intra-state trips to carpooling for UI consistency
        fallbackTrips = fallbackTrips.map((trip) => {
          const isIntraState =
            trip.transportType === "intra-state" ||
            (trip.transportType === "inter-state" &&
              trip.fromState &&
              trip.toState &&
              trip.fromState === trip.toState);
          return {
            ...trip,
            transportType: isIntraState ? "carpooling" : trip.transportType,
          };
        });

        if (
          searchParams.transportType &&
          searchParams.transportType !== "all"
        ) {
          fallbackTrips = fallbackTrips.filter((trip) =>
            trip.transportType.includes(searchParams.transportType),
          );
        }
        foundTrips = fallbackTrips;
      }

      setTrips(foundTrips);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error(error.response?.data?.message || "Failed to load trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (trip) => {
    if (trip?.serviceCategory === "freight") return FaTruck;
    if (trip?.transportType === "carpooling") return FaCar;
    return FaBus;
  };

  const getTransportLabel = (type) => {
    if (type === "international") return "International";
    if (type === "carpooling") return "Carpooling";
    return "Local";
  };

  const handleSelectTrip = (trip, isDepositOnly = false) => {
    // Check if user manually selected a stop from the dropdown
    const manualStopIndex = selectedStops[trip.id];
    let selectedDestination = trip.to;
    let selectedPrice = trip.price;

    if (manualStopIndex !== undefined && manualStopIndex !== -1) {
      const stop = trip.stops[manualStopIndex];
      selectedDestination = stop.city;
      selectedPrice = stop.price;
    } else {
      // Auto-detect if we are booking for a specific stop based on search params
      const searchCity = (searchParams.to || "").toLowerCase();
      const stopMatch = trip.stops?.find(s => s.city.toLowerCase().includes(searchCity));
      
      if (stopMatch) {
        selectedDestination = stopMatch.city;
        selectedPrice = stopMatch.price;
      }
    }
    
    const bookingData = {
      ...trip,
      selectedDestination,
      selectedPrice
    };

    if (trip.serviceCategory === "freight") {
      navigate("/booking/freight-info", {
        state: { tripData: bookingData, searchDate: searchParams.date },
      });
    } else {
      navigate("/booking/passenger-info", {
        state: { tripData: bookingData, searchDate: searchParams.date, isDepositOnly },
      });
    }
  };

  // Search and Category filtering logic
  const filteredTrips = trips.filter((trip) => {
    // Search term filter
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      (trip.from && trip.from.toLowerCase().includes(term)) ||
      (trip.to && trip.to.toLowerCase().includes(term)) ||
      (trip.company?.name && trip.company.name.toLowerCase().includes(term)) ||
      (trip.terminal && trip.terminal.toLowerCase().includes(term)) ||
      (trip.vehicleType && trip.vehicleType.toLowerCase().includes(term))
    );

    if (!matchesSearch) return false;

    // Transport type filter
    if (activeFilter === "inter-state") {
      return trip.transportType === "inter-state";
    }
    if (activeFilter === "carpooling") {
      return trip.transportType === "carpooling";
    }
    if (activeFilter === "international") {
      return trip.transportType === "international";
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const currentTrips = filteredTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const groupedTrips = {
    "Search Results": currentTrips,
  };

  const renderPreferences = (preferences) => {
    if (!preferences) return null;
    
    const prefList = [
      { key: 'ac', icon: FaSnowflake, label: 'AC' },
      { key: 'pets', icon: FaPaw, label: 'Pets' },
      { key: 'music', icon: FaMusic, label: 'Music' },
      { key: 'smoking', icon: preferences.smoking ? FaSmoking : FaSmokingBan, label: 'Smoking' },
    ];

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {prefList.map(pref => (
          <div 
            key={pref.key} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
              preferences[pref.key] 
              ? "bg-green-50 border-green-100 text-green-700" 
              : "bg-neutral-50 border-neutral-100 text-neutral-400 opacity-60"
            }`}
            title={pref.label}
          >
            <pref.icon className="text-xs" />
            <span className="uppercase tracking-tight">{pref.label}</span>
          </div>
        ))}
        {preferences.luggage && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-700">
            <FaSuitcase className="text-xs" />
            <span className="uppercase tracking-tight">{preferences.luggage}</span>
          </div>
        )}
      </div>
    );
  };

  const renderTripCard = (trip) => {
    const Icon = getTransportIcon(trip);
    const isFreight = trip.serviceCategory === "freight";

    return (
      <Card key={trip.id} className="hover:shadow-lg transition-shadow border-l-4 overflow-hidden" style={{ borderLeftColor: isFreight ? '#EF4444' : '#3B82F6' }}>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isFreight ? 'bg-red-50' : trip.transportType === 'carpooling' ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <Icon className={`text-2xl ${isFreight ? 'text-red-600' : trip.transportType === 'carpooling' ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-charcoal truncate">
                    {trip.from} → {trip.to}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {trip.company?.avatar ? (
                      <img
                        src={trip.company.avatar}
                        alt="Company Logo"
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[8px] text-neutral-600 font-bold">
                        {trip.company?.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {trip.company?.name || "VadTrans Company"}
                    </p>
                    {trip.transportType === "carpooling" && (
                      <div className="flex items-center gap-1.5">
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Carpool
                        </span>
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                          <FaShieldAlt className="text-[8px]" />
                          <span>Verified Driver</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {trip.transportType === "carpooling" && renderPreferences(trip.preferences)}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Departure</p>
                  <div className="flex items-center gap-1.5">
                    <FaClock className="text-neutral-400 text-xs" />
                    <span className="font-bold text-charcoal text-sm">
                      {trip.departureTime}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    {isFreight ? "Capacity" : "Availability"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {isFreight ? (
                      <FaBox className="text-neutral-400 text-xs" />
                    ) : (
                      <FaStar className="text-neutral-400 text-xs" />
                    )}
                    <p className="font-bold text-charcoal text-sm">
                      {isFreight
                        ? `${trip.maxWeightCapacity || 0} kg`
                        : trip.transportType === "carpooling"
                        ? `${trip.seats - trip.availableSeats} / ${trip.seats} seats booked`
                        : `${trip.availableSeats} / ${trip.seats} seats`}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Vehicle</p>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <FaCar className="text-neutral-400 text-xs" />
                      <p className="font-bold text-charcoal text-sm capitalize truncate">
                        {trip.vehicleName || (isFreight ? "Carrier" : "Bus/Car")}
                      </p>
                    </div>
                    {trip.vehicleName && (
                      <p className="text-[10px] text-neutral-500 font-medium">
                        {trip.vehicleType}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {trip.terminal && (
                <div className="mt-4 flex items-start gap-2 bg-neutral-900/5 p-2 rounded-lg border border-neutral-900/5">
                  <FaMapMarkerAlt className="text-neutral-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-neutral-600">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">Terminal</span>
                    {trip.terminal}
                  </p>
                </div>
              )}

              {trip.transportType === "carpooling" && trip.stops?.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50/30 rounded-xl border border-blue-100/50">
                  <p className="text-[10px] uppercase font-bold text-blue-400 mb-2 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-[8px]" /> Route Stops & Prices
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Filter out duplicates and the final destination if it's already in stops
                      const uniqueStops = [];
                      const seenCities = new Set();
                      
                      // Process intermediate stops
                      trip.stops.forEach(stop => {
                        const cityKey = stop.city.toLowerCase().trim();
                        if (!seenCities.has(cityKey)) {
                          uniqueStops.push(stop);
                          seenCities.add(cityKey);
                        }
                      });

                      // Add final destination if not already seen
                      const finalCityKey = trip.to.toLowerCase().trim();
                      if (!seenCities.has(finalCityKey)) {
                        uniqueStops.push({ city: trip.to, price: trip.price, isFinal: true });
                      } else {
                        // Mark the existing stop as final if it matches
                        const finalStop = uniqueStops.find(s => s.city.toLowerCase().trim() === finalCityKey);
                        if (finalStop) finalStop.isFinal = true;
                      }

                      return uniqueStops.map((stop, i) => (
                        <div key={i} className={`bg-white px-2 py-1 rounded-md border flex items-center gap-1.5 shadow-sm ${stop.isFinal ? 'border-primary/20' : 'border-blue-100'}`}>
                          <span className="text-[10px] font-bold text-charcoal">{stop.city}{stop.isFinal && " (Final)"}</span>
                          <span className={`text-[9px] font-bold px-1 rounded ${stop.isFinal ? 'text-primary bg-primary/5' : 'text-blue-600 bg-blue-50'}`}>
                            ₦{Number(stop.price).toLocaleString()}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
              <div className="text-left md:text-right">
                {/* Destination Stop Selection */}
                {trip.stops?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                      Select Your Destination
                    </label>
                    <select
                      value={selectedStops[trip.id] ?? -1}
                      onChange={(e) => setSelectedStops(prev => ({ ...prev, [trip.id]: parseInt(e.target.value) }))}
                      className="w-full md:w-48 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="-1">{trip.to} (Final Destination)</option>
                      {trip.stops
                        .filter(stop => stop.city.toLowerCase().trim() !== trip.to.toLowerCase().trim())
                        .map((stop, idx) => {
                          // Find original index in trip.stops for state management
                          const originalIdx = trip.stops.indexOf(stop);
                          return (
                            <option key={originalIdx} value={originalIdx}>
                              {stop.city} (Stop)
                            </option>
                          );
                        })}
                    </select>
                  </div>
                )}

                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  {isFreight ? "Starting From" : "Per Seat"}
                </p>
                <div className="flex items-center md:justify-end gap-1">
                  <span className="text-sm font-bold text-primary">₦</span>
                  <span className="text-3xl font-black text-primary">
                    {(() => {
                      // Priority 1: User selection from dropdown
                      const manualStopIndex = selectedStops[trip.id];
                      if (manualStopIndex !== undefined && manualStopIndex !== -1) {
                        return Number(trip.stops[manualStopIndex].price).toLocaleString();
                      }
                      
                      // Priority 2: Match from search params
                      const searchCity = searchParams.to.toLowerCase();
                      const stopMatch = trip.stops?.find(s => s.city.toLowerCase().includes(searchCity));
                      const priceToUse = stopMatch ? stopMatch.price : trip.price;
                      
                      return Number(isFreight ? (trip.minCharge || trip.price) : priceToUse).toLocaleString();
                    })()}
                  </span>
                </div>
              </div>
              
              {trip.transportType === "carpooling" ? (
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Button
                    variant="primary"
                    onClick={() => handleSelectTrip(trip, false)}
                    disabled={trip.availableSeats === 0}
                    className="whitespace-nowrap font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow-lg transition-all">
                    {trip.availableSeats === 0 ? "Fully Booked" : "Book Seat"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleSelectTrip(trip)}
                  disabled={
                    trip.availableSeats === 0 &&
                    !isFreight
                  }
                  className={`whitespace-nowrap font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow-lg transition-all ${
                    isFreight ? "shadow-primary/20" : ""
                  }`}>
                  {trip.availableSeats === 0 && !isFreight
                    ? "Sold Out"
                    : isFreight
                      ? "Ship with this carrier"
                      : "Reserve a Seat"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-6xl">
          {/* Header with Back Button & Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-sm">
                  <FaArrowLeft />
                  <span className="hidden sm:inline">Back to Search</span>
                </Button>
              </div>

              {/* Filter Buttons in Header */}
              <div className="flex flex-wrap items-center gap-2 bg-neutral-100/50 p-1 rounded-2xl border border-neutral-200">
                {[
                  { id: "all", label: "All" },
                  { id: "inter-state", label: "Inter-State" },
                  { id: "carpooling", label: "Carpooling" },
                  { id: "international", label: "International" },
                  { id: "private", label: " Private Ride" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      if (filter.id === "private") {
                        navigate("/request-private-ride", { state: { 
                          from: searchParams.from, 
                          to: searchParams.to, 
                          date: searchParams.date 
                        } });
                        return;
                      }
                      setActiveFilter(filter.id);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      activeFilter === filter.id
                        ? "bg-white text-primary shadow-sm ring-1 ring-neutral-200"
                        : "text-neutral-500 hover:text-primary hover:bg-white/50"
                    }`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <h1 className="text-2xl font-raleway font-bold text-charcoal mb-2">
              {searchParams.companyId ? "Direct Booking Page" : "Search Results"}
            </h1>

            {/* Premium Re-Search Bar */}
            {!searchParams.companyId && (
              <form onSubmit={handleFormSubmit} className="mt-6 mb-8 p-4 bg-white rounded-2xl shadow-xl shadow-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="relative group">
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[10px] font-bold text-primary uppercase tracking-widest z-10">From</label>
                    <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-200 group-focus-within:border-primary transition-all">
                      <FaMapMarkerAlt className="ml-3 text-neutral-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        value={localSearchParams.from} 
                        onChange={(e) => setLocalSearchParams({...localSearchParams, from: e.target.value})}
                        className="w-full px-3 py-3 bg-transparent text-sm font-medium outline-none"
                        placeholder="Departure city"
                      />
                      {localSearchParams.from && (
                        <button 
                          type="button"
                          onClick={() => setLocalSearchParams({...localSearchParams, from: ""})}
                          className="mr-2 p-1 text-neutral-400 hover:text-primary transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[10px] font-bold text-primary uppercase tracking-widest z-10">To</label>
                    <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-200 group-focus-within:border-primary transition-all">
                      <FaMapMarkerAlt className="ml-3 text-neutral-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        value={localSearchParams.to} 
                        onChange={(e) => setLocalSearchParams({...localSearchParams, to: e.target.value})}
                        className="w-full px-3 py-3 bg-transparent text-sm font-medium outline-none"
                        placeholder="Destination city"
                      />
                      {localSearchParams.to && (
                        <button 
                          type="button"
                          onClick={() => setLocalSearchParams({...localSearchParams, to: ""})}
                          className="mr-2 p-1 text-neutral-400 hover:text-primary transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  </div>
 
                  <div className="relative group">
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[10px] font-bold text-primary uppercase tracking-widest z-10">Date</label>
                    <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-200 group-focus-within:border-primary transition-all">
                      <FaCalendar className="ml-3 text-neutral-400 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="date" 
                        value={localSearchParams.date} 
                        onChange={(e) => setLocalSearchParams({...localSearchParams, date: e.target.value})}
                        className="w-full px-3 py-3 bg-transparent text-sm font-medium outline-none"
                      />
                    </div>
                  </div>
 
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <label className="absolute left-3 -top-2 px-1 bg-white text-[10px] font-bold text-primary uppercase tracking-widest z-10">Type</label>
                      <div className="flex items-center bg-neutral-50 rounded-xl border border-neutral-200 group-focus-within:border-primary transition-all">
                        <FaCar className="ml-3 text-neutral-400 group-focus-within:text-primary transition-colors" />
                        <select 
                          value={localSearchParams.transportType} 
                          onChange={(e) => setLocalSearchParams({...localSearchParams, transportType: e.target.value})}
                          className="w-full px-3 py-3 bg-transparent text-sm font-medium outline-none appearance-none"
                        >
                          <option value="all">All Types</option>
                          <option value="inter-state">Inter-State</option>
                          <option value="carpooling">Carpooling</option>
                          <option value="international">International</option>
                          <option value="private" className="font-bold text-primary"> Private Ride</option>
                        </select>
                      </div>
                    </div>
                    <Button 
                      type="submit"
                      variant="primary" 
                      className="px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      <FaSyncAlt className={loading ? "animate-spin" : ""} />
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {searchParams.companyId && trips.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-center gap-4">
                {trips[0].company?.avatar ? (
                  <img
                    src={trips[0].company.avatar}
                    alt={trips[0].company.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border-2 border-white shadow-sm">
                    {trips[0].company?.name?.charAt(0) || "C"}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-charcoal leading-tight">
                    {trips[0].company?.name}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1 flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" /> Verified Transport Provider
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-neutral-600">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" />
                <span className="font-medium text-sm">
                  {searchParams.transportType === "international" && searchParams.fromCountry ? (
                    `${searchParams.fromState ? searchParams.fromState + ", " : ""}${searchParams.fromCountry}`
                  ) : searchParams.from || "Any"}
                  {" → "}
                  {searchParams.transportType === "international" && searchParams.toCountry ? (
                    `${searchParams.toState ? searchParams.toState + ", " : ""}${searchParams.toCountry}`
                  ) : searchParams.to || "Any"}
                </span>
              </div>
              {searchParams.date && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-300 hidden sm:inline">|</span>
                  <FaClock className="text-primary" />
                  <span className="text-sm">
                    {new Date(searchParams.date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {searchParams.transportType !== "all" && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-300 hidden sm:inline">|</span>
                  <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-semibold capitalize">
                    {searchParams.transportType === "international" ? "International" : "Local"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FaSpinner className="animate-spin text-5xl text-primary mx-auto mb-4" />
                <p className="text-neutral-600">Searching for trips...</p>
              </div>
            </div>
          ) : trips.length === 0 ? (
            <Card>
              <div className="text-center py-16">
                <p className="text-neutral-600 mb-4 text-lg">No trips found</p>
                <div className="flex justify-center">
                  <Button variant="primary" onClick={() => navigate("/")}>
                    Search Other Routes
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {!exactMatch && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-orange-800">
                        No exact matches found
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        We couldn't find exact routes for your search. Here are
                        all available {searchParams.serviceCategory} trips.
                      </p>
                    </div>
                  </div>
                </div>
              )}



          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <p className="text-sm sm:text-base text-neutral-600">
                  Showing {filteredTrips.length} active trip
                  {filteredTrips.length !== 1 ? "s" : ""}
                </p>
                <div className="w-full sm:w-80 relative">
                  <input
                    type="text"
                    placeholder="Filter results..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg>
                  </div>
                </div>
              </div>

              {filteredTrips.length === 0 && searchTerm && (
                <div className="text-center py-12 bg-white rounded-xl border border-neutral-200 shadow-sm mb-6">
                  <p className="text-neutral-500 text-lg mb-2">No results matched your search: "{searchTerm}"</p>
                  <Button variant="secondary" onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>
                    Clear Search
                  </Button>
                </div>
              )}

              <div className="space-y-8">
                {filteredTrips.length === 0 && !searchTerm && (
                  <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center justify-center px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-4">
                      <FaBus size={32} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-charcoal mb-2 text-center">
                      No Trips Available
                    </h3>
                    <p className="text-sm text-neutral-500 max-w-sm mx-auto text-center leading-relaxed">
                      {searchParams.companyId 
                        ? "This provider currently has no scheduled trips. Please check back later."
                        : "No trips found matching your route and date. Try adjusting your search criteria."}
                    </p>
                    <Button 
                      variant="primary" 
                      className="mt-6 font-bold"
                      onClick={() => navigate("/")}
                    >
                      Back to Search
                    </Button>
                  </div>
                )}

                {Object.entries(groupedTrips).map(
                  ([categoryName, categoryTrips]) => {
                    if (categoryTrips.length === 0) return null;
                    return (
                      <div key={categoryName}>
                        <h2 className="text-lg sm:text-xl font-bold text-charcoal mb-4 pb-2 border-b border-neutral-200">
                          {categoryName}
                        </h2>
                        <div className="space-y-4">
                          {categoryTrips.map((trip) => renderTripCard(trip))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Pagination Controls */}
              {filteredTrips.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredTrips.length}
                    onItemsPerPageChange={(val) => {
                      setItemsPerPage(val);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
