import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Pagination from "../../components/Pagination";
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
} from "react-icons/fa";

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
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exactMatch, setExactMatch] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [tripsPerPage, setTripsPerPage] = useState(10);
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
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
      setSearchParams({ ...location.state, companyId: companyId || "" });
    } else if (companyId || urlTransportType) {
      // If no location state but params are in URL, update them
      setSearchParams(prev => ({ 
        ...prev, 
        companyId: companyId || prev.companyId,
        transportType: urlTransportType || prev.transportType 
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

      let response = await tripAPI.getAllTrips(params);
      let foundTrips = response.data.trips;

      if (searchParams.transportType && searchParams.transportType !== "all") {
        foundTrips = foundTrips.filter((trip) =>
          trip.transportType?.toLowerCase().includes(searchParams.transportType.toLowerCase()),
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

        const fallbackResponse = await tripAPI.getAllTrips(fallbackParams);
        let fallbackTrips = fallbackResponse.data.trips;

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
    if (trip.serviceCategory === "freight") {
      navigate("/booking/freight-info", {
        state: { tripData: trip, searchDate: searchParams.date },
      });
    } else {
      navigate("/booking/passenger-info", {
        state: { tripData: trip, searchDate: searchParams.date, isDepositOnly },
      });
    }
  };

  // Search and Type filtering logic
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

    // Type filter
    if (activeTypeFilter === "all") return true;
    if (activeTypeFilter === "carpooling") return trip.transportType === "carpooling";
    if (activeTypeFilter === "inter-state") return trip.transportType === "inter-state" && trip.fromState !== trip.toState;
    if (activeTypeFilter === "intra-state") return trip.transportType === "inter-state" && trip.fromState === trip.toState;
    
    return true;
  });

  // Pagination logic
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const groupedTrips = {
    "Local Trips": currentTrips.filter((t) => ["inter-state", "carpooling"].includes(t.transportType)),
    "International Trips": currentTrips.filter(
      (t) => t.transportType === "international",
    ),
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
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Carpool
                      </span>
                    )}
                  </div>
                </div>
              </div>

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
                  <div className="flex items-center gap-1.5">
                    <FaTruck className="text-neutral-400 text-xs" />
                    <p className="font-bold text-charcoal text-sm capitalize truncate">
                      {trip.vehicleType || (isFreight ? "Truck" : "Bus")}
                    </p>
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
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  {isFreight ? "Starting From" : "Per Seat"}
                </p>
                <div className="flex items-center md:justify-end gap-1">
                  <span className="text-sm font-bold text-primary">₦</span>
                  <span className="text-3xl font-black text-primary">
                    {Number(isFreight ? (trip.minCharge || trip.price) : trip.price).toLocaleString()}
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
   return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-neutral-500 hover:text-primary mb-4 transition-colors font-semibold">
              <FaArrowLeft size={14} />
              Back to search
            </button>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal mb-2">
                {searchParams.companyId ? "Direct Booking Page" : "Search Results"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500 font-medium">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>
                    {searchParams.from || "Any Location"}
                  </span>
                  <span className="mx-1 text-neutral-300">→</span>
                  <span>
                    {searchParams.to || "Any Destination"}
                  </span>
                </div>
                {searchParams.date && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300 hidden sm:inline">|</span>
                    <FaClock className="text-primary" />
                    <span>
                      {new Date(searchParams.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {searchParams.transportType !== "all" && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-300 hidden sm:inline">|</span>
                    <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-semibold capitalize">
                      {searchParams.transportType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mr-2">Quick Filter:</span>
              {[
                { id: 'all', label: 'All Trips' },
                { id: 'inter-state', label: 'Inter-state' },
                { id: 'intra-state', label: 'Intra-state' },
                { id: 'carpooling', label: 'Carpooling' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveTypeFilter(filter.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                    activeTypeFilter === filter.id
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "bg-white border-neutral-200 text-neutral-500 hover:border-primary/30 hover:text-primary"
                  }`}>
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Filter results..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <FaBus size={14} />
              </div>
            </div>
          </div>

          {/* Main Results Area */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <FaSpinner className="animate-spin text-5xl text-primary mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">Finding the best trips for you...</p>
              </div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-neutral-200 shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mx-auto mb-6">
                  <FaBus size={32} />
                </div>
                <h2 className="text-xl font-bold text-charcoal mb-3">No matching trips found</h2>
                <p className="text-neutral-500 mb-8 leading-relaxed">
                  We couldn't find any trips that match your current filters. Try adjusting your criteria.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="secondary" onClick={() => {
                    setActiveTypeFilter('all');
                    setSearchTerm('');
                  }}>
                    Reset Filters
                  </Button>
                  <Button variant="primary" onClick={() => navigate("/")}>
                    New Search
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {currentTrips.map((trip) => renderTripCard(trip))}
              </div>

              {/* Advanced Pagination */}
              <div className="mt-12 bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  itemsPerPage={tripsPerPage}
                  totalItems={filteredTrips.length}
                  onItemsPerPageChange={(val) => {
                    setTripsPerPage(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
