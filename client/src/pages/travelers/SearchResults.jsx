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
} from "react-icons/fa";

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    transportType: "all",
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Build query parameters
      const params = {
        status: "active", // Only show active trips
      };

      if (searchParams.from) params.from = searchParams.from;
      if (searchParams.to) params.to = searchParams.to;

      // Handle transport type filter
      if (searchParams.transportType !== "all") {
        // If specific type selected (bus, car, domestic, international)
        // We need to match partial transport type strings
        params.transportType = searchParams.transportType;
      }

      const response = await tripAPI.getAllTrips(params);

      // Filter trips based on transportType if not "all"
      let filteredTrips = response.data.trips;

      if (searchParams.transportType && searchParams.transportType !== "all") {
        filteredTrips = filteredTrips.filter((trip) =>
          trip.transportType.includes(searchParams.transportType),
        );
      }

      setTrips(filteredTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error(error.response?.data?.message || "Failed to load trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (type) => {
    // All transport types use bus icon
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
    navigate("/booking/passenger-info", { state: { tripData: trip } });
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
                <p className="text-neutral-600 mb-4 text-lg">
                  Still working on this destination
                </p>
                <p className="text-neutral-500 mb-6">
                  We're working hard to add routes for{" "}
                  {searchParams.from || "your location"} →{" "}
                  {searchParams.to || "your destination"}. Please check back
                  soon!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="primary" onClick={() => navigate("/")}>
                    Search Other Routes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setSearchParams({
                        from: "",
                        to: "",
                        date: "",
                        transportType: "all",
                      })
                    }>
                    View All Available Trips
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <p className="text-neutral-600 mb-4">
                Found {trips.length} trip{trips.length !== 1 ? "s" : ""}
              </p>

              <div className="space-y-4">
                {trips.map((trip) => {
                  const Icon = getTransportIcon(trip.transportType);
                  return (
                    <Card
                      key={trip.id}
                      className="hover:shadow-lg transition-shadow">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Left: Trip Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <Icon className="text-2xl sm:text-3xl text-primary" />
                              <div>
                                <h3 className="font-semibold text-base sm:text-lg text-charcoal">
                                  {trip.from} → {trip.to}
                                </h3>
                                <p className="text-sm text-neutral-600">
                                  {getTransportLabel(trip.transportType)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                              <div>
                                <p className="text-xs text-neutral-500">
                                  Departure
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <FaClock className="text-neutral-400" />
                                  <span className="font-medium text-charcoal">
                                    {trip.departureTime}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs text-neutral-500">
                                  Seats Available
                                </p>
                                <p className="font-medium text-charcoal mt-1">
                                  {trip.availableSeats} / {trip.seats}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-neutral-500">
                                  Status
                                </p>
                                <span
                                  className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    trip.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-neutral-100 text-neutral-800"
                                  }`}>
                                  {trip.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Price & Action - Horizontal on mobile, vertical on desktop */}
                          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:ml-6">
                            <div className="text-left md:text-right">
                              <p className="text-xs sm:text-sm text-neutral-500">
                                From
                              </p>
                              <p className="text-2xl sm:text-3xl font-bold text-primary">
                                ₦{Number(trip.price).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="primary"
                              onClick={() => handleSelectTrip(trip)}
                              disabled={trip.availableSeats === 0}
                              className="whitespace-nowrap text-sm sm:text-base px-4 sm:px-6">
                              {trip.availableSeats === 0
                                ? "Sold Out"
                                : "Select Trip"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
