import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { privateRideAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import TrackingMap from "../../components/TrackingMap";
import { 
  FaMapMarkerAlt, 
  FaStop, 
  FaPlay, 
  FaSpinner, 
  FaCheckCircle, 
  FaPhone, 
  FaUser, 
  FaClock, 
  FaCalendarAlt, 
  FaCar, 
  FaSuitcase, 
  FaWind, 
  FaCoins,
  FaArrowLeft
} from "react-icons/fa";

const PrivateDriverConsole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    fetchRequestDetails();
    return () => stopTracking(); // Cleanup tracking on unmount
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await privateRideAPI.getPrivateRide(id);
      if (response.data.success) {
        setRequest(response.data.request);
        if (response.data.request.currentLat && response.data.request.currentLng) {
          setLocation({
            lat: response.data.request.currentLat,
            lng: response.data.request.currentLng,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      toast.error("Failed to load private ride details");
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    toast.success("GPS Broadcasting started. Keep this tab open!");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        toast.error("Unable to retrieve GPS coordinates");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
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
    try {
      setLocation({ lat, lng });
      setLastUpdated(new Date());

      await privateRideAPI.updateLocation(id, {
        lat,
        lng,
        currentLocation: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      });
    } catch (error) {
      console.error("Failed to update GPS on backend:", error);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await privateRideAPI.updateRideStatus(id, newStatus);
      if (response.data.success) {
        toast.success(`Ride status updated to: ${newStatus.replace("_", " ")}`);
        setRequest(response.data.request);
        
        // Auto-start tracking if moving
        if (["en_route", "started"].includes(newStatus) && !isTracking) {
          startTracking();
        }
        // Stop tracking if completed
        if (newStatus === "completed") {
          stopTracking();
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Loading console details...</p>
        </div>
      </div>
    );
  }

  // Calculate earnings details (80% goes to driver)
  const agreedPrice = request.agreedPrice || 0;
  const platformFee = agreedPrice * 0.20;
  const driverEarnings = agreedPrice * 0.80;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" portalLabel="DRIVER CONSOLE" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <button 
                onClick={() => navigate("/company/driver-console")}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-charcoal font-bold mb-2 transition-colors"
              >
                <FaArrowLeft /> Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold font-raleway text-charcoal">Private Ride Console</h1>
            </div>
            
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${
              isTracking 
                ? "bg-green-100 text-green-700 animate-pulse border border-green-200" 
                : "bg-neutral-200 text-neutral-600 border border-neutral-300"
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${isTracking ? "bg-green-500" : "bg-neutral-400"}`}></span>
              {isTracking ? "GPS BROADCASTING ACTIVE" : "BROADCAST OFFLINE"}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Info Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* Passenger Card */}
              <Card className="border border-neutral-200 shadow-sm">
                <h2 className="text-lg font-bold text-charcoal mb-4 border-b border-neutral-100 pb-2">Passenger Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  {request.passenger?.avatar ? (
                    <img 
                      src={request.passenger.avatar} 
                      alt={request.passenger.name} 
                      className="w-16 h-16 rounded-full object-cover border border-neutral-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                      <FaUser className="text-2xl" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-charcoal text-lg">{request.passenger?.name || "Passenger"}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 font-bold mt-1">
                      <FaPhone className="text-primary text-xs" />
                      <a href={`tel:${request.passenger?.phone}`} className="hover:underline text-primary">{request.passenger?.phone || "No Phone"}</a>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-neutral-700">
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500 flex items-center gap-1.5"><FaMapMarkerAlt className="text-green-600" /> Pickup</span>
                    <span className="font-medium text-right max-w-[200px]">{request.pickupLocation}, {request.pickupState}</span>
                  </div>
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500 flex items-center gap-1.5"><FaMapMarkerAlt className="text-red-500" /> Destination</span>
                    <span className="font-medium text-right max-w-[200px]">{request.destination}, {request.destinationState}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500 flex items-center gap-1.5"><FaCalendarAlt className="text-primary" /> Schedule</span>
                    <span className="font-medium">{request.pickupDate} at {request.pickupTime}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500 flex items-center gap-1.5"><FaCar className="text-primary" /> Ride Type</span>
                    <span className="font-medium capitalize">{request.rideType.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500 flex items-center gap-1.5"><FaUser className="text-primary" /> Passengers</span>
                    <span className="font-medium">{request.passengersCount} Guest(s)</span>
                  </div>
                  {request.luggageInfo && (
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span className="text-neutral-500 flex items-center gap-1.5"><FaSuitcase className="text-primary" /> Luggage</span>
                      <span className="font-medium">{request.luggageInfo}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-neutral-500 flex items-center gap-1.5"><FaWind className="text-primary" /> AC Required</span>
                    <span className="font-medium">{request.needsAC ? "Yes" : "No"}</span>
                  </div>
                  {request.specialNotes && (
                    <div className="pt-2">
                      <span className="text-neutral-500 block mb-1">Special Notes</span>
                      <p className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 italic text-neutral-600 text-xs">{request.specialNotes}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Earnings Card */}
              <Card className="border border-neutral-200 shadow-sm bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
                <h2 className="text-lg font-bold border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                  <FaCoins className="text-primary" /> Earnings Breakdown
                </h2>
                <div className="space-y-3 text-sm opacity-90">
                  <div className="flex justify-between">
                    <span>Agreed Price</span>
                    <span className="font-bold">₦{agreedPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Platform Commission (20%)</span>
                    <span>- ₦{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2.5 flex justify-between items-center text-lg font-extrabold text-white">
                    <span className="text-primary">Your Take-Home</span>
                    <span className="text-primary">₦{driverEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Map and Geolocation Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Geolocation Broadcasting Controls */}
              <Card className="border border-neutral-200 shadow-sm">
                <h2 className="text-lg font-bold text-charcoal mb-4 border-b border-neutral-100 pb-2">Broadcasting Controls</h2>
                <p className="text-sm text-neutral-600 mb-6">
                  Enable GPS broadcasting during journey tasks so passengers can see your live location on their map.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {!isTracking ? (
                    <Button 
                      variant="primary" 
                      onClick={startTracking}
                      className="flex-1 flex justify-center items-center gap-2 py-3 bg-primary hover:bg-primary-dark"
                    >
                      <FaPlay /> Start GPS Broadcast
                    </Button>
                  ) : (
                    <Button 
                      variant="danger" 
                      onClick={stopTracking}
                      className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-600 hover:bg-red-700"
                    >
                      <FaStop /> Stop GPS Broadcast
                    </Button>
                  )}
                </div>
              </Card>

              {/* Journey Tracker Timeline */}
              <Card className="border border-neutral-200 shadow-sm">
                <h2 className="text-lg font-bold text-charcoal mb-4 border-b border-neutral-100 pb-2">Journey State Updates</h2>
                <p className="text-xs text-neutral-500 mb-6">Update the status below sequentially to inform the traveler.</p>

                {request.status === "driver_assigned" && (
                  <Button variant="primary" fullWidth onClick={() => updateStatus("en_route")} className="py-3 bg-purple-600 hover:bg-purple-700">
                    Mark En Route to Pickup
                  </Button>
                )}

                {request.status === "en_route" && (
                  <Button variant="primary" fullWidth onClick={() => updateStatus("arrived")} className="py-3 bg-blue-600 hover:bg-blue-700">
                    Mark Arrived at Pickup Location
                  </Button>
                )}

                {request.status === "arrived" && (
                  <Button variant="primary" fullWidth onClick={() => updateStatus("started")} className="py-3 bg-green-600 hover:bg-green-700">
                    Start Journey Now
                  </Button>
                )}

                {request.status === "started" && (
                  <Button variant="primary" fullWidth onClick={() => updateStatus("completed")} className="py-3 bg-primary hover:bg-primary-dark">
                    <FaCheckCircle className="inline mr-1.5" /> End Ride / Complete Journey
                  </Button>
                )}

                {request.status === "completed" && (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center font-bold">
                    🎉 This ride is completed! Thank you.
                  </div>
                )}

                {request.status === "cancelled" && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center font-bold">
                    🚫 This ride was cancelled.
                  </div>
                )}

                <div className="mt-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-500 block uppercase mb-3">Journey Progress Flow</span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        ["en_route", "arrived", "started", "completed"].includes(request.status)
                          ? "bg-green-500 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>1</span>
                      <span className={["en_route", "arrived", "started", "completed"].includes(request.status) ? "font-bold text-green-600" : "text-neutral-500"}>En Route</span>
                    </div>
                    <div className="hidden sm:block h-0.5 bg-neutral-300 flex-1 mx-2"></div>
                    <div className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        ["arrived", "started", "completed"].includes(request.status)
                          ? "bg-green-500 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>2</span>
                      <span className={["arrived", "started", "completed"].includes(request.status) ? "font-bold text-green-600" : "text-neutral-500"}>Arrived</span>
                    </div>
                    <div className="hidden sm:block h-0.5 bg-neutral-300 flex-1 mx-2"></div>
                    <div className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        ["started", "completed"].includes(request.status)
                          ? "bg-green-500 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>3</span>
                      <span className={["started", "completed"].includes(request.status) ? "font-bold text-green-600" : "text-neutral-500"}>Started</span>
                    </div>
                    <div className="hidden sm:block h-0.5 bg-neutral-300 flex-1 mx-2"></div>
                    <div className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        request.status === "completed"
                          ? "bg-green-500 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>4</span>
                      <span className={request.status === "completed" ? "font-bold text-green-600" : "text-neutral-500"}>Completed</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Map view */}
              <Card className="border border-neutral-200 shadow-sm p-2">
                <h3 className="font-semibold text-charcoal mb-2 px-2 py-1">GPS View Map</h3>
                {location.lat && location.lng ? (
                  <div className="rounded-lg overflow-hidden border border-neutral-200 shadow-sm">
                    <TrackingMap 
                      lat={location.lat} 
                      lng={location.lng} 
                      popupText="Broadcasting location" 
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-neutral-100 flex flex-col justify-center items-center border border-neutral-200 rounded-lg text-neutral-400">
                    <FaMapMarkerAlt className="text-3xl mb-2" />
                    <p className="text-sm">Broadcast OFFLINE</p>
                    <p className="text-xs mt-1">Start broadcasting above to load coordinates</p>
                  </div>
                )}
                {lastUpdated && (
                  <p className="text-center text-[10px] text-neutral-400 mt-2">
                    Coordinates uploaded: {new Date(lastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivateDriverConsole;
