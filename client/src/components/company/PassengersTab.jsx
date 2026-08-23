import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { bookingAPI } from "../../services/api";
import Card from "../Card";
import {
  FaUsers,
  FaSpinner,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBus,
} from "react-icons/fa";

const PassengersTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getCompanyBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Error fetching company bookings:", error);
      toast.error("Failed to load passenger list");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-700">
            <FaCheckCircle className="text-[10px]" /> Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-green-100 text-green-700">
            <FaCheckCircle className="text-[10px]" /> Paid
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-700">
            <FaTimesCircle className="text-[10px]" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-green-100 text-green-700 border border-green-200">
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-green-100 text-green-700 border border-green-200">
            Paid
          </span>
        );
      case "refunded":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-primary mb-4" />
        <p className="text-neutral-500">Loading passenger bookings...</p>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <FaUsers className="text-4xl text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">
          No Passengers Yet
        </h3>
        <p className="text-neutral-500 max-w-md">
          When travelers book tickets for your trips, their details will appear
          here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-charcoal">
          Passenger Bookings
        </h2>
        <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          Total: {bookings.length}
        </span>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Trip & Booking Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FaBus className="text-primary text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">
                        {booking.trip
                          ? `${booking.trip.from} → ${booking.trip.to}`
                          : "Trip Unavailable"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {booking.bookingId || `ID: ${booking.id}`} • Booked on{" "}
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
                  <h4 className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                    <FaUsers className="text-neutral-400" />
                    Passengers ({booking.passengers?.length || 0})
                  </h4>
                  <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                    {booking.passengers &&
                      booking.passengers.map((passenger, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm border-b border-neutral-200 last:border-0 pb-2 last:pb-0">
                          <div>
                            <p className="font-medium text-charcoal">
                              {passenger.firstName} {passenger.lastName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {passenger.email} • {passenger.phone}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium bg-neutral-200 text-neutral-700 px-2 py-1 rounded">
                              Seat:{" "}
                              {booking.selectedSeats &&
                              booking.selectedSeats[idx]
                                ? booking.selectedSeats[idx]
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="md:w-64 bg-neutral-50 rounded-xl p-4 flex flex-col justify-between border border-neutral-100">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-700 border-b border-neutral-200 pb-2">
                    Payment Details
                  </h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600">Method:</span>
                    <span className="font-medium capitalize">
                      {booking.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-600">Status:</span>
                    {getPaymentBadge(booking.paymentStatus)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                    <FaCalendarAlt />
                    {new Date(booking.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-neutral-600">Customer Paid</span>
                    <p className="text-sm font-medium text-neutral-600 line-through">
                      ₦{Number(booking.totalAmount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-neutral-600">Vadtrans Fee (5%)</span>
                    <p className="text-sm font-medium text-red-500">
                      -₦{Number(booking.serviceFee || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-end pt-1 border-t border-neutral-100">
                    <span className="text-sm font-semibold text-neutral-800">Your Earnings</span>
                    <p className="text-xl font-bold font-raleway text-primary">
                      ₦{Number(booking.totalAmount - (booking.serviceFee || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PassengersTab;
