import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "../../context/AuthContext";
import api, { shipmentAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import { calculateServiceFee, calculateVAT } from "../../utils/pricing";
import {
  FaUser,
  FaBox,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaSpinner,
  FaMapMarkerAlt,
  FaTruck,
  FaShieldAlt,
  FaLock,
  FaMoneyBillWave,
} from "react-icons/fa";

const FreightCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { tripData, freightInfo, searchDate } = location.state || {};
  const { senderDetails, receiverDetails, cargoDetails } = freightInfo || {};
  const items = cargoDetails?.items || [];

  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateSubtotal = () => {
    if (!tripData) return 0;
    const baseFare = Number(tripData.baseFare || 0);
    const pricePerKg = Number(tripData.pricePerKg || 0);
    const minCharge = Number(tripData.minCharge || 0);
    const totalWeight = items.reduce(
      (acc, item) => acc + parseFloat(item.weight || 0) * (item.quantity || 1),
      0,
    );
    const calculatedPrice = baseFare + totalWeight * pricePerKg;
    return Math.max(minCharge, calculatedPrice);
  };

  const subtotal = calculateSubtotal();
  const serviceFee = calculateServiceFee(subtotal);
  const vat = calculateVAT(serviceFee);
  const total = subtotal + serviceFee + vat;

  const totalWeight = items.reduce(
    (acc, item) => acc + parseFloat(item.weight || 0) * (item.quantity || 1),
    0,
  );

  const paystackConfig = React.useMemo(() => {
    const email = user?.email || senderDetails?.email || "";
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    return {
      reference: new Date().getTime().toString(),
      email,
      amount: Math.round(total * 100),
      publicKey,
    };
  }, [user?.email, senderDetails?.email, total]);

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference) => {
    setIsProcessing(true);
    const shipmentId = sessionStorage.getItem("lastPendingShipmentId");
    const trackingId =
      sessionStorage.getItem("lastPendingTrackingId") || `FR-${Date.now()}`;

    const goToConfirmation = () => {
      sessionStorage.removeItem("lastPendingShipmentId");
      sessionStorage.removeItem("lastPendingTrackingId");
      navigate("/booking/freight-confirmation", {
        state: {
          trip: tripData,
          bookingId: trackingId,
          isFreight: true,
          freightDetails: freightInfo,
          totalAmount: total,
          paymentMethod,
          searchParams: {
            date:
              searchDate || tripData?.date || new Date().toLocaleDateString(),
          },
        },
      });
    };

    try {
      if (!shipmentId) {
        toast.success("Payment approved! Your shipment is being processed.");
        goToConfirmation();
        return;
      }
      const verifyRes = await shipmentAPI.verifyPayment({
        reference: reference.reference,
        shipmentId,
      });
      if (verifyRes.data.success) {
        toast.success("Shipment booked successfully!");
      } else {
        toast.warning("Payment received — shipment confirmation pending.");
      }
      goToConfirmation();
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.warning(
        "Payment approved by Paystack! Shipment confirmation is being processed.",
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

  const handleConfirmOrder = async () => {
    if (!freightInfo) {
      toast.error("Missing freight information");
      return;
    }
    try {
      setIsProcessing(true);
      const shipmentData = {
        tripId: tripData.id,
        senderDetails,
        receiverDetails,
        cargoDetails,
        paymentMethod,
        totalAmount: total,
      };
      const response = await shipmentAPI.createShipment(shipmentData);
      if (response.data.success) {
        const shipmentId = response.data.shipment.id;
        const trackingId = response.data.shipment.trackingId;
        sessionStorage.setItem("lastPendingShipmentId", shipmentId);
        sessionStorage.setItem("lastPendingTrackingId", trackingId);
        if (paymentMethod === "paystack") {
          if (!paystackConfig.publicKey || !paystackConfig.email) {
            toast.error(
              "Payment configuration error. Missing Email or API Key.",
            );
            setIsProcessing(false);
            return;
          }
          initializePayment({
            onSuccess: handlePaystackSuccess,
            onClose: handlePaystackClose,
          });
        } else {
          toast.success("Shipment Order Placed Successfully!");
          navigate("/booking/freight-confirmation", {
            state: {
              trip: tripData,
              bookingId: trackingId,
              isFreight: true,
              freightDetails: freightInfo,
              totalAmount: total,
              paymentMethod,
              searchParams: {
                date:
                  searchDate ||
                  tripData?.date ||
                  new Date().toLocaleDateString(),
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Shipment creation error:", error);
      toast.error(error.response?.data?.message || "Shipment booking failed");
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate("/booking/freight-info", {
      state: { tripData, searchDate },
    });
  };

  // DHL-style Step Indicator
  const steps = [
    { label: "Describe Shipment", step: 1, active: true },
    { label: "Review & Pay", step: 2, active: true },
    { label: "Confirmation", step: 3, active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Navbar variant="desktop" />

      <div className="flex-1">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-6 px-4">
          <div className="container-custom max-w-5xl">
            <div className="flex items-center gap-3 mb-3">
              <FaCreditCard className="text-2xl opacity-80" />
              <h1 className="text-2xl font-raleway font-bold">
                Review & Pay
              </h1>
            </div>
            {tripData && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  {tripData.from}
                </span>
                <FaArrowRight className="text-xs opacity-60" />
                <span className="bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                  {tripData.to}
                </span>
                <span className="text-white/70 ml-2">
                  {items.length} item{items.length > 1 ? "s" : ""} •{" "}
                  {totalWeight} kg total
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white border-b border-neutral-200 shadow-sm">
          <div className="container-custom max-w-5xl py-4 px-4">
            <div className="flex items-center justify-center gap-0">
              {steps.map((s, idx) => (
                <React.Fragment key={s.step}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        s.active
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-neutral-200 text-neutral-500"
                      }`}>
                      {s.step <= 2 && s.active ? "✓" : s.step}
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${
                        s.active ? "text-primary" : "text-neutral-400"
                      }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-12 md:w-20 h-0.5 mx-2 ${
                        idx < 1 ? "bg-primary" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom max-w-5xl py-8 px-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors mb-6 font-medium">
            <FaArrowLeft className="text-xs" />
            Back to cargo info
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sender & Receiver Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FaUser className="text-emerald-600 text-xs" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-800">
                      Sender
                    </h3>
                  </div>
                  <p className="font-bold text-neutral-900">
                    {senderDetails?.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {senderDetails?.phone}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {senderDetails?.email}
                  </p>
                  <div className="flex items-start gap-1.5 mt-2 text-xs text-neutral-400">
                    <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" />
                    <span>{senderDetails?.address}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FaUser className="text-blue-600 text-xs" />
                    </div>
                    <h3 className="font-bold text-sm text-neutral-800">
                      Receiver
                    </h3>
                  </div>
                  <p className="font-bold text-neutral-900">
                    {receiverDetails?.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {receiverDetails?.phone}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {receiverDetails?.email}
                  </p>
                  <div className="flex items-start gap-1.5 mt-2 text-xs text-neutral-400">
                    <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" />
                    <span>{receiverDetails?.address}</span>
                  </div>
                </div>
              </div>

              {/* Cargo Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <FaBox className="text-primary text-sm" />
                    <h3 className="font-bold text-sm text-neutral-800">
                      Shipment Contents
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-neutral-100">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <FaBox className="text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-neutral-900 text-sm">
                            {item.description}
                          </p>
                          {item.isFragile && (
                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                              Fragile
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">
                          {item.type} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm font-black text-neutral-800">
                        {item.weight}{" "}
                        <span className="text-[10px] text-neutral-400 font-medium">
                          kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-neutral-50 px-5 py-3 flex justify-between items-center border-t border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Total Weight
                  </span>
                  <span className="font-black text-neutral-800">
                    {totalWeight} kg
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaCreditCard className="text-primary text-sm" />
                  <h3 className="font-bold text-sm text-neutral-800">
                    Payment Method
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "paystack"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-neutral-100 hover:border-neutral-200"
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === "paystack"}
                      onChange={() => setPaymentMethod("paystack")}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-bold text-sm text-neutral-800">
                        Pay Now
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Card or Bank via Paystack
                      </p>
                    </div>
                    <FaLock className="ml-auto text-neutral-300 text-xs" />
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "pay_on_delivery"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-neutral-100 hover:border-neutral-200"
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="pay_on_delivery"
                      checked={paymentMethod === "pay_on_delivery"}
                      onChange={() => setPaymentMethod("pay_on_delivery")}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-bold text-sm text-neutral-800">
                        Pay on Delivery
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Pay when cargo arrives
                      </p>
                    </div>
                    <FaMoneyBillWave className="ml-auto text-neutral-300 text-xs" />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden sticky top-4">
                <div className="bg-neutral-900 px-5 py-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                    Order Summary
                  </h3>
                </div>

                <div className="p-5">
                  {/* Route */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <FaTruck className="text-primary text-xs" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        Route
                      </span>
                    </div>
                    <p className="font-bold text-neutral-900 text-sm">
                      {tripData?.from} → {tripData?.to}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {tripData?.vehicleType || "Vehicle"} •{" "}
                      {tripData?.company?.name || "Carrier"}
                    </p>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">
                        Base Freight Rate
                      </span>
                      <span className="font-bold text-neutral-800">
                        ₦{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">
                        Platform Fee (5%)
                      </span>
                      <span className="font-bold text-neutral-800">
                        ₦{serviceFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pb-3 border-b border-dashed border-neutral-200">
                      <span className="text-neutral-500">VAT (7.5%)</span>
                      <span className="font-bold text-neutral-800">
                        ₦{vat.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-neutral-900">Total</span>
                      <span className="font-black text-primary text-2xl">
                        ₦{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isProcessing
                        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    }`}>
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        {paymentMethod === "paystack"
                          ? "Pay & Ship Now"
                          : "Confirm Shipment"}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-3">
                    <FaShieldAlt className="text-emerald-400 text-xs" />
                    <p className="text-[10px] text-neutral-400 font-medium">
                      Secure checkout • Cargo insured in transit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreightCheckout;
