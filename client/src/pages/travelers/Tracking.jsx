import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingAPI, tripAPI, shipmentAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import TrackingMap from "../../components/TrackingMap";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaCircle,
  FaBus,
  FaSpinner,
} from "react-icons/fa";

const Tracking = () => {
  const location = useLocation();
  // Allow pre-filling booking ID from URL query or state
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auto-track if navigated from another page with booking ID
  useEffect(() => {
    if (location.state?.bookingId) {
      setBookingId(location.state.bookingId);
      fetchTrackingData(location.state.bookingId);
    }
  }, [location.state]);

  // Poll for location updates if trip is active
  useEffect(() => {
    let interval;
    if (trackData && tripDetails?.status === "active") {
      interval = setInterval(() => {
        refreshLocation();
      }, 30000); // 30 seconds
    }
    return () => clearInterval(interval);
  }, [trackData, tripDetails]);

  const refreshLocation = async () => {
    if (!tripDetails?.id) return;
    try {
      const res = await tripAPI.getTrip(tripDetails.id);
      if (res.data.success) {
        setTripDetails(res.data.trip);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Poll update failed", err);
    }
  };

  const [isFreight, setIsFreight] = useState(false);

  const fetchTrackingData = async (idToTrack) => {
    if (!idToTrack) return;
    setLoading(true);
    setTrackData(null);
    setTripDetails(null);
    setIsFreight(false);

    try {
      if (idToTrack.startsWith("FR-")) {
        // It's a Freight Shipment
        const res = await shipmentAPI.getShipment(idToTrack);
        if (res.data.success && res.data.shipment) {
          setIsFreight(true);
          setTrackData(res.data.shipment);
          setTripDetails(res.data.shipment.trip);
        } else {
          toast.error("Shipment not found.");
        }
      } else {
        // Passenger Booking (existing logic)
        const res = await bookingAPI.getUserBookings();
        const myBooking = res.data.bookings.find(
          (b) => b.bookingId === idToTrack,
        );

        if (myBooking) {
          setTrackData(myBooking);
          const tripRes = await tripAPI.getTrip(myBooking.tripId);
          setTripDetails(tripRes.data.trip);
        } else {
          toast.error("Booking not found or you are not logged in.");
        }
      }
    } catch (error) {
      console.error("Tracking error:", error);
      toast.error(
        "Unable to track. Please verify your ID or ensure you are logged in if tracking a passenger ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    fetchTrackingData(bookingId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-3xl">
          <h1 className="text-2xl font-raleway font-bold text-charcoal mb-6">
            Track Your Trip
          </h1>

          {/* Search Form */}
          <Card className="mb-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <Input
                label="Booking Reference"
                name="bookingId"
                placeholder="Enter your tracking ID (e.g., FR-XXXXXX or BK-XXXXX)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                icon={FaSearch}
                required
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}>
                {loading ? "Searching..." : "Track Booking"}
              </Button>
            </form>
          </Card>

          {/* Tracking Results */}
          {trackData && tripDetails && (
            <>
              {/* Status Card */}
              <Card className="mb-6 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Current Status</p>
                  <h2 className="text-3xl font-bold mb-4">
                    {isFreight
                      ? trackData.trackingStatus.replace("_", " ").toUpperCase()
                      : tripDetails.status.toUpperCase()}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <FaMapMarkerAlt />
                    <span className="text-lg">
                      {tripDetails.currentLocation ||
                        "Location waiting for update..."}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2 mb-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{
                        width:
                          tripDetails.status === "completed" ? "100%" : "50%",
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Map View */}
              <Card className="mb-6 p-2">
                <h3 className="font-semibold mb-2 px-2">Live Map</h3>
                <TrackingMap
                  lat={tripDetails.currentLat}
                  lng={tripDetails.currentLng}
                  popupText={`Last updated: ${
                    tripDetails.lastUpdated
                      ? new Date(tripDetails.lastUpdated).toLocaleTimeString()
                      : "Never"
                  }`}
                />
                {!tripDetails.currentLat && (
                  <div className="text-center text-neutral-500 py-4">
                    Driver has not started sharing location yet.
                  </div>
                )}
              </Card>

              {/* Freight Shipment Tracking UI */}
              {isFreight && (
                <Card className="mb-6 border-2 border-primary">
                  <h3 className="font-semibold mb-4 text-primary">
                    Shipment Details ({trackData.trackingId})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 uppercase font-bold mb-2">
                        Sender
                      </p>
                      <p className="font-medium">
                        {trackData.senderDetails?.name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {trackData.senderDetails?.address}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 uppercase font-bold mb-2">
                        Receiver
                      </p>
                      <p className="font-medium">
                        {trackData.receiverDetails?.name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {trackData.receiverDetails?.address}
                      </p>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <p className="text-xs text-neutral-500 uppercase font-bold mb-2">
                        Cargo Details
                      </p>
                      <div className="space-y-2">
                        {trackData.cargoDetails?.items ? (
                          trackData.cargoDetails.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm border-b border-neutral-100 pb-1 last:border-0">
                              <div>
                                <span className="font-medium">{item.description}</span>
                                <span className="text-xs text-neutral-400 ml-2">({item.type})</span>
                              </div>
                              <span className="text-neutral-600">{item.quantity} x {item.weight}kg</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm">
                            {trackData.cargoDetails?.description} ({trackData.cargoDetails?.weight} kg)
                          </p>
                        )}
                        {trackData.cargoDetails?.items && (
                          <div className="flex justify-between text-xs font-bold pt-1 border-t border-neutral-200">
                            <span>TOTAL WEIGHT</span>
                            <span>{trackData.cargoDetails.items.reduce((acc, i) => acc + parseFloat(i.weight || 0) * (i.quantity || 1), 0)} kg</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
                      <p className="text-sm">
                        Payment Status:{" "}
                        <strong
                          className={`uppercase ${trackData.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                          {trackData.paymentStatus}
                        </strong>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Status Note: {trackData.statusMessage || "N/A"}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Passenger Trip Details (Existing) */}
              {!isFreight && (
                <Card className="mb-6">
                  <h3 className="font-semibold mb-4">Trip Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Booking Ref:</span>
                      <span className="font-semibold">
                        {trackData.bookingId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Route:</span>
                      <span className="font-semibold">
                        {tripDetails.from} → {tripDetails.to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Departure:</span>
                      <span className="font-semibold">
                        {tripDetails.departureTime}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {!trackData && !loading && (
            <Card className="text-center py-12">
              <FaMapMarkerAlt className="text-6xl text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">
                Enter your booking ID to track your trip
              </p>
              <p className="text-sm text-neutral-500">
                You can find your booking ID in your confirmation email
              </p>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tracking;
