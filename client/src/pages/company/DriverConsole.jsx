import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { tripAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import TrackingMap from "../../components/TrackingMap";
import { FaMapMarkerAlt, FaStop, FaPlay, FaSpinner } from "react-icons/fa";

const DriverConsole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    fetchTrip();
    return () => stopTracking(); // Cleanup on unmount
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await tripAPI.getTrip(id);
      setTrip(response.data.trip);
      if (response.data.trip.currentLat && response.data.trip.currentLng) {
        setLocation({
          lat: response.data.trip.currentLat,
          lng: response.data.trip.currentLng,
        });
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Failed to load trip details");
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    toast.success("Tracking started. Keep this tab open!");

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to retrieve location");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const updateLocation = async (lat, lng) => {
    // Throttle updates or just send every time (simple for now)
    try {
      setLocation({ lat, lng });
      setLastUpdated(new Date());

      await tripAPI.updateLocation(id, {
        lat,
        lng,
        currentLocation: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        status: "active",
      });
    } catch (error) {
      console.error("Failed to update location backend:", error);
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" portalLabel="DRIVER CONSOLE" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-raleway">Driver Console</h1>
            <div
              className={`px-4 py-1 rounded-full text-sm font-bold ${
                isTracking
                  ? "bg-green-100 text-green-700 animate-pulse"
                  : "bg-neutral-200 text-neutral-600"
              }`}>
              {isTracking ? "LIVE BROADCASTING" : "OFFLINE"}
            </div>
          </div>

          <Card className="mb-6">
            <div className="mb-4">
              <h2 className="font-semibold text-xl mb-1">
                {trip.from} → {trip.to}
              </h2>
              <p className="text-neutral-600">
                Departure: {trip.departureTime}
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              {!isTracking ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={startTracking}
                  className="flex justify-center items-center gap-2">
                  <FaPlay /> Start Trip Broadcast
                </Button>
              ) : (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={stopTracking}
                  className="flex justify-center items-center gap-2">
                  <FaStop /> Stop Broadcast
                </Button>
              )}
            </div>

            {location.lat && (
              <div className="space-y-4">
                <TrackingMap
                  lat={location.lat}
                  lng={location.lng}
                  popupText="You are here"
                />
                <p className="text-center text-xs text-neutral-500">
                  Last updated:{" "}
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
                </p>
              </div>
            )}

            {!location.lat && (
              <div className="text-center py-8 bg-neutral-100 rounded">
                <FaMapMarkerAlt className="mx-auto text-3xl text-neutral-400 mb-2" />
                <p className="text-neutral-600">
                  Location will appear here when tracking starts
                </p>
              </div>
            )}
          </Card>

          <div className="text-center">
            <Button variant="text" onClick={() => navigate("/company/tickets")}>
              &larr; Back to Tickets Management
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverConsole;
