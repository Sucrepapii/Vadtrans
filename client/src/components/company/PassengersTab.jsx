import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { bookingAPI, privateRideAPI } from "../../services/api";
import Card from "../Card";
import {
  FaUsers,
  FaSpinner,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBus,
  FaCar,
  FaMapMarkerAlt,
  FaSuitcase,
  FaSnowflake,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";

const PassengersTab = () => {
  const [sharedBookings, setSharedBookings] = useState([]);
  const [privateRides, setPrivateRides] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'shared' | 'private'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPassengers();
  }, []);

  const fetchAllPassengers = async () => {
    try {
      setLoading(true);
      const [sharedRes, privateRes] = await Promise.allSettled([
        bookingAPI.getCompanyBookings(),
        privateRideAPI.getDriverAssignedRides(),
      ]);

      if (sharedRes.status === "fulfilled" && sharedRes.value.data?.success) {
        setSharedBookings(sharedRes.value.data.bookings || []);
      }
      if (privateRes.status === "fulfilled" && privateRes.value.data?.success) {
        setPrivateRides(privateRes.value.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching passengers:", error);
      toast.error("Failed to load passenger list");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
            <FaCheckCircle className="text-[10px]" /> {status}
          </span>
        );
      case "driver_assigned":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700 border border-blue-200">
            <FaCheckCircle className="text-[10px]" /> Assigned
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            In Progress
          </span>
        );
      case "pending":
      case "awaiting_payment":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-700 border border-red-200">
            <FaTimesCircle className="text-[10px]" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Pending
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  const totalPassengersCount =
    sharedBookings.reduce((sum, b) => sum + (b.passengers?.length || 1), 0) +
    privateRides.reduce((sum, r) => sum + (parseInt(r.passengersCount) || 1), 0);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-primary mb-4" />
        <p className="text-neutral-500">Loading passenger bookings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaUsers className="text-primary" /> Passenger Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View all travelers currently booked for your shared trips and private rides
          </p>
        </div>

        {/* Tab Filters */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Bookings ({sharedBookings.length + privateRides.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("shared")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === "shared"
                ? "bg-white text-blue-600 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FaBus className="text-xs" />
            Shared ({sharedBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("private")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === "private"
                ? "bg-white text-purple-600 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FaCar className="text-xs" />
            Private ({privateRides.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: SHARED RIDE PASSENGERS */}
      {(activeFilter === "all" || activeFilter === "shared") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <FaBus className="text-sm" />
              </span>
              <h3 className="font-bold text-gray-800 text-base">
                Shared Bus / Trip Passengers
              </h3>
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {sharedBookings.length} booking(s)
            </span>
          </div>

          {sharedBookings.length === 0 ? (
            <Card className="py-8 text-center text-gray-400 text-xs">
              No shared ride bookings found for your scheduled trips.
            </Card>
          ) : (
            <div className="grid gap-4">
              {sharedBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Trip & Booking Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                            <FaBus className="text-blue-600 text-lg" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {booking.trip
                                ? `${booking.trip.from} → ${booking.trip.to}`
                                : "Trip Unavailable"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {booking.bookingId || `BK-${booking.id}`} • Booked on{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(booking.bookingStatus)}
                        </div>
                      </div>

                      {/* Passenger List */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FaUsers className="text-gray-400" />
                          Manifest Passengers ({booking.passengers?.length || 0})
                        </h4>
                        <div className="bg-gray-50/70 rounded-xl p-3 space-y-2 border border-gray-100">
                          {booking.passengers &&
                            booking.passengers.map((passenger, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs border-b border-gray-200/60 last:border-0 pb-2 last:pb-0"
                              >
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {passenger.firstName} {passenger.lastName}
                                  </p>
                                  <p className="text-[11px] text-gray-500">
                                    {passenger.email} • {passenger.phone}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                                    Seat:{" "}
                                    {booking.selectedSeats && booking.selectedSeats[idx]
                                      ? booking.selectedSeats[idx]
                                      : idx + 1}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="md:w-64 bg-gray-50/60 rounded-xl p-4 flex flex-col justify-between border border-gray-100">
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">
                          Payment Breakdown
                        </h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Method:</span>
                          <span className="font-medium capitalize text-gray-800">
                            {booking.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Status:</span>
                          {getPaymentBadge(booking.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                          <FaCalendarAlt className="text-[10px]" />
                          {new Date(booking.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-gray-500">Customer Paid:</span>
                          <span className="font-medium text-gray-600 line-through">
                            ₦{Number(booking.totalAmount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-gray-500">Vadtrans Fee (5%):</span>
                          <span className="font-medium text-red-500">
                            -₦{Number(booking.serviceFee || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pt-1 border-t border-gray-200">
                          <span className="text-xs font-bold text-gray-800">Net Earnings:</span>
                          <span className="text-base font-black text-emerald-600">
                            ₦{Number(booking.totalAmount - (booking.serviceFee || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PRIVATE RIDE PASSENGERS */}
      {(activeFilter === "all" || activeFilter === "private") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <FaCar className="text-sm" />
              </span>
              <h3 className="font-bold text-gray-800 text-base">
                Private Ride Passengers
              </h3>
            </div>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {privateRides.length} ride(s)
            </span>
          </div>

          {privateRides.length === 0 ? (
            <Card className="py-8 text-center text-gray-400 text-xs">
              No private ride passengers assigned to you yet. Accept bids on the Driver Console to receive private rides.
            </Card>
          ) : (
            <div className="grid gap-4">
              {privateRides.map((ride) => (
                <Card
                  key={ride.id}
                  className="overflow-hidden hover:shadow-md transition-shadow border border-purple-100/70"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Route & Passenger Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                            <FaCar className="text-purple-600 text-lg" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                              <span>{ride.pickupLocation}</span>
                              <span className="text-gray-400">→</span>
                              <span>{ride.destination}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              {ride.requestId || `PR-${ride.id}`} • {ride.rideType === "round-trip" ? "Round Trip" : "One-Way Charter"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(ride.status)}
                        </div>
                      </div>

                      {/* Passenger Details */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FaUser className="text-gray-400" />
                          Passenger Contact &amp; Trip Notes
                        </h4>
                        <div className="bg-purple-50/40 rounded-xl p-3 space-y-2 border border-purple-100/60">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {ride.passenger?.name || "Private Passenger"}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-gray-600 mt-1">
                                {ride.passenger?.phone && (
                                  <a
                                    href={`tel:${ride.passenger.phone}`}
                                    className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                                  >
                                    <FaPhoneAlt className="text-[10px]" /> {ride.passenger.phone}
                                  </a>
                                )}
                                {ride.passenger?.email && (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <FaEnvelope className="text-[10px]" /> {ride.passenger.email}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-bold bg-white text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs inline-block">
                                {ride.passengersCount || 1} Passenger(s)
                              </span>
                            </div>
                          </div>

                          {/* Extra requirements */}
                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-purple-100/80 text-[11px] text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400 text-[10px]" />
                              Pickup: <strong>{ride.pickupDate}</strong> at <strong>{ride.pickupTime}</strong>
                            </span>
                            {ride.luggageInfo && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <FaSuitcase className="text-gray-400 text-[10px]" />
                                Luggage: {ride.luggageInfo}
                              </span>
                            )}
                            {ride.needsAC && (
                              <span className="flex items-center gap-1 text-blue-700 font-semibold">
                                <FaSnowflake className="text-blue-500 text-[10px]" />
                                AC Requested
                              </span>
                            )}
                          </div>

                          {ride.specialNotes && (
                            <div className="text-[11px] text-gray-500 italic bg-white/70 p-2 rounded-lg border border-purple-100/40">
                              &ldquo;{ride.specialNotes}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Private Ride Earnings & Financial Breakdown */}
                    <div className="md:w-64 bg-purple-50/40 rounded-xl p-4 flex flex-col justify-between border border-purple-100/60">
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-purple-200/80 pb-2">
                          Agreed Fare &amp; Payout
                        </h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Ride Type:</span>
                          <span className="font-semibold text-purple-700 uppercase text-[10px]">
                            Private Charter
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Payment:</span>
                          {getPaymentBadge(ride.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                          <FaCalendarAlt className="text-[10px]" />
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-purple-200/80 space-y-1">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-gray-500">Agreed Price:</span>
                          <span className="font-medium text-gray-700">
                            ₦{Number(ride.agreedPrice).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-gray-500">Commission (20%):</span>
                          <span className="font-medium text-red-500">
                            -₦{Number(ride.commissionAmount || ride.agreedPrice * 0.2).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pt-1 border-t border-purple-200">
                          <span className="text-xs font-bold text-gray-800">Your Earnings:</span>
                          <span className="text-base font-black text-emerald-600">
                            ₦{Number(ride.agreedPrice - (ride.commissionAmount || ride.agreedPrice * 0.2)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PassengersTab;
