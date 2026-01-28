import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { tripAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  FaBus,
  FaClock,
  FaInfoCircle,
  FaArrowRight,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";

const DriverConsoleList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getMyTrips();
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load your trips");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const term = searchTerm.toLowerCase();
    return (
      trip.from?.toLowerCase().includes(term) ||
      trip.to?.toLowerCase().includes(term) ||
      trip.transportType?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" portalLabel="DRIVER CONSOLE" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-raleway font-bold text-charcoal mb-2">
                Driver Console
              </h1>
              <p className="text-neutral-600">
                Select a trip to start broadcasting your location.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-neutral-100">
              <FaBus className="mx-auto text-4xl text-neutral-300 mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                No trips found
              </h3>
              <p className="text-neutral-500 mb-6">
                You haven't created any trips yet, or none matched your search.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/company/tickets")}>
                Create New Trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-all group">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                        {trip.transportType}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          trip.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}>
                        {trip.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-charcoal mb-1 flex items-center gap-2">
                      {trip.from}{" "}
                      <FaArrowRight className="text-sm text-neutral-400" />{" "}
                      {trip.to}
                    </h3>

                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-6">
                      <FaClock className="text-primary" />
                      {trip.departureTime}
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-auto">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() =>
                          navigate(`/company/driver-console/${trip.id}`)
                        }
                        className="flex items-center justify-center gap-2 group-hover:bg-primary-dark transition-colors">
                        <FaMapMarkerAlt /> Start Trip
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverConsoleList;
