import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";

const PaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, passengers, selectedSeats } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const paymentMethods = [
    { id: "card", label: "Credit/Debit Card", icon: FaCreditCard },
    { id: "bank", label: "Bank Transfer", icon: FaUniversity },
    { id: "mobile", label: "Mobile Money", icon: FaMobileAlt },
  ];

  const handleContinue = (e) => {
    e.preventDefault();
    navigate("/booking/review", {
      state: {
        tripData,
        passengers,
        selectedSeats,
        paymentMethod,
        cardDetails,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-3xl px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {["Passenger Info", "Seat Selection", "Payment", "Review"].map(
                (step, idx) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        idx <= 2
                          ? "bg-primary text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}>
                      {idx + 1}
                    </div>
                    {idx < 3 && (
                      <div className="w-12 md:w-24 h-1 bg-neutral-200 mx-1"></div>
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
            <span>Back</span>
          </Button>

          <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal mb-6">
            Payment Method
          </h1>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <h3 className="font-semibold mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-red-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <method.icon
                        className={`text-xl ${
                          paymentMethod === method.id
                            ? "text-primary"
                            : "text-neutral-600"
                        }`}
                      />
                      <span className="font-medium">{method.label}</span>
                    </div>
                    {paymentMethod === method.id && (
                      <FaCheck className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Card Details Form */}
            {paymentMethod === "card" && (
              <Card>
                <h3 className="font-semibold mb-4">Card Details</h3>
                <div className="space-y-4">
                  <Input
                    label="Card Number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    icon={FaCreditCard}
                    required
                  />
                  <Input
                    label="Cardholder Name"
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardName: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiryDate: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="CVV"
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Bank Transfer Instructions */}
            {paymentMethod === "bank" && (
              <Card className="bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
                <p className="text-sm text-neutral-700 mb-3">
                  Transfer to the following account:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Bank:</strong> First Bank of Nigeria
                  </p>
                  <p>
                    <strong>Account Name:</strong> Vadtrans Limited
                  </p>
                  <p>
                    <strong>Account Number:</strong> 1234567890
                  </p>
                  <p className="text-xs text-neutral-600 mt-3">
                    Please use your booking reference as the transfer
                    description
                  </p>
                </div>
              </Card>
            )}

            {/* Mobile Money Instructions */}
            {paymentMethod === "mobile" && (
              <Card className="bg-green-50 border-green-200">
                <h3 className="font-semibold mb-2">Mobile Money Payment</h3>
                <p className="text-sm text-neutral-700 mb-3">
                  Send payment to:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Number:</strong> +234 800 VADTRANS
                  </p>
                  <p>
                    <strong>Provider:</strong> Any mobile money service
                  </p>
                  <p className="text-xs text-neutral-600 mt-3">
                    You will receive a confirmation code after payment
                  </p>
                </div>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                fullWidth>
                Back
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Continue to Review
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentMethod;
