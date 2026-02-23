import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "../../context/AuthContext";
import api, { bookingAPI } from "../../services/api";
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
  const { user } = useAuth();
  const { tripData, passengers, selectedSeats, paymentMethod } =
    location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);

  const pricePerPerson = Number(tripData?.price) || 0;
  const subtotal = (passengers?.length || 0) * pricePerPerson;
  const serviceFee = calculateServiceFee(subtotal);
  const total = subtotal + serviceFee;

  // Stabilize the config to prevent hook re-initialization issues
  const paystackConfig = React.useMemo(() => {
    const email = user?.email || passengers?.[0]?.email || "";
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    return {
      reference: new Date().getTime().toString(),
      email,
      amount: Math.round(total * 100),
      publicKey,
    };
  }, [user?.email, passengers?.[0]?.email, total]);

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference) => {
    setIsProcessing(true);
    const bookingId = localStorage.getItem("lastPendingBookingId");
    const savedRef =
      localStorage.getItem("lastPendingBookingRef") ||
      `BK-${bookingId || Date.now()}`;

    // Helper to navigate to confirmation — always called after Paystack approval
    const goToConfirmation = () => {
      localStorage.removeItem("lastPendingBookingId");
      localStorage.removeItem("lastPendingBookingRef");
      navigate("/booking/confirmation", {
        state: {
          trip: tripData,
          bookingId: savedRef,
          passengers,
          passengerDetails: passengers,
          selectedSeats,
          totalAmount: total,
          paymentMethod,
          searchParams: {
            date:
              tripData?.departureDate ||
              tripData?.date ||
              new Date().toLocaleDateString(),
          },
        },
      });
    };

    try {
      if (!bookingId) {
        // No booking ID but Paystack approved — still show ticket
        toast.success("Payment approved! Your booking is being processed.");
        goToConfirmation();
        return;
      }

      // Verify payment on backend
      const verifyRes = await api.get(
        `/payment/verify/${reference.reference}`,
        { params: { bookingId } },
      );

      if (verifyRes.data.success) {
        toast.success("Booking confirmed successfully!");
      } else {
        toast.warning("Payment received — booking confirmation pending.");
      }
      goToConfirmation();
    } catch (error) {
      console.error("Payment verification error:", error);
      // Paystack already approved payment — still show ticket, don't block the user
      toast.warning(
        "Payment approved by Paystack! Booking confirmation is being processed.",
      );
      goToConfirmation();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    toast.info("Transaction cancelled");
    setIsProcessing(false);
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "card") {
      try {
        setIsProcessing(true);
        // 1. Create the booking on the backend first (status: pending)
        const bookingData = {
          tripId: tripData.id,
          passengers,
          selectedSeats: selectedSeats || [],
          paymentMethod: "card",
          totalAmount: total,
        };

        const response = await bookingAPI.createBooking(bookingData);

        if (response.data.success) {
          const bookingId = response.data.booking.id;
          const bookingRef =
            response.data.booking.bookingId || `BK-${bookingId}`;
          localStorage.setItem("lastPendingBookingId", bookingId);
          localStorage.setItem("lastPendingBookingRef", bookingRef);

          // Validation before opening
          if (!paystackConfig.publicKey) {
            console.error("❌ Paystack Public Key is missing!");
            toast.error("Payment configuration error. Please contact support.");
            setIsProcessing(false);
            return;
          }

          if (!paystackConfig.email) {
            console.error("❌ Email is missing for Paystack!");
            toast.error("Contact email is required for payment.");
            setIsProcessing(false);
            return;
          }

          // Use the hook-provided initialize function (react-paystack v6 syntax)
          initializePayment({
            onSuccess: handlePaystackSuccess,
            onClose: handlePaystackClose,
          });
        }
      } catch (error) {
        console.error("Booking creation error:", error);
        toast.error(error.response?.data?.message || "Booking failed");
        setIsProcessing(false);
      }
    } else {
      // For bank transfer, we can keep the simulation or process differently
      try {
        setIsProcessing(true);
        const bookingData = {
          tripId: tripData.id,
          passengers,
          selectedSeats,
          paymentMethod,
          totalAmount: total,
        };
        const response = await bookingAPI.createBooking(bookingData);
        const bookingRef =
          response.data.booking?.bookingId ||
          `BK-${response.data.booking?.id || Date.now()}`;
        toast.success("Booking requested! Please complete manual payment.");
        navigate("/booking/confirmation", {
          state: {
            trip: tripData,
            bookingId: bookingRef,
            passengers,
            passengerDetails: passengers,
            selectedSeats,
            totalAmount: total,
            paymentMethod,
            searchParams: {
              date:
                tripData?.departureDate ||
                tripData?.date ||
                new Date().toLocaleDateString(),
            },
          },
        });
      } catch (error) {
        toast.error("Failed to create booking");
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    navigate("/booking/seat-selection", {
      state: { tripData, passengers, selectedSeats },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {["Passenger Info", "Seat Selection", "Review & Pay"].map(
                (step, idx) => (
                  <div key={step} className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
                      {idx + 1}
                    </div>
                    {idx < 2 && (
                      <div className="w-12 md:w-24 h-1 bg-primary mx-1"></div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm mb-4">
            <FaArrowLeft />
            <span>Back to Seat Selection</span>
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
                  {paymentMethod === "card" && (
                    <p className="text-sm text-neutral-600 mt-1">
                      Payment via Paystack
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
                  <p className="text-xs text-neutral-500 italic mt-1 pb-2">
                    This service fee helps us verify transport partners,
                    maintain the platform, and provide customer support for a
                    smooth and reliable travel experience.
                  </p>
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
                  onClick={handleBack}
                  className="mt-3">
                  Back to Seat Selection
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
