import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import {
  FaCreditCard,
  FaPaypal,
  FaUniversity,
  FaLock,
  FaCalendar,
  FaUser,
} from "react-icons/fa";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    trip,
    searchParams,
    passengers,
    passengerDetails,
    totalAmount,
    serviceFee = 5,
  } = location.state || {};

  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);

  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || passengerDetails?.[0]?.email || "",
    amount: Math.round(totalAmount * 100), // Paystack expects amount in Kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaystackSuccess = async (reference) => {
    try {
      setProcessing(true);
      // The booking was already created in handlePayment
      // Now we just verify it
      const bookingId = localStorage.getItem("lastPendingBookingId");

      if (!bookingId) {
        toast.error("Booking reference lost. Please contact support.");
        return;
      }

      // 2. Verify payment on backend
      const verifyRes = await api.get(
        `/payment/verify/${reference.reference}`,
        {
          params: { bookingId }, // Send booking ID for verification mapping
        },
      );

      if (verifyRes.data.success) {
        toast.success("Payment successful!");
        localStorage.removeItem("lastPendingBookingId");
        navigate("/booking/confirmation", {
          state: {
            trip,
            searchParams,
            passengers,
            passengerDetails,
            totalAmount,
            paymentMethod: "card",
            bookingId:
              verifyRes.data.data.metadata?.bookingReference || "Confirmed",
          },
        });
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error(error.response?.data?.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    toast.info("Transaction cancelled");
    setProcessing(false);
  };

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    if (paymentMethod === "card") {
      try {
        setProcessing(true);
        // 1. Create the booking on the backend first (status: pending)
        const bookingData = {
          tripId: trip.id,
          passengers,
          selectedSeats: location.state?.selectedSeats || [],
          paymentMethod: "card",
          totalAmount,
        };

        const bookingRes = await api.post("/bookings", bookingData);

        if (bookingRes.data.success) {
          const bookingId = bookingRes.data.booking.id;
          localStorage.setItem("lastPendingBookingId", bookingId);

          // 2. Initialize Paystack with the specific booking metadata
          const paystackConfig = {
            ...config,
            metadata: {
              bookingId,
              bookingReference: bookingRes.data.booking.bookingId,
            },
          };

          const initialize = () => {
            const handler = window.PaystackPop.setup({
              key: config.publicKey,
              email: config.email,
              amount: config.amount,
              ref: config.reference,
              metadata: {
                bookingId,
                bookingReference: bookingRes.data.booking.bookingId,
              },
              callback: function (response) {
                handlePaystackSuccess(response);
              },
              onClose: function () {
                handlePaystackClose();
              },
            });
            handler.openIframe();
          };

          // If react-paystack hook doesn't support dynamic config well enough,
          // we can use the library directly if loaded.
          // But let's try to trigger it.
          initialize();
        }
      } catch (error) {
        console.error("Booking creation error:", error);
        toast.error(error.response?.data?.message || "Booking failed");
        setProcessing(false);
      }
    } else {
      // Handle other methods
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        toast.info("This payment method is not yet fully integrated.");
      }, 1000);
    }
  };

  if (!trip) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl">
          <h1 className="text-2xl font-raleway font-bold text-charcoal mb-6">
            Payment
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Selection */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">
                  Select Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />
                    <FaCreditCard className="text-2xl text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">Credit / Debit Card</p>
                      <p className="text-sm text-neutral-600">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "paypal"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />
                    <FaPaypal className="text-2xl text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold">PayPal</p>
                      <p className="text-sm text-neutral-600">
                        Fast and secure
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "bank"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary"
                    />
                    <FaUniversity className="text-2xl text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold">Bank Transfer</p>
                      <p className="text-sm text-neutral-600">
                        Direct bank payment
                      </p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Paystack Info */}
              {paymentMethod === "card" && (
                <Card>
                  <div className="text-center py-8">
                    <FaLock className="text-6xl text-green-600 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-4">
                      Secure payment via Paystack. You can pay with your Card,
                      Bank Transfer, or USSD.
                    </p>
                    <div className="flex justify-center gap-4">
                      <img
                        src="https://paystack.com/assets/payment/cards.png"
                        alt="Cards"
                        className="h-8"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {paymentMethod === "paypal" && (
                <Card>
                  <div className="text-center py-8">
                    <FaPaypal className="text-6xl text-blue-600 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-4">
                      You will be redirected to PayPal to complete your payment
                    </p>
                  </div>
                </Card>
              )}

              {paymentMethod === "bank" && (
                <Card>
                  <div className="text-center py-8">
                    <FaUniversity className="text-6xl text-green-600 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-4">
                      Bank transfer instructions will be sent to your email
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <p className="text-neutral-600 mb-1">Trip</p>
                    <p className="font-semibold">{trip.company}</p>
                    <p className="text-neutral-600">
                      {trip.from} → {trip.to}
                    </p>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">Passengers:</span>
                      <span className="font-semibold">{passengers}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">
                        Price per person:
                      </span>
                      <span className="font-semibold">₦{trip.price}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">Subtotal:</span>
                      <span className="font-semibold">
                        ₦{trip.price * passengers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">Service Fee:</span>
                      <span className="font-semibold">₦{serviceFee}</span>
                    </div>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₦{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handlePayment}
                  disabled={processing}>
                  {processing ? "Processing..." : `Pay ₦${totalAmount}`}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(-1)}
                  className="mt-3"
                  disabled={processing}>
                  Back
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

export default Payment;
