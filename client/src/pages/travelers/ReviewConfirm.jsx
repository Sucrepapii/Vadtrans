import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { calculateServiceFee } from "../../utils/pricing";
import {
  FaUser,
  FaChair,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";

const ReviewConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, passengers, selectedSeats, paymentMethod, cardDetails } =
    location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);

  const pricePerPerson = Number(tripData?.price) || 0;
  const subtotal = (passengers?.length || 0) * pricePerPerson;
  const serviceFee = calculateServiceFee(subtotal);
  const total = subtotal + serviceFee;

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);

      // Create booking in database
      const bookingData = {
        tripId: tripData.id,
        passengers,
        selectedSeats,
        paymentMethod,
        totalAmount: total, // Send calculated total to backend
      };

      console.log("📤 Creating booking:", bookingData);
      const response = await bookingAPI.createBooking(bookingData);
      console.log("✅ Booking created:", response.data);

      toast.success("Booking confirmed successfully!");

      // Navigate to confirmation page with booking details
      navigate("/booking/confirmation", {
        state: {
          trip: tripData,
          bookingId: response.data.booking.bookingId,
          passengers,
          passengerDetails: passengers,
          selectedSeats,
          totalAmount: total,
          paymentMethod,
        },
      });
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error message:", error.response?.data?.error);
      toast.error(error.response?.data?.message || "Failed to create booking");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {["Passenger Info", "Seat Selection", "Payment", "Review"].map(
                (step, idx) => (
                  <div key={step} className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
                      {idx + 1}
                    </div>
                    {idx < 3 && (
                      <div className="w-12 md:w-24 h-1 bg-primary mx-1"></div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Back Button */}
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-4">
            <FaArrowLeft />
            <span>Back to Payment</span>
          </Button>

          <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal mb-6">
            Review & Confirm
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Passenger Information */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaUser className="text-primary" />
                  <h3 className="font-semibold">Passenger Information</h3>
                </div>
                <div className="space-y-3">
                  {passengers?.map((passenger, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 rounded">
                      <p className="font-medium">
                        Passenger {idx + 1}: {passenger.firstName}{" "}
                        {passenger.lastName}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {passenger.email} • {passenger.phone}
                      </p>
                      <p className="text-sm text-neutral-600">
                        ID: {passenger.idNumber}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Seat Selection */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaChair className="text-primary" />
                  <h3 className="font-semibold">Selected Seats</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats?.map((seat) => (
                    <div
                      key={seat}
                      className="px-4 py-2 bg-primary text-white rounded">
                      Seat {seat}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment Method */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaCreditCard className="text-primary" />
                  <h3 className="font-semibold">Payment Method</h3>
                </div>
                <div className="p-3 bg-neutral-50 rounded">
                  <p className="font-medium capitalize">
                    {paymentMethod === "card"
                      ? "Credit/Debit Card"
                      : paymentMethod === "bank"
                      ? "Bank Transfer"
                      : "Mobile Money"}
                  </p>
                  {paymentMethod === "card" && cardDetails && (
                    <p className="text-sm text-neutral-600 mt-1">
                      •••• •••• •••• {cardDetails.cardNumber?.slice(-4)}
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Price Summary */}
            <div>
              <Card className="sticky top-4">
                <h3 className="font-semibold mb-4">Price Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      {passengers?.length} Passenger(s) × ₦
                      {pricePerPerson.toLocaleString()}
                    </span>
                    <span className="font-medium">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Service Fee</span>
                    <span className="font-medium">
                      ₦{serviceFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary text-xl">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaCheckCircle />
                      <span>Confirm & Pay</span>
                    </div>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(-1)}
                  className="mt-3">
                  Back to Payment
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReviewConfirm;
