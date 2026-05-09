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
import { calculateServiceFee, calculateVAT } from "../../utils/pricing";

const OfferRide = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { states, getCitiesForState } = useLocationsAPI();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    state: "", // Default to empty
    departureDate: new Date().toISOString().split('T')[0],
    timeWindowStart: "07:00",
    timeWindowEnd: "07:15",
    seats: 3,
    price: "",
    departureTime: "07:00", // Will be set to timeWindowStart
    depositAmount: 0,
    cancellationWindow: 12,
    confirmationWindow: 2,
    vehicleName: "",
  });

  const [cities, setCities] = useState([]);

  // Fetch cities for the selected state
  React.useEffect(() => {
    if (formData.state) {
      getCitiesForState(formData.state).then(setCities);
    } else {
      setCities([]);
    }
  }, [formData.state, getCitiesForState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning("Please sign in to offer a ride");
      navigate("/signin", { state: { from: "/offer-ride" } });
      return;
    }

    if (Number(formData.price) > 5000) {
      toast.error("Carpooling price cannot exceed ₦5,000.");
      setLoading(false);
      return;
    }
    if (Number(formData.price) < 1500) {
      toast.error("Carpooling price cannot be less than ₦1,500.");
      setLoading(false);
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
        vehiclePlateNumber: formData.vehiclePlateNumber,
        pickupAddress: formData.pickupAddress,
        depositAmount: 5,
        cancellationWindow: 12,
        confirmationWindow: 2,
        vehicleName: formData.vehicleName,
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
                      <label className="block text-sm font-medium text-charcoal mb-1">Select State</label>
                      <select 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value, from: "", to: ""})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      >
                        <option value="">Choose a State</option>
                        {states.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Pickup City</label>
                        <select 
                          value={formData.from}
                          onChange={(e) => setFormData({...formData, from: e.target.value})}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                          disabled={!formData.state}
                        >
                          <option value="">Select pickup</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Destination City</label>
                        <select 
                          value={formData.to}
                          onChange={(e) => setFormData({...formData, to: e.target.value})}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                          disabled={!formData.state}
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
                      <label className="block text-sm font-medium text-charcoal mb-1">Earliest Pickup Time</label>
                      <input 
                        type="time"
                        value={formData.timeWindowStart}
                        onChange={(e) => setFormData({...formData, timeWindowStart: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Latest Pickup Time</label>
                      <input 
                        type="time"
                        value={formData.timeWindowEnd}
                        onChange={(e) => setFormData({...formData, timeWindowEnd: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle & Terminal Details */}
                <div className="col-span-full">
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaCar className="text-primary" /> Vehicle & Terminal
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Vehicle Name / Model</label>
                      <input 
                        type="text"
                        placeholder="e.g. Toyota Corolla, Nissan, Lexus 360"
                        value={formData.vehicleName}
                        onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Vehicle Plate Number</label>
                      <input 
                        type="text"
                        placeholder="e.g. LAG-123-XY"
                        value={formData.vehiclePlateNumber || ""}
                        onChange={(e) => setFormData({...formData, vehiclePlateNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Pickup Address / Terminal</label>
                      <input 
                        type="text"
                        placeholder="e.g. Conoil filling station, Festac"
                        value={formData.pickupAddress || ""}
                        onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Vehicle Category</label>
                      <select 
                        value={formData.vehicleType}
                        onChange={(e) => {
                          const vt = e.target.value;
                          let s = formData.seats;
                          if (vt.includes("SUV")) s = 5;
                          else if (vt === "Luxury Car") s = 4;
                          else if (vt === "Sedan (small car)") s = 4;
                          else if (vt.includes("7 seats")) s = 7;
                          setFormData({...formData, vehicleType: vt, seats: s});
                        }}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      >
                        <option value="Sedan (small car)">Sedan (small car)</option>
                        <option value="SUV / Crossover (5-7 seats)">SUV / Crossover (5-7 seats)</option>
                        <option value="Luxury Car">Luxury Car</option>
                        <option value="Sienna car (7 seats)">Sienna car (7 seats)</option>
                        <option value="Mini Buses (7 seater)">Mini Buses (7 seater)</option>
                      </select>
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
                    <div className="mt-1">
                      <p className="text-xs text-neutral-500 italic">
                        Lower price → faster bookings<br/>
                        Higher price → higher earnings per seat but slower fill
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">Standard Seat Price</span>
                      <span className="font-semibold text-blue-900">₦{Number(formData.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">Service Fee (5%)</span>
                      <span className="font-semibold text-blue-900">₦{calculateServiceFee(Number(formData.price || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">VAT (7.5%)</span>
                      <span className="font-semibold text-blue-900">₦{calculateVAT(calculateServiceFee(Number(formData.price || 0))).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                      <span className="font-bold text-blue-900">Total Customer Pays</span>
                      <span className="font-bold text-primary text-lg">₦{(Number(formData.price || 0) + calculateServiceFee(Number(formData.price || 0)) + calculateVAT(calculateServiceFee(Number(formData.price || 0)))).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                    <FaInfoCircle className="text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">Price Recommendation</p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        For Mainland ↔ Island routes, Morning & Evening hours:
                      </p>
                      <p className="text-xs font-bold text-amber-800 mt-1">Minimum: ₦1,500 | Maximum: ₦5,000</p>
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
