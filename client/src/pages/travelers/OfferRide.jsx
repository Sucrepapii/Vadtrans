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
  FaSmoking,
  FaSmokingBan,
  FaPaw,
  FaSnowflake,
  FaMusic,
  FaSuitcase,
  FaCheck,
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
    departureDate: new Date().toISOString().split("T")[0],
    timeWindowStart: "07:00",
    timeWindowEnd: "07:15",
    seats: 3,
    price: "",
    departureTime: "07:00", // Will be set to timeWindowStart
    depositAmount: 0,
    cancellationWindow: 12,
    confirmationWindow: 2,
    vehicleName: "",
    preferences: {
      smoking: false,
      pets: false,
      music: true,
      ac: true,
      luggage: "small", // small, medium, large
    },
    stops: [], // [{ city: "", price: "" }]
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
        preferences: formData.preferences,
        stops: formData.stops.filter((s) => s.city && s.price),
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
                  <p className="text-neutral-400 text-sm">
                    Help others and save on fuel costs
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Route Section */}
                <div className="col-span-full">
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" /> Route
                    Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Select State
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            state: e.target.value,
                            from: "",
                            to: "",
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required>
                        <option value="">Choose a State</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">
                          Pickup City
                        </label>
                        <select
                          value={formData.from}
                          onChange={(e) =>
                            setFormData({ ...formData, from: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                          disabled={!formData.state}>
                          <option value="">Select pickup</option>
                          {cities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">
                          Destination City
                        </label>
                        <select
                          value={formData.to}
                          onChange={(e) =>
                            setFormData({ ...formData, to: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                          disabled={!formData.state}>
                          <option value="">Select destination</option>
                          {cities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
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
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.departureDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            departureDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Earliest Pickup Time
                      </label>
                      <input
                        type="time"
                        value={formData.timeWindowStart}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timeWindowStart: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Latest Pickup Time
                      </label>
                      <input
                        type="time"
                        value={formData.timeWindowEnd}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            timeWindowEnd: e.target.value,
                          })
                        }
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
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Vehicle Name / Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota Corolla, Nissan, Lexus 360"
                        value={formData.vehicleName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Vehicle Plate Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. LAG-123-XY"
                        value={formData.vehiclePlateNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehiclePlateNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Pickup Address / Terminal
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Conoil filling station, Festac"
                        value={formData.pickupAddress || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickupAddress: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Vehicle Category
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => {
                          const vt = e.target.value;
                          let s = formData.seats;
                          if (vt.includes("SUV")) s = 5;
                          else if (vt === "Luxury Car") s = 4;
                          else if (vt === "Sedan (small car)") s = 4;
                          else if (vt.includes("7 seats")) s = 7;
                          setFormData({
                            ...formData,
                            vehicleType: vt,
                            seats: s,
                          });
                        }}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required>
                        <option value="Sedan (small car)">
                          Sedan (small car)
                        </option>
                        <option value="SUV / Crossover (5-7 seats)">
                          SUV / Crossover (5-7 seats)
                        </option>
                        <option value="Luxury Car">Luxury Car</option>
                        <option value="Sienna car (7 seats)">
                          Sienna car (7 seats)
                        </option>
                        <option value="Mini Buses (7 seater)">
                          Mini Buses (7 seater)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Drop-off Stops Section */}
                <div className="col-span-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <FaMapMarkerAlt className="text-primary" /> Drop-off Stops
                      & Prices
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          stops: [...formData.stops, { city: "", price: "" }],
                        })
                      }
                      className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                      + Add Stop
                    </button>
                  </div>

                  {formData.stops.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl p-6 text-center">
                      <p className="text-xs text-neutral-500 italic">
                        No intermediate stops added. Click "+ Add Stop" to set
                        prices for cities along your route.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.stops.map((stop, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 ml-1">
                              City Name
                            </label>
                            <select
                              value={stop.city}
                              onChange={(e) => {
                                const newStops = [...formData.stops];
                                newStops[index].city = e.target.value;
                                setFormData({ ...formData, stops: newStops });
                              }}
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                              disabled={!formData.state}>
                              <option value="">Select city</option>
                              {cities.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32 sm:w-40">
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 ml-1">
                              Price (₦)
                            </label>
                            <input
                              type="number"
                              placeholder="2500"
                              value={stop.price}
                              onChange={(e) => {
                                const newStops = [...formData.stops];
                                newStops[index].price = e.target.value;
                                setFormData({ ...formData, stops: newStops });
                              }}
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newStops = formData.stops.filter(
                                (_, i) => i !== index,
                              );
                              setFormData({ ...formData, stops: newStops });
                            }}
                            className="p-3.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                            title="Remove Stop">
                            <FaCheck className="rotate-45" />{" "}
                            {/* Using FaCheck rotated since it's already imported */}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] text-neutral-400 flex items-center gap-1">
                    <FaInfoCircle className="text-primary/60" />
                    Tip: Add stops like "VI", "Ikoyi" if you're passing through
                    them to get more riders.
                  </p>
                </div>

                {/* Preferences Section */}
                <div className="col-span-full">
                  <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaInfoCircle className="text-primary" /> Ride Preferences
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Smoking */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            smoking: !formData.preferences.smoking,
                          },
                        })
                      }
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        formData.preferences.smoking
                          ? "bg-primary/5 border-primary text-primary shadow-md"
                          : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200"
                      }`}>
                      {formData.preferences.smoking ? (
                        <FaSmoking className="text-xl mb-2" />
                      ) : (
                        <FaSmokingBan className="text-xl mb-2" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Smoking
                      </span>
                    </button>

                    {/* Pets */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            pets: !formData.preferences.pets,
                          },
                        })
                      }
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        formData.preferences.pets
                          ? "bg-primary/5 border-primary text-primary shadow-md"
                          : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200"
                      }`}>
                      <FaPaw className="text-xl mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Pets
                      </span>
                    </button>

                    {/* AC */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            ac: !formData.preferences.ac,
                          },
                        })
                      }
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        formData.preferences.ac
                          ? "bg-primary/5 border-primary text-primary shadow-md"
                          : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200"
                      }`}>
                      <FaSnowflake className="text-xl mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        AC
                      </span>
                    </button>

                    {/* Music */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            music: !formData.preferences.music,
                          },
                        })
                      }
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        formData.preferences.music
                          ? "bg-primary/5 border-primary text-primary shadow-md"
                          : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200"
                      }`}>
                      <FaMusic className="text-xl mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Music
                      </span>
                    </button>

                    {/* Luggage */}
                    <div className="relative group">
                      <select
                        value={formData.preferences.luggage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              luggage: e.target.value,
                            },
                          })
                        }
                        className="w-full h-full appearance-none flex flex-col items-center justify-center p-4 rounded-2xl border-2 bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200 focus:border-primary focus:text-primary transition-all outline-none">
                        <option value="small">Small Luggage</option>
                        <option value="medium">Medium Bag</option>
                        <option value="large">Big Trunk</option>
                      </select>
                      <FaSuitcase className="absolute top-4 left-1/2 -translate-x-1/2 text-xl pointer-events-none" />
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                        Luggage
                      </span>
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
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Available Seats
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={formData.seats}
                        onChange={(e) =>
                          setFormData({ ...formData, seats: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">
                        Min Seats to start
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={formData.seats}
                        value={formData.minSeats}
                        onChange={(e) =>
                          setFormData({ ...formData, minSeats: e.target.value })
                        }
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
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Price per Seat (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      required
                    />
                    <div className="mt-1">
                      <p className="text-xs text-neutral-500 italic">
                        Lower price → faster bookings
                        <br />
                        Higher price → higher earnings per seat but slower fill
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">Standard Seat Price</span>
                      <span className="font-semibold text-blue-900">
                        ₦{Number(formData.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">Platform Commission (5%)</span>
                      <span className="font-semibold text-blue-900">
                        - ₦{Math.round(Number(formData.price || 0) * 0.05).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">Your Earnings per Seat</span>
                      <span className="font-semibold text-green-700">
                        ₦{(Number(formData.price || 0) - Math.round(Number(formData.price || 0) * 0.05)).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                      <span className="font-bold text-blue-900">
                        Total Customer Pays
                      </span>
                      <span className="font-bold text-primary text-lg">
                        ₦{Number(formData.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                    <FaInfoCircle className="text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">
                        Price Recommendation
                      </p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        For Mainland ↔ Island routes, Morning, Afternoon & Evening hours:
                      </p>
                      <p className="text-xs font-bold text-amber-800 mt-1">
                        Minimum: ₦1,500 | Maximum: ₦5,000
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/20"
                  disabled={loading}>
                  {loading ? "Posting..." : "Post Carpool Ride"}
                </Button>
                <p className="text-center text-xs text-neutral-400 mt-4">
                  By posting, you agree to our Carpooling Terms & Safety
                  Guidelines.
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
