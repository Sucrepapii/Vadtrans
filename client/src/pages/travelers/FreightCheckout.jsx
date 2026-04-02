import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "../../context/AuthContext";
import api, { shipmentAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { calculateServiceFee, calculateVAT } from "../../utils/pricing";
import {
  FaUser,
  FaBox,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaSpinner,
  FaMapMarkerAlt,
} from "react-icons/fa";

const FreightCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Freight specific location state
  const { tripData, freightInfo, searchDate } = location.state || {};
  const { senderDetails, receiverDetails, cargoDetails } = freightInfo || {};
  const items = cargoDetails?.items || [];

  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isProcessing, setIsProcessing] = useState(false);

  // New Pricing Formula: Total = max(minCharge, baseFare + totalWeight * pricePerKg)
  const calculateSubtotal = () => {
    if (!tripData) return 0;
    
    const baseFare = Number(tripData.baseFare || 0);
    const pricePerKg = Number(tripData.pricePerKg || 0);
    const minCharge = Number(tripData.minCharge || 0);
    
    const totalWeight = items.reduce(
      (acc, item) => acc + parseFloat(item.weight || 0) * (item.quantity || 1),
      0
    );
    
    const calculatedPrice = baseFare + (totalWeight * pricePerKg);
    return Math.max(minCharge, calculatedPrice);
  };

  const subtotal = calculateSubtotal();
  const serviceFee = calculateServiceFee(subtotal);
  const vat = calculateVAT(serviceFee);
  const total = subtotal + serviceFee + vat;

  // Stabilize the config to prevent hook re-initialization issues
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
          bookingId: trackingId, // Passing tracking ID as booking ID for the generic confirm page
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

      // Verify payment on backend
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

          // Trigger Paystack popup
          initializePayment({
            onSuccess: handlePaystackSuccess,
            onClose: handlePaystackClose,
          });
        } else {
          // Pay on delivery
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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {["Cargo Info", "Review & Pay", "Confirmation"].map(
                (step, idx) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${idx <= 1 ? "bg-primary text-white" : "bg-neutral-200 text-neutral-600"}`}>
                      {idx + 1}
                    </div>
                    {idx < 2 && (
                      <div
                        className={`w-12 md:w-24 h-1 mx-1 ${idx === 0 ? "bg-primary" : "bg-neutral-200"}`}></div>
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
            <span>Back to Cargo Info</span>
          </Button>

          <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal mb-6">
            Review Shipment Details
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Sender & Receiver Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-center gap-2 mb-3 border-b pb-2">
                    <FaUser className="text-primary" />
                    <h3 className="font-semibold">From (Sender)</h3>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">
                      {senderDetails?.name}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      {senderDetails?.phone}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      {senderDetails?.email}
                    </p>
                    <div className="flex items-start gap-1 mt-2 text-sm text-neutral-600">
                      <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-neutral-400" />
                      <span>{senderDetails?.address}</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-2 mb-3 border-b pb-2">
                    <FaUser className="text-secondary" />
                    <h3 className="font-semibold">To (Receiver)</h3>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">
                      {receiverDetails?.name}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      {receiverDetails?.phone}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      {receiverDetails?.email}
                    </p>
                    <div className="flex items-start gap-1 mt-2 text-sm text-neutral-600">
                      <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-neutral-400" />
                      <span>{receiverDetails?.address}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Cargo Setup */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaBox className="text-primary" />
                  <h3 className="font-semibold">Cargo Itemized Summary</h3>
                </div>
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-neutral-50 p-3 rounded border border-neutral-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-charcoal">{item.description}</p>
                          <p className="text-xs text-neutral-500 uppercase tracking-tighter">{item.type}</p>
                        </div>
                        {item.isFragile && (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Fragile</span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-neutral-600"><span className="text-neutral-400">Weight:</span> {item.weight} kg</span>
                        <span className="text-neutral-600"><span className="text-neutral-400">Qty:</span> {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-dotted border-neutral-300 flex justify-between items-center text-sm font-bold">
                    <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Total Weight</span>
                    <span className="text-charcoal bg-neutral-200 px-3 py-1 rounded">
                      {items.reduce((acc, item) => acc + parseFloat(item.weight || 0) * (item.quantity || 1), 0)} kg
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Select */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <FaCreditCard className="text-primary" />
                  <h3 className="font-semibold">Payment Option</h3>
                </div>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${paymentMethod === "paystack" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === "paystack"}
                      onChange={() => setPaymentMethod("paystack")}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-medium">
                        Pay Now (Card/Bank via Paystack)
                      </p>
                      <p className="text-xs text-neutral-500">
                        Secure immediate payment
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${paymentMethod === "pay_on_delivery" ? "border-primary bg-primary/5" : "border-neutral-200"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="pay_on_delivery"
                      checked={paymentMethod === "pay_on_delivery"}
                      onChange={() => setPaymentMethod("pay_on_delivery")}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-medium">Pay on Delivery / Escrow</p>
                      <p className="text-xs text-neutral-500">
                        Pay when the cargo arrives
                      </p>
                    </div>
                  </label>
                </div>
              </Card>
            </div>

            {/* Price Summary */}
            <div>
              <Card className="sticky top-4">
                <h3 className="font-semibold mb-4 text-lg">Order Summary</h3>

                <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 mb-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    {tripData?.from} → {tripData?.to}
                  </p>
                  <p className="text-xs text-blue-700">
                    Transport: {tripData?.vehicleType || "Truck"}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Base Freight Rate</span>
                    <span className="font-medium">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">
                      Platform Handling (5%)
                    </span>
                    <span className="font-medium">
                      ₦{serviceFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-neutral-200 pb-3">
                    <span className="text-neutral-600">VAT (7.5%)</span>
                    <span className="font-medium">₦{vat.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-800">
                      Total Shipment Cost
                    </span>
                    <span className="font-bold text-primary text-xl">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 shadow-md">
                      <FaCheckCircle />
                      <span>
                        {paymentMethod === "paystack"
                          ? "Pay & Book Cargo"
                          : "Confirm Order"}
                      </span>
                    </div>
                  )}
                </Button>
                <p className="text-center text-xs mt-3 text-neutral-400">
                  By booking, you agree to our cargo terms of service.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreightCheckout;
