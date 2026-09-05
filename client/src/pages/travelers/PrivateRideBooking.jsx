import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "react-toastify";
import { usePaystackPayment } from "react-paystack";
import api, { privateRideAPI } from "../../services/api";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";
import {
  FaCheckCircle,
  FaCar,
  FaSuitcase,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaInfoCircle,
  FaShieldAlt,
  FaTimes,
  FaBan,
} from "react-icons/fa";

const PrivateRideBooking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    pickupState: state?.fromState || "",
    pickupCity: state?.from || "",
    pickupLocation: "",
    destinationState: state?.toState || "",
    destinationCity: state?.to || "",
    destination: "",
    pickupDate: state?.date || "",
    pickupTime: "",
    rideType: "one-way",
    passengersCount: 1,
    luggageInfo: "",
    specialNotes: "",
    needsAC: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [stops, setStops] = useState([]); // Array of strings for intermediate stops
  
  // Negotiation state
  const [negotiatingBidId, setNegotiatingBidId] = useState(null);
  const [passengerCounterOfferAmount, setPassengerCounterOfferAmount] = useState({});
  const pollInterval = useRef(null);

  const { states, getCitiesForState } = useLocationsAPI();
  const [pickupCities, setPickupCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const paystackConfig = React.useMemo(() => {
    return {
      reference: new Date().getTime().toString(),
      email: user?.email || "",
      amount: paymentIntent ? Math.round(paymentIntent.amount * 100) : 0,
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      metadata: { privateRideId: activeRequest?.id },
    };
  }, [user?.email, paymentIntent, activeRequest?.id]);

  const initializePayment = usePaystackPayment(paystackConfig);

  useEffect(() => {
    if (paymentIntent && paystackConfig.amount > 0) {
      initializePayment({
        onSuccess: async (reference) => {
          try {
            const verifyRes = await privateRideAPI.verifyPayment(reference.reference, activeRequest.id);
            if (verifyRes.data.success) {
              toast.success("Payment verified! Driver officially assigned.");
              if (verifyRes.data.request) {
                setActiveRequest(verifyRes.data.request);
              } else {
                const res = await api.get("/private-rides");
                const req = res.data.requests?.find(r => r.id === activeRequest.id);
                if (req) setActiveRequest(req);
              }
            } else {
              toast.warning("Payment received. Confirming driver assignment...");
              const res = await api.get("/private-rides");
              const req = res.data.requests?.find(r => r.id === activeRequest.id);
              if (req) setActiveRequest(req);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            try {
              const res = await api.get("/private-rides");
              const req = res.data.requests?.find(r => r.id === activeRequest.id);
              if (req) setActiveRequest(req);
            } catch (err) {
              console.error(err);
            }
            toast.info("Payment processed. Loading assigned driver...");
          }
          setPaymentIntent(null);
        },
        onClose: () => {
          toast.info("Payment cancelled");
          setPaymentIntent(null);
        }
      });
    }
  }, [paymentIntent, paystackConfig.amount]);

  useEffect(() => {
    if (formData.pickupState) {
      getCitiesForState(formData.pickupState).then(c => setPickupCities(c || []));
    } else {
      setPickupCities([]);
    }
  }, [formData.pickupState, getCitiesForState]);

  useEffect(() => {
    if (formData.destinationState) {
      getCitiesForState(formData.destinationState).then(c => setDestinationCities(c || []));
    } else {
      setDestinationCities([]);
    }
  }, [formData.destinationState, getCitiesForState]);

  // Check for active requests on mount
  useEffect(() => {
    if (isAuthenticated) {
      const fetchActiveRequest = async () => {
        try {
          const response = await api.get("/private-rides");
          const active = response.data.requests?.find(r => !['completed', 'cancelled'].includes(r.status));
          if (active) {
            setActiveRequest(active);
            startPolling(active.id);
          }
        } catch (err) {
          console.error("Failed to fetch active requests:", err);
        }
      };
      fetchActiveRequest();
    }
  }, [isAuthenticated]);

  const handleAddStop = () => {
    setStops([...stops, ""]);
  };

  const handleRemoveStop = (index) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to request a private ride");
      navigate("/signin", { state: { from: "/request-private-ride" } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearInterval(pollInterval.current);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const startPolling = (reqId) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = setInterval(async () => {
      if (reqId) {
        try {
          const response = await api.get("/private-rides");
          const req = response.data.requests?.find(r => r.id === reqId);
          
          if (req) {
            setActiveRequest(req);
            // If request is completed or cancelled, stop polling
            if (["completed", "cancelled"].includes(req.status)) {
              clearInterval(pollInterval.current);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Filter out any empty stops
      const validStops = stops.filter(s => s.trim() !== "");
      
      const finalPickup = formData.pickupCity ? `${formData.pickupCity}, ${formData.pickupLocation}` : formData.pickupLocation;
      const finalDest = formData.destinationCity ? `${formData.destinationCity}, ${formData.destination}` : formData.destination;

      const res = await api.post("/private-rides/request", {
        ...formData,
        pickupLocation: finalPickup,
        destination: finalDest,
        stops: validStops
      });
      toast.success("Request sent to drivers! Waiting for bids.");
      setActiveRequest({ ...res.data.request, bids: [] });
      startPolling(res.data.request.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const acceptBid = async (bidId) => {
    try {
      const res = await api.post(`/private-rides/bids/${bidId}/accept`);
      setActiveRequest(res.data.request);
      toast.success("Bid accepted! Proceeding to payment...");
      setPaymentIntent({ amount: res.data.request.agreedPrice });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept bid");
    }
  };

  const handleNotInterested = async (bidId) => {
    try {
      await privateRideAPI.notInterestedBid(bidId);
      toast.info("Offer discarded.");
      // Optimistically remove/filter out from activeRequest bids
      setActiveRequest(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          bids: (prev.bids || []).map(b => b.id === bidId ? { ...b, status: "not_interested" } : b)
        };
      });
      const res = await api.get("/private-rides");
      const req = res.data.requests?.find(r => r.id === activeRequest?.id);
      if (req) setActiveRequest(req);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to discard offer");
    }
  };

  const payForAcceptedBid = (bidAmount) => {
    setPaymentIntent({ amount: activeRequest?.agreedPrice || bidAmount });
  };

  const handleNegotiate = async (bidId) => {
    const amount = passengerCounterOfferAmount[bidId];
    if (!amount) return toast.error("Please enter a proposed price");
    
    try {
      await privateRideAPI.negotiateBid(bidId, amount);
      toast.info("Negotiation request sent to the driver.");
      setNegotiatingBidId(null);
      // Refresh active request
      const res = await api.get("/private-rides");
      const req = res.data.requests.find(r => r.id === activeRequest.id);
      if (req) {
        setActiveRequest(req);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request negotiation");
    }
  };

  const cancelRequest = async () => {
    try {
      await api.post(`/private-rides/${activeRequest.id}/cancel`);
      toast.info("Request cancelled successfully.");
      setActiveRequest(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />
      <div className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        {!activeRequest ? (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-neutral-200">
            <h1 className="text-3xl font-bold font-raleway text-charcoal mb-6">Request a Private Ride</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Pickup State</label>
                  <select
                    name="pickupState"
                    value={formData.pickupState}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupState: e.target.value, pickupCity: "" }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Pickup City</label>
                  <select
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select City</option>
                    {pickupCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <Input
                    label="Pickup Address (Exact Location)"
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    placeholder="E.g. 123 Main St"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Destination State</label>
                  <select
                    name="destinationState"
                    value={formData.destinationState}
                    onChange={(e) => setFormData(prev => ({ ...prev, destinationState: e.target.value, destinationCity: "" }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Destination City</label>
                  <select
                    name="destinationCity"
                    value={formData.destinationCity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select City</option>
                    {destinationCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <Input
                    label="Drop Off Address (Exact Location)"
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="E.g. 456 Broad St"
                    required
                  />
                </div>
              </div>

              {/* Stops Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-charcoal">Intermediate Stops</label>
                  <button 
                    type="button" 
                    onClick={handleAddStop}
                    className="text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-primary/10 px-3 py-1 rounded-full"
                  >
                    + Add Stop
                  </button>
                </div>
                {stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2 animate-in slide-in-from-top-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => handleStopChange(index, e.target.value)}
                        placeholder={`Stop ${index + 1} Address`}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveStop(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Stop"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Pickup Date"
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <Input
                  label="Pickup Time"
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Ride Type</label>
                  <select
                    name="rideType"
                    value={formData.rideType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="one-way">One Way</option>
                    <option value="round-trip">Round Trip</option>
                    <option value="full-day">Full Day</option>
                  </select>
                </div>
                <Input
                  label="Number of Passengers"
                  type="number"
                  name="passengersCount"
                  min="1"
                  max="14"
                  value={formData.passengersCount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Luggage Information (Optional)</label>
                <input
                  type="text"
                  name="luggageInfo"
                  value={formData.luggageInfo}
                  onChange={handleChange}
                  placeholder="E.g., 2 large suitcases"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Special Notes (Optional)</label>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleChange}
                  placeholder="Any special requirements..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary h-24 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsAC"
                  name="needsAC"
                  checked={formData.needsAC}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="needsAC" className="text-sm text-charcoal font-medium">Require Air Conditioning</label>
              </div>

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Broadcasting Request..." : "Find Available Drivers"}
              </Button>
            </form>
          </div>
        ) : isConfirmed ? (
          /* Confirmed & Paid View */
          <div className="space-y-6 animate-slide-up">
            {/* Success Banner */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-200 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-emerald-400"></div>
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
                <FaCheckCircle />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-charcoal mb-2">Ride Confirmed & Driver Assigned!</h2>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mb-4">
                Your payment is verified and your driver is officially assigned. They will arrive at your pickup address on schedule.
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-3">
                <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-mono font-bold rounded-full border border-neutral-200">
                  BOOKING ID: {activeRequest.requestId || `PR-${activeRequest.id}`}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  PAID • ₦{activeRequest.agreedPrice?.toLocaleString()}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {activeRequest.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Assigned Driver Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <FaUser className="text-primary" /> Assigned Driver Information
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-4">
                  {activeRequest.driver?.avatar ? (
                    <img src={activeRequest.driver.avatar} alt="Driver" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 text-primary font-bold text-2xl rounded-full flex items-center justify-center border-2 border-primary/20">
                      {activeRequest.driver?.name?.charAt(0) || "D"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-charcoal">{activeRequest.driver?.name || "Professional Driver"}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                        <FaShieldAlt className="text-[10px]" /> Verified Driver
                      </span>
                      {activeRequest.driver?.vehicles && (
                        <span className="text-xs text-neutral-400">{activeRequest.driver.vehicles} Vehicles</span>
                      )}
                    </div>
                  </div>
                </div>
                {activeRequest.driver?.phone && (
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <a 
                      href={`tel:${activeRequest.driver.phone}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                    >
                      <FaPhone className="text-xs" /> Call Driver ({activeRequest.driver.phone})
                    </a>
                  </div>
                )}
              </div>

              {/* Driver Luggage & Vehicle Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">
                    <FaSuitcase className="text-primary text-sm" /> Luggage Space & Capacity
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    {assignedBid?.luggageDescription || activeRequest.luggageInfo || "Standard private luggage capacity (Fits large suitcases)"}
                  </p>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">
                    <FaCar className="text-primary text-sm" /> Vehicle Information
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    {assignedBid?.vehicleDetails || (activeRequest.needsAC ? "Air-Conditioned Private Vehicle" : "Private Vehicle")}
                  </p>
                </div>

                {(assignedBid?.furtherInformation || activeRequest.specialNotes) && (
                  <div className="md:col-span-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-2 text-neutral-500 text-xs font-bold uppercase tracking-wider mb-2">
                      <FaInfoCircle className="text-primary text-sm" /> Further Driver Notes & Instructions
                    </div>
                    <p className="text-sm text-neutral-700 italic">
                      {assignedBid?.furtherInformation || activeRequest.specialNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Journey Summary */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <FaMapMarkerAlt className="text-primary" /> Journey Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400 text-xs font-bold uppercase block mb-1">Pickup</span>
                  <p className="font-bold text-charcoal">{activeRequest.pickupLocation}</p>
                  {activeRequest.pickupState && <p className="text-xs text-neutral-500">{activeRequest.pickupState}</p>}
                </div>
                <div>
                  <span className="text-neutral-400 text-xs font-bold uppercase block mb-1">Destination</span>
                  <p className="font-bold text-charcoal">{activeRequest.destination}</p>
                  {activeRequest.destinationState && <p className="text-xs text-neutral-500">{activeRequest.destinationState}</p>}
                </div>
                <div>
                  <span className="text-neutral-400 text-xs font-bold uppercase block mb-1">Schedule</span>
                  <p className="font-bold text-charcoal">{activeRequest.pickupDate} at {activeRequest.pickupTime}</p>
                </div>
                <div>
                  <span className="text-neutral-400 text-xs font-bold uppercase block mb-1">Passengers & AC</span>
                  <p className="font-bold text-charcoal">{activeRequest.passengersCount} Passenger(s) • {activeRequest.needsAC ? "AC Included" : "Standard"}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => navigate('/tracking', { state: { bookingId: activeRequest.requestId || `PR-${activeRequest.id}` } })}
                className="flex-1 py-3.5 px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm"
              >
                <FaMapMarkerAlt /> Track Driver Live GPS
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="py-3.5 px-6 bg-white text-charcoal border border-neutral-200 font-bold rounded-xl hover:bg-neutral-50 transition-all text-center text-sm"
              >
                View in My Bookings
              </button>
              <button
                onClick={() => setActiveRequest(null)}
                className="py-3.5 px-4 text-neutral-500 hover:text-neutral-700 font-bold text-xs transition-all text-center"
              >
                Request Another Ride
              </button>
            </div>
          </div>
        ) : (
          /* Bidding & Negotiation View */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-charcoal">
                    {activeRequest.status === "awaiting_payment" ? "Offer Accepted - Awaiting Payment" : "Waiting for Bids"}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    activeRequest.status === "awaiting_payment"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800 animate-pulse"
                  }`}>
                    {activeRequest.status === "awaiting_payment" ? "Ready to Pay" : "Searching..."}
                  </span>
                </div>
                <button
                  onClick={cancelRequest}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors text-sm"
                >
                  Cancel Request
                </button>
              </div>

              {activeRequest.status === "awaiting_payment" ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-6 text-emerald-800 text-sm font-medium">
                  🎉 You accepted an offer of <strong>₦{activeRequest.agreedPrice?.toLocaleString()}</strong>! Complete your payment below to officially assign the driver.
                </div>
              ) : (
                <p className="text-neutral-600 mb-6">
                  Your request has been sent to nearby drivers. They will review it and propose their best prices.
                </p>
              )}
              
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 text-sm">
                <h3 className="font-bold text-charcoal mb-3">Request Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="text-neutral-500">Route:</span> <span className="font-medium">{activeRequest.pickupLocation} to {activeRequest.destination}</span></div>
                  <div><span className="text-neutral-500">Date & Time:</span> <span className="font-medium">{activeRequest.pickupDate} at {activeRequest.pickupTime}</span></div>
                  <div><span className="text-neutral-500">Passengers:</span> <span className="font-medium">{activeRequest.passengersCount}</span></div>
                  <div><span className="text-neutral-500">Ride Type:</span> <span className="font-medium capitalize">{activeRequest.rideType?.replace("-", " ")}</span></div>
                  {activeRequest.luggageInfo && <div><span className="text-neutral-500">Luggage:</span> <span className="font-medium">{activeRequest.luggageInfo}</span></div>}
                  <div><span className="text-neutral-500">AC Required:</span> <span className="font-medium">{activeRequest.needsAC ? "Yes" : "No"}</span></div>
                  {activeRequest.specialNotes && <div className="md:col-span-2"><span className="text-neutral-500 block mb-1">Notes:</span> <span className="font-medium italic block bg-white p-2 rounded border border-neutral-100">{activeRequest.specialNotes}</span></div>}
                </div>
              </div>
            </div>

            {activeBids.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-charcoal flex items-center justify-between">
                  <span>Available Driver Offers ({activeBids.length})</span>
                  <span className="text-xs text-neutral-400 font-normal">Compare prices & luggage capacity</span>
                </h3>

                {activeBids.map((bid) => (
                  <div key={bid.id} className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {bid.driver?.avatar ? (
                          <img src={bid.driver.avatar} alt={bid.driver.name} className="w-14 h-14 rounded-full object-cover border border-neutral-200" />
                        ) : (
                          <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                            {bid.driver?.name?.charAt(0) || "D"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-lg text-charcoal">{bid.driver?.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                            <span className="bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded border border-green-200 text-[10px]">Verified</span>
                            <span>{bid.driver?.vehicles || 1} Vehicles</span>
                            <span className="text-neutral-400">•</span>
                            <span className="text-primary font-bold flex items-center gap-1">📞 {bid.driver?.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 self-end md:self-center">
                        <div className="flex items-center gap-2">
                          {bid.status === "counter_offered" && (
                            <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">
                              Final Offer
                            </span>
                          )}
                          {bid.status === "negotiating" && (
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full animate-pulse">
                              Negotiating...
                            </span>
                          )}
                          <span className="text-2xl font-black text-primary">₦{bid.bidAmount.toLocaleString()}</span>
                        </div>
                        {bid.status === "negotiating" && (
                          <p className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            You proposed: ₦{bid.passengerCounterOffer?.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Driver details: Luggage, Vehicle, Further Info */}
                    {(bid.luggageDescription || bid.vehicleDetails || bid.furtherInformation) && (
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs space-y-1.5 text-neutral-700">
                        {bid.luggageDescription && (
                          <div className="flex items-center gap-2">
                            <FaSuitcase className="text-primary text-[11px] flex-shrink-0" />
                            <span><strong className="text-neutral-600">Luggage Space:</strong> {bid.luggageDescription}</span>
                          </div>
                        )}
                        {bid.vehicleDetails && (
                          <div className="flex items-center gap-2">
                            <FaCar className="text-primary text-[11px] flex-shrink-0" />
                            <span><strong className="text-neutral-600">Vehicle:</strong> {bid.vehicleDetails}</span>
                          </div>
                        )}
                        {bid.furtherInformation && (
                          <div className="flex items-start gap-2 pt-1 border-t border-neutral-200/60">
                            <FaInfoCircle className="text-primary text-[11px] mt-0.5 flex-shrink-0" />
                            <span className="italic text-neutral-600">{bid.furtherInformation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100">
                      {/* NO LONGER INTERESTED button */}
                      <button
                        type="button"
                        onClick={() => handleNotInterested(bid.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 py-2 px-3 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FaTimes className="text-[10px]" /> NO LONGER INTERESTED
                      </button>

                      <div className="flex items-center gap-2 justify-end">
                        {negotiatingBidId === bid.id ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="number"
                              placeholder="Your proposed price (₦)"
                              value={passengerCounterOfferAmount[bid.id] || ""}
                              onChange={(e) => setPassengerCounterOfferAmount({...passengerCounterOfferAmount, [bid.id]: e.target.value})}
                              className="w-full sm:w-36 px-3 py-2 border border-neutral-300 rounded-lg text-xs font-bold focus:outline-none focus:border-primary"
                            />
                            <Button onClick={() => handleNegotiate(bid.id)} variant="primary" className="py-2 px-3 text-xs whitespace-nowrap">
                              Submit
                            </Button>
                            <Button onClick={() => setNegotiatingBidId(null)} variant="secondary" className="py-2 px-2.5 text-xs">
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            {bid.status === "pending" && (
                              <Button 
                                onClick={() => setNegotiatingBidId(bid.id)} 
                                variant="secondary" 
                                className="py-2 px-4 border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-bold"
                              >
                                Negotiate Price
                              </Button>
                            )}
                            {bid.status === "accepted" ? (
                              <Button onClick={() => payForAcceptedBid(bid.bidAmount)} variant="primary" className="py-2 px-6 text-xs font-bold bg-green-600 hover:bg-green-700 border-none shadow-md shadow-green-600/20">
                                Pay Now (₦{bid.bidAmount.toLocaleString()})
                              </Button>
                            ) : (
                              <Button onClick={() => acceptBid(bid.id)} variant="primary" className="py-2 px-5 text-xs font-bold">
                                Accept & Pay
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-500 font-medium">Waiting for drivers to submit bids...</p>
                <p className="text-xs text-neutral-400 mt-1">Drivers in your area will propose their best prices shortly.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PrivateRideBooking;
