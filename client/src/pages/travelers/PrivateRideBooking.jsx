import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";

const PrivateRideBooking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    pickupState: state?.fromState || "",
    pickupLocation: state?.from || "",
    destinationState: state?.toState || "",
    destination: state?.to || "",
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

  const { states } = useLocationsAPI();

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

  // If there's an active request, fetch it occasionally to get bids
  useEffect(() => {
    let interval;
    if (activeRequest && activeRequest.status === "searching") {
      interval = setInterval(async () => {
        try {
          const res = await api.get("/private-rides");
          const req = res.data.requests.find(r => r.id === activeRequest.id);
          if (req) {
            setActiveRequest(req);
          }
        } catch (err) {
          console.error(err);
        }
      }, 5000); // Poll every 5s for MVP
    }
    return () => clearInterval(interval);
  }, [activeRequest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Filter out any empty stops
      const validStops = stops.filter(s => s.trim() !== "");
      
      const res = await api.post("/private-rides/request", {
        ...formData,
        stops: validStops
      });
      toast.success("Request sent to drivers! Waiting for bids.");
      setActiveRequest({ ...res.data.request, bids: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const acceptBid = async (bidId) => {
    try {
      const res = await api.post(`/private-rides/bids/${bidId}/accept`);
      toast.success("Bid accepted! Proceeding to payment...");
      // Initialize payment
      const payRes = await api.post(`/private-rides/${activeRequest.id}/pay`);
      window.location.href = payRes.data.data.authorization_url;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept bid");
    }
  };

  const cancelRequest = async () => {
    try {
      if (window.confirm("Are you sure you want to cancel this request?")) {
        await api.post(`/private-rides/${activeRequest.id}/cancel`);
        toast.info("Request cancelled successfully.");
        setActiveRequest(null);
      }
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Pickup State</label>
                  <select
                    name="pickupState"
                    value={formData.pickupState}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupState: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Input
                    label="Pickup Address (Exact Location)"
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    placeholder="E.g. 123 Main St, Ikeja"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Destination State</label>
                  <select
                    name="destinationState"
                    value={formData.destinationState}
                    onChange={(e) => setFormData(prev => ({ ...prev, destinationState: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Input
                    label="Drop Off Address (Exact Location)"
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="E.g. 456 Broad St, Marina"
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
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-charcoal">Waiting for Bids</h2>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold animate-pulse">
                    Searching...
                  </span>
                </div>
                <button
                  onClick={cancelRequest}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors text-sm"
                >
                  Cancel Request
                </button>
              </div>
              <p className="text-neutral-600">
                Your request has been sent to nearby drivers. They will review it and propose their best prices.
              </p>
            </div>

            {activeRequest.bids?.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-charcoal">Available Drivers</h3>
                {activeRequest.bids.map((bid) => (
                  <div key={bid.id} className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {bid.driver?.avatar ? (
                        <img src={bid.driver.avatar} alt={bid.driver.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center">
                          <span className="text-xl text-neutral-500 font-bold">{bid.driver?.name?.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg text-charcoal">{bid.driver?.name}</h4>
                        <p className="text-sm text-neutral-500 mb-1">{bid.driver?.vehicles} Vehicles Available</p>
                        <p className="text-sm font-bold text-primary flex items-center gap-1">
                          <span className="text-xs">📞</span> {bid.driver?.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                      <span className="text-2xl font-bold text-primary">₦{bid.bidAmount.toLocaleString()}</span>
                      <Button onClick={() => acceptBid(bid.id)} variant="primary" className="w-full md:w-auto">
                        Accept & Pay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-500">No bids yet. Please wait a moment...</p>
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
