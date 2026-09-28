import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "../../context/AuthContext";
import api, { bookingAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { calculateServiceFee, calculateVAT } from "../../utils/pricing";
import {
  FaUser,
  FaChair,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaSpinner,
  FaBus,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

const ReviewConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setTransactionActive } = useAuth();
  const { tripData, passengers, selectedSeats, paymentMethod, searchDate } =
    location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentOption, setPaymentOption] = useState("full"); // "full" or "deposit"

  const calculatePassengerPrice = (passenger) => {
    // Use the specific price selected (for carpooling stops) if available
    const basePrice = Number(tripData?.selectedPrice || tripData?.price || 0);

    // Only apply document pricing for international trips
    if (tripData?.transportType !== "international") {
      return basePrice;
    }

    const docType = passenger.documentType || "No Document";
    const docPrices = tripData?.documentPrices || {};
    const specificPrice = docPrices[docType];

    // Use specific price if set, otherwise fallback to basePrice
    return specificPrice && Number(specificPrice) > 0
      ? Number(specificPrice)
      : basePrice;
  };

  const passengerCount = passengers?.length || 0;
  const subtotal = passengers?.reduce(
    (acc, p) => acc + calculatePassengerPrice(p),
    0,
  );
  const serviceFee = calculateServiceFee(subtotal);
  const vat = calculateVAT(serviceFee);
  const total = subtotal + serviceFee + vat;

  const isCarpool = tripData?.transportType === "carpooling";
  const depositAmount = total * 0.05; // 5% deposit
  const amountToPay = paymentOption === "deposit" ? depositAmount : total;

  const [paystackRef, setPaystackRef] = useState(() => {
    return (
      localStorage.getItem("lastPaystackRef") ||
      sessionStorage.getItem("lastPaystackRef") ||
      new Date().getTime().toString()
    );
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(() => {
    const id =
      localStorage.getItem("lastPendingBookingId") ||
      sessionStorage.getItem("lastPendingBookingId");
    const ref =
      localStorage.getItem("lastPendingBookingRef") ||
      sessionStorage.getItem("lastPendingBookingRef");
    return id ? { id, ref } : null;
  });

  // Re-check when window/tab regains focus or visibility (e.g. user returns from bank app)
  useEffect(() => {
    const handleRecheck = () => {
      if (document.visibilityState === "visible" || document.hasFocus()) {
        const pendingId =
          localStorage.getItem("lastPendingBookingId") ||
          sessionStorage.getItem("lastPendingBookingId");
        if (pendingId) {
          checkPendingPaymentStatus(pendingId, false);
        }
      }
    };
    window.addEventListener("focus", handleRecheck);
    document.addEventListener("visibilitychange", handleRecheck);
    return () => {
      window.removeEventListener("focus", handleRecheck);
      document.removeEventListener("visibilitychange", handleRecheck);
    };
  }, [paystackRef]);

  // Stabilize the config to prevent hook re-initialization issues
  const paystackConfig = React.useMemo(() => {
    const email = user?.email || passengers?.[0]?.email || "";
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    const currentBookingId =
      pendingBookingData?.id ||
      localStorage.getItem("lastPendingBookingId") ||
      sessionStorage.getItem("lastPendingBookingId");

    return {
      reference: paystackRef,
      email,
      amount: Math.round(amountToPay * 100),
      publicKey,
      metadata: {
        bookingId: currentBookingId,
        custom_fields: [
          {
            display_name: "Booking ID",
            variable_name: "bookingId",
            value: currentBookingId,
          },
          {
            display_name: "Route",
            variable_name: "route",
            value: `${tripData?.from || ""} - ${tripData?.to || ""}`,
          },
        ],
      },
    };
  }, [
    user?.email,
    passengers?.[0]?.email,
    amountToPay,
    paystackRef,
    pendingBookingData?.id,
    tripData?.from,
    tripData?.to,
  ]);

  const initializePayment = usePaystackPayment(paystackConfig);

  // Helper to navigate to confirmation — always called after Paystack approval
  const goToConfirmation = (confirmedBooking = null) => {
    const bookingId =
      confirmedBooking?.id ||
      localStorage.getItem("lastPendingBookingId") ||
      sessionStorage.getItem("lastPendingBookingId");
    const savedRef =
      confirmedBooking?.bookingId ||
      localStorage.getItem("lastPendingBookingRef") ||
      sessionStorage.getItem("lastPendingBookingRef") ||
      `BK-${bookingId || Date.now()}`;

    localStorage.removeItem("lastPendingBookingId");
    localStorage.removeItem("lastPendingBookingRef");
    localStorage.removeItem("lastPaystackRef");
    sessionStorage.removeItem("lastPendingBookingId");
    sessionStorage.removeItem("lastPendingBookingRef");
    sessionStorage.removeItem("lastPaystackRef");

    navigate("/booking/confirmation", {
      state: {
        trip: confirmedBooking?.trip || tripData,
        bookingId: savedRef,
        passengers: confirmedBooking?.passengers || passengers,
        passengerDetails: confirmedBooking?.passengers || passengers,
        selectedSeats: confirmedBooking?.selectedSeats || selectedSeats,
        totalAmount: confirmedBooking?.totalAmount || total,
        paidAmount: confirmedBooking?.paidAmount || amountToPay,
        isDeposit: paymentOption === "deposit",
        paymentMethod: "card",
        searchParams: {
          date:
            searchDate ||
            tripData?.departureDate ||
            tripData?.date ||
            new Date().toLocaleDateString(),
        },
      },
    });
  };

  // Check if pending booking has already been paid or verify it
  const checkPendingPaymentStatus = async (bookingIdToCheck, manual = false) => {
    const id = bookingIdToCheck || pendingBookingData?.id || sessionStorage.getItem("lastPendingBookingId");
    const ref = pendingBookingData?.ref || sessionStorage.getItem("lastPendingBookingRef") || `BK-${id}`;
    if (!id) return;

    try {
      if (manual) setIsVerifying(true);
      // First check if booking is already marked paid on backend
      const res = await bookingAPI.getBooking(id).catch(() => null);
      if (res?.data?.booking?.paymentStatus === "paid") {
        toast.success("Payment confirmed! Generating your e-ticket...");
        goToConfirmation(res.data.booking);
        return;
      }

      // If not marked paid yet, try verifying transaction with Paystack using saved reference
      const lastTxRef = sessionStorage.getItem("lastPaystackRef") || paystackRef;
      if (lastTxRef) {
        const verifyRes = await bookingAPI.verifyPayment(lastTxRef, id).catch(() => null);
        if (verifyRes?.data?.success) {
          toast.success("Payment verified successfully! Generating your ticket...");
          goToConfirmation(verifyRes.data.booking || { bookingId: ref, id });
          return;
        }
      }

      if (manual) {
        toast.warning("Payment has not been confirmed yet. If you completed the bank transfer, please allow a moment and check again.");
      }
    } catch (err) {
      console.warn("Payment check warning:", err.message);
      if (manual) {
        toast.error("Could not verify payment yet. Please ensure the transfer was sent.");
      }
    } finally {
      if (manual) setIsVerifying(false);
    }
  };

  const handlePaystackSuccess = async (reference) => {
    setTransactionActive(false);
    setIsProcessing(true);
    const bookingId = sessionStorage.getItem("lastPendingBookingId");

    try {
      
      
      
      

      if (!bookingId) {
        // No booking ID but Paystack approved — still show ticket
        console.warn("⚠️ No bookingId found in session storage, but payment was successful.");
        toast.success("Payment approved! Your booking is being processed.");
        goToConfirmation();
        return;
      }

      // Verify payment on backend
      
      const refString = reference?.reference || reference?.trxref || (typeof reference === "string" ? reference : "");
      const verifyRes = await bookingAPI.verifyPayment(
        refString,
        bookingId,
      );

      if (verifyRes.data.success) {
        toast.success("Booking confirmed successfully!");
      } else {
        console.warn("⚠️ Backend returned success:false for verification");
        toast.warning("Payment received — booking confirmation pending.");
      }
      goToConfirmation(verifyRes.data.booking);
    } catch (error) {
      console.error("❌ Payment verification error:", error);
      console.error("📄 Error Response:", error.response?.data);
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
    setTransactionActive(false);
    setIsProcessing(false);

    // DO NOT DELETE BOOKING!
    // When customer transfers from their bank app or USSD, the modal often closes or loses focus.
    const bookingId = sessionStorage.getItem("lastPendingBookingId");
    if (bookingId) {
      toast.info("Payment window closed. If you moved to your bank app to transfer, click 'I Have Paid / Confirm Ticket' below.");
      // Check in background if payment succeeded
      checkPendingPaymentStatus(bookingId, false);
    } else {
      toast.info("Transaction cancelled");
    }
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
          paidAmount: amountToPay,
          isDeposit: paymentOption === "deposit",
        };

        const response = await bookingAPI.createBooking(bookingData);

        if (response.data.success) {
          const bookingId = response.data.booking.id;
          const bookingRef =
            response.data.booking.bookingId || `BK-${bookingId}`;
          const newTxRef = new Date().getTime().toString();
          setPaystackRef(newTxRef);
          localStorage.setItem("lastPendingBookingId", bookingId);
          localStorage.setItem("lastPendingBookingRef", bookingRef);
          localStorage.setItem("lastPaystackRef", newTxRef);
          sessionStorage.setItem("lastPendingBookingId", bookingId);
          sessionStorage.setItem("lastPendingBookingRef", bookingRef);
          sessionStorage.setItem("lastPaystackRef", newTxRef);
          setPendingBookingData({ id: bookingId, ref: bookingRef });

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
          setTransactionActive(true);
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
            paidAmount: total, // bank is always full for now in this flow
            isDeposit: false,
            paymentMethod,
            searchParams: {
              date:
                searchDate ||
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
              {/* Trip Summary */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaBus className="text-primary" />
                  <h3 className="font-semibold">Trip Summary</h3>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-lg font-bold text-charcoal">
                        {tripData?.from} → {tripData?.selectedDestination || tripData?.to}
                      </p>
                      {tripData?.selectedDestination && tripData.selectedDestination !== tripData.to && (
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded border border-green-100 inline-block mt-1">
                          Drop-off Stop selected
                        </p>
                      )}
                      <p className="text-sm text-neutral-600 mt-1">
                        {searchDate || tripData?.departureDate || "Scheduled Date"} • {tripData?.departureTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Vehicle</p>
                      <p className="font-bold text-charcoal">{tripData?.vehicleName || "Assigned Vehicle"}</p>
                      <p className="text-[10px] text-neutral-500">{tripData?.vehicleType}</p>
                    </div>
                  </div>
                  {tripData?.terminal && (
                    <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
                      <FaMapMarkerAlt className="text-primary text-xs" />
                      <p className="text-xs text-neutral-600 font-medium">{tripData.terminal}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Passenger Information */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaUser className="text-primary" />
                  <h3 className="font-semibold">Passenger Information</h3>
                </div>
                <div className="space-y-3">
                  {passengers?.map((passenger, idx) => {
                    const price = calculatePassengerPrice(passenger);
                    return (
                      <div key={idx} className="p-3 bg-neutral-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              Passenger {idx + 1}: {passenger.firstName}{" "}
                              {passenger.lastName}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {passenger.email} • {passenger.phone}
                            </p>
                            <p className="text-sm text-neutral-600">
                              ID: {passenger.idNumber}
                              {tripData?.transportType === "international" &&
                                ` (${passenger.documentType || "No Document"})`}
                            </p>
                          </div>
                          <span className="font-medium text-sm">
                            ₦{price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaCreditCard className="text-primary" />
                  <h3 className="font-semibold">Payment Option</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${paymentOption === "full" ? "border-primary bg-primary/5" : "border-neutral-200 bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-charcoal">Pay Full Amount</span>
                      <input 
                        type="radio" 
                        name="paymentOption" 
                        value="full" 
                        checked={paymentOption === "full"} 
                        onChange={() => setPaymentOption("full")}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                    <p className="text-sm text-neutral-600">Pay ₦{total.toLocaleString()} now</p>
                  </label>

                  <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${paymentOption === "deposit" ? "border-primary bg-primary/5" : "border-neutral-200 bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-charcoal">Reserve with 5% Deposit</span>
                      <input 
                        type="radio" 
                        name="paymentOption" 
                        value="deposit" 
                        checked={paymentOption === "deposit"} 
                        onChange={() => setPaymentOption("deposit")}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                    <p className="text-sm text-neutral-600">Pay ₦{depositAmount.toLocaleString()} now to hold your seat</p>
                  </label>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                  <h4 className="font-bold text-sm text-charcoal mb-2">Cancellation Policy</h4>
                  <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                    <li>Free cancellation up to 12 hours before trip (full refund)</li>
                    <li>Cancellation within 12 hours → 5% fee</li>
                    <li>Cancellation within 3 hours → no refund</li>
                    <li className="font-medium text-amber-700">Deposits are non-refundable</li>
                  </ul>
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
                      {passengers?.length} Passenger(s)
                    </span>
                    <span className="font-medium">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Service Fee (5%)</span>
                      <span className="font-medium">
                        ₦{serviceFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {vat > 0 && (
                    <div className="flex justify-between text-sm border-b pb-2">
                      <span className="text-neutral-600">VAT (7.5%)</span>
                      <span className="font-medium">₦{vat.toLocaleString()}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <p className="text-xs text-neutral-500 italic mt-1 pb-2">
                      This service fee helps us verify transport partners,
                      maintain the platform, and provide customer support for a
                      smooth and reliable travel experience.
                    </p>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">{(isCarpool && paymentOption === "deposit") ? "Deposit to Pay" : "Total"}</span>
                    <span className="font-bold text-primary text-xl">
                      ₦{amountToPay.toLocaleString()}
                    </span>
                  </div>
                  {(isCarpool && paymentOption === "deposit") && (
                    <p className="text-[10px] text-neutral-500 mt-1 italic">
                      Balance of ₦{(total - amountToPay).toLocaleString()} to be paid directly to the driver.
                    </p>
                  )}
                </div>

                {pendingBookingData && (
                  <div className="bg-gradient-to-r from-amber-50 to-blue-50 border-2 border-amber-200 rounded-2xl p-4 mb-4 text-left shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 flex-shrink-0">
                        <FaClock className="text-sm animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                            Payment in Progress ({pendingBookingData.ref || pendingBookingData.id})
                          </h4>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                            Pending
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                          If you transferred in your bank app, your seats are reserved. Click below to verify and view your ticket immediately:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => checkPendingPaymentStatus(pendingBookingData.id, true)}
                            disabled={isVerifying}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FaCheckCircle className="text-xs" />
                            <span>{isVerifying ? "Verifying..." : "I Have Paid / Confirm Ticket"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTransactionActive(true);
                              initializePayment({
                                onSuccess: handlePaystackSuccess,
                                onClose: handlePaystackClose,
                              });
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium text-xs rounded-lg transition"
                          >
                            Re-open Modal
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to release these seats and cancel this booking?")) {
                                try {
                                  await api.delete(`/bookings/${pendingBookingData.id}/abandon`);
                                } catch (e) {}
                                sessionStorage.removeItem("lastPendingBookingId");
                                sessionStorage.removeItem("lastPendingBookingRef");
                                sessionStorage.removeItem("lastPaystackRef");
                                setPendingBookingData(null);
                                toast.info("Booking cancelled.");
                              }
                            }}
                            className="px-2 py-1.5 text-red-600 hover:bg-red-50 font-medium text-xs rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
