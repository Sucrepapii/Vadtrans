import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      navigate("/booking/confirmation", {
        state: {
          trip,
          searchParams,
          passengers,
          passengerDetails,
          totalAmount,
          paymentMethod,
          bookingId: `BK-${Date.now().toString().slice(-6)}`,
        },
      });
    }, 2000);
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

              {/* Card Details Form */}
              {paymentMethod === "card" && (
                <Card>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaLock className="text-green-600" />
                    Card Details
                  </h2>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <Input
                      label="Card Number"
                      name="cardNumber"
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
                      name="cardName"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cardName: e.target.value,
                        })
                      }
                      icon={FaUser}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry Date"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            expiryDate: e.target.value,
                          })
                        }
                        icon={FaCalendar}
                        required
                      />
                      <Input
                        label="CVV"
                        name="cvv"
                        placeholder="123"
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value,
                          })
                        }
                        icon={FaLock}
                        required
                      />
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-lg flex items-start gap-3">
                      <FaLock className="text-green-600 mt-1" />
                      <div className="text-sm text-neutral-600">
                        <p className="font-semibold text-charcoal mb-1">
                          Secure Payment
                        </p>
                        <p>
                          Your payment information is encrypted and secure. We
                          never store your card details.
                        </p>
                      </div>
                    </div>
                  </form>
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
