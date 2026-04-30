import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";
import { tripAPI } from "../../services/api";
import {
  FaCar,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa";

const OfferRide = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { states, getCitiesForState } = useLocationsAPI();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    state: "Lagos", // Default to Lagos as per request
    departureDate: new Date().toISOString().split('T')[0],
    timeWindowStart: "07:00",
    timeWindowEnd: "07:15",
    seats: 3,
    price: "",
    departureTime: "07:00", // Will be set to timeWindowStart
    departureDeadline: "07:15",
    depositAmount: 0,
    cancellationWindow: 12,
    confirmationWindow: 2,
  });

  const [cities, setCities] = useState([]);

  // Fetch cities for the selected state
  React.useEffect(() => {
    if (formData.state) {
      getCitiesForState(formData.state).then(setCities);
    }
  }, [formData.state, getCitiesForState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning("Please sign in to offer a ride");
      navigate("/signin", { state: { from: "/offer-ride" } });
      return;
    }

    try {
      setLoading(true);
      const tripData = {
        ...formData,
        transportType: "carpooling",
        serviceCategory: "passenger",
        vehicleType: "Private Car",
        departureTime: formData.timeWindowStart,
        fromState: formData.state,
        toState: formData.state,
      };

      const response = await tripAPI.createTrip(tripData);
      if (response.success) {
        toast.success("Carpool ride posted successfully!");
        navigate("/my-bookings"); // Or a dedicated "My Rides" page if it exists
      }
    } catch (error) {
      console.error("Error posting ride:", error);
      toast.error(error.response?.data?.message || "Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <main className="flex-1 py-12 px-4">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100">
            {/* Header */}
            <div className="bg-charcoal p-8 text-white">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <FaCar className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Offer a Ride</h1>
                  <p className="text-neutral-400 text-sm">Help others and save on fuel costs</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Route Section */}
                <div className="col-span-full">
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" /> Route Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">State</label>
                      <select 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      >
                        {states.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Pickup (e.g., Festac)</label>
                        <select 
                          value={formData.from}
                          onChange={(e) => setFormData({...formData, from: e.target.value})}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                        >
                          <option value="">Select pickup</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Destination (e.g., VI)</label>
                        <select 
                          value={formData.to}
                          onChange={(e) => setFormData({...formData, to: e.target.value})}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                        >
                          <option value="">Select destination</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Section */}
                <div className="col-span-full">
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaClock className="text-primary" /> Time & Schedule
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Date</label>
                      <input 
                        type="date"
                        value={formData.departureDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Start Window</label>
                      <input 
                        type="time"
                        value={formData.timeWindowStart}
                        onChange={(e) => setFormData({...formData, timeWindowStart: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">End Window</label>
                      <input 
                        type="time"
                        value={formData.timeWindowEnd}
                        onChange={(e) => setFormData({...formData, timeWindowEnd: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Departure Deadline</label>
                      <input 
                        type="time"
                        value={formData.departureDeadline}
                        onChange={(e) => setFormData({...formData, departureDeadline: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity & Price */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaUsers className="text-primary" /> Capacity
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Available Seats</label>
                      <input 
                        type="number"
                        min="1"
                        max="7"
                        value={formData.seats}
                        onChange={(e) => setFormData({...formData, seats: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Min Seats to start</label>
                      <input 
                        type="number"
                        min="1"
                        max={formData.seats}
                        value={formData.minSeats}
                        onChange={(e) => setFormData({...formData, minSeats: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-primary" /> Pricing
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Price per Seat (₦)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl flex gap-3 items-start">
                    <FaInfoCircle className="text-blue-500 mt-1" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Recommended price for {formData.from || 'this route'} is ₦1,200 – ₦2,000.
                    </p>
                  </div>
                </div>

                {/* Advanced Rules */}
                <div className="col-span-full pt-4 border-t border-neutral-100">
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-primary" /> Rules & Deposits
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Deposit (₦)</label>
                      <input 
                        type="number"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="0 for no deposit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Cancel Window (hrs)</label>
                      <input 
                        type="number"
                        value={formData.cancellationWindow}
                        onChange={(e) => setFormData({...formData, cancellationWindow: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Confirm Window (hrs)</label>
                      <input 
                        type="number"
                        value={formData.confirmationWindow}
                        onChange={(e) => setFormData({...formData, confirmationWindow: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <Button 
                  type="submit"
                  variant="primary" 
                  className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Carpool Ride"}
                </Button>
                <p className="text-center text-xs text-neutral-400 mt-4">
                  By posting, you agree to our Carpooling Terms & Safety Guidelines.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OfferRide;
