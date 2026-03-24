import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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
} from "react-icons/fa";

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    transportType: "all",
    serviceCategory: "passenger",
    freightType: "",
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exactMatch, setExactMatch] = useState(true);

  useEffect(() => {
    // Get search params from location state
    if (location.state) {
      setSearchParams(location.state);
    }
  }, [location]);

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
      if (searchParams.serviceCategory) params.serviceCategory = searchParams.serviceCategory;
      if (searchParams.freightType) params.freightType = searchParams.freightType;
      if (searchParams.transportType !== "all") params.transportType = searchParams.transportType;

      let response = await tripAPI.getAllTrips(params);
      let foundTrips = response.data.trips;

      if (searchParams.transportType && searchParams.transportType !== "all") {
        foundTrips = foundTrips.filter((trip) =>
          trip.transportType.includes(searchParams.transportType),
        );
      }

      // If no trips found for the EXACT route, fetch ALL available trips for the category as fallback
      if (foundTrips.length === 0 && (searchParams.from || searchParams.to)) {
        setExactMatch(false);
        const fallbackParams = { status: "active" };
        if (searchParams.serviceCategory) fallbackParams.serviceCategory = searchParams.serviceCategory;
        if (searchParams.freightType) fallbackParams.freightType = searchParams.freightType;
        if (searchParams.transportType !== "all") fallbackParams.transportType = searchParams.transportType;

        const fallbackResponse = await tripAPI.getAllTrips(fallbackParams);
        let fallbackTrips = fallbackResponse.data.trips;
        
        if (searchParams.transportType && searchParams.transportType !== "all") {
          fallbackTrips = fallbackTrips.filter((trip) =>
            trip.transportType.includes(searchParams.transportType),
          );
        }
        foundTrips = fallbackTrips;
      }

      setTrips(foundTrips);
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
    return FaBus;
  };

  const getTransportLabel = (type) => {
    const labels = {
      "inter-state": "Inter-State (Nigeria)",
      international: "International (West Africa)",
      "intra-state": "Intra-State (City-to-City)",
    };
    return labels[type] || type;
  };

  const handleSelectTrip = (trip) => {
    if (trip.serviceCategory === "freight") {
      navigate("/booking/freight-info", {
        state: { tripData: trip, searchDate: searchParams.date },
      });
    } else {
      navigate("/booking/passenger-info", {
        state: { tripData: trip, searchDate: searchParams.date },
      });
    }
  };


  const groupedTrips = {
    "Inter-State Trips": trips.filter(t => t.transportType === 'inter-state'),
    "Intra-State Trips": trips.filter(t => t.transportType === 'intra-state'),
    "International Trips": trips.filter(t => t.transportType === 'international'),
  };

  const renderTripCard = (trip) => {
    const Icon = getTransportIcon(trip);
    return (
      <Card key={trip.id} className="hover:shadow-lg transition-shadow">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="text-2xl sm:text-3xl text-primary" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-charcoal">
                    {trip.from} → {trip.to}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {trip.company?.avatar ? (
                      <img src={trip.company.avatar} alt="Company Logo" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-600 font-bold">
                        {trip.company?.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <p className="text-sm font-medium text-neutral-700">{trip.company?.name || "VadTrans Company"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Departure</p>
                  <div className="flex items-center gap-1 mt-1">
                    <FaClock className="text-neutral-400" />
                    <span className="font-medium text-charcoal">{trip.departureTime}</span>
                  </div>
                  {trip.operatingDays && (
                    <div className="text-[10px] text-primary font-medium mt-0.5 max-w-[120px] truncate" title={trip.operatingDays}>
                      Runs: {trip.operatingDays}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Seats Available</p>
                  <p className="font-medium text-charcoal mt-1">{trip.availableSeats} / {trip.seats}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Status</p>
                  <span className={"inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium " + (trip.status === "active" ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-800")}>
                    {trip.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Vehicle</p>
                  <p className="font-medium text-charcoal mt-1 capitalize">{trip.vehicleType || "Bus"}</p>
                </div>
                {trip.terminal && (
                  <div>
                    <p className="text-xs text-neutral-500">Terminal</p>
                    <div className="flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-neutral-400 flex-shrink-0" />
                      <p className="font-medium text-charcoal">{trip.terminal}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:ml-6">
              <div className="text-left md:text-right">
                <p className="text-xs sm:text-sm text-neutral-500">From</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">₦{Number(trip.price).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button variant="primary" onClick={() => handleSelectTrip(trip)} disabled={trip.availableSeats === 0 && trip.serviceCategory !== "freight"} className="whitespace-nowrap text-sm sm:text-base px-4 sm:px-6">
                  {trip.availableSeats === 0 && trip.serviceCategory !== "freight" ? "Sold Out" : trip.serviceCategory === "freight" ? "Book Transport" : "Select Trip"}
                </Button>
                {trip.availableSeats === 0 && (
                  <p className="text-[10px] sm:text-xs text-red-600 font-medium max-w-[150px] text-right">
                    Fully booked for today! This vehicle will be available tomorrow.
                  </p>
                )}
              </div>
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
          {/* Header with Back Button */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-sm">
                <FaArrowLeft />
                <span>Back to Search</span>
              </Button>
            </div>
            <h1 className="text-2xl font-raleway font-bold text-charcoal mb-2">
              Search Results
            </h1>
            <div className="flex items-center gap-2 text-neutral-600">
              <FaMapMarkerAlt className="text-primary" />
              <span>
                {searchParams.from || "Any"} → {searchParams.to || "Any"}
              </span>
              {searchParams.date && (
                <>
                  <span className="mx-2">•</span>
                  <FaClock className="text-primary" />
                  <span>
                    {new Date(searchParams.date).toLocaleDateString()}
                  </span>
                </>
              )}
              {searchParams.transportType !== "all" && (
                <>
                  <span className="mx-2">•</span>
                  <span className="capitalize">
                    {searchParams.transportType}
                  </span>
                </>
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
                  <Button variant="primary" onClick={() => navigate("/")}>Search Other Routes</Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {!exactMatch && (
                 <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
                   <div className="flex">
                     <div className="ml-3">
                       <h3 className="text-sm font-medium text-orange-800">No exact matches found</h3>
                       <p className="text-sm text-orange-700 mt-1">We couldn't find exact routes for your search. Here are all available {searchParams.serviceCategory} trips.</p>
                     </div>
                   </div>
                 </div>
              )}
              
              <p className="text-neutral-600 mb-6">
                Found {trips.length} available trip{trips.length !== 1 ? "s" : ""}
              </p>

              <div className="space-y-8">
                {Object.entries(groupedTrips).map(([categoryName, categoryTrips]) => {
                  if (categoryTrips.length === 0) return null;
                  return (
                    <div key={categoryName}>
                      <h2 className="text-xl font-bold text-charcoal mb-4 pb-2 border-b border-neutral-200">{categoryName}</h2>
                      <div className="space-y-4">
                        {categoryTrips.map(trip => renderTripCard(trip))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
