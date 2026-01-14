import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/Card";
import { calculateServiceFee } from "../../utils/pricing";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

const BookingDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, searchParams } = location.state || {};

  const [passengers, setPassengers] = useState(1);
  const [passengerDetails, setPassengerDetails] = useState([
    {
      fullName: "",
      email: "",
      phone: "",
      idNumber: "",
    },
  ]);

  const handlePassengerCountChange = (increment) => {
    const newCount = increment ? passengers + 1 : Math.max(1, passengers - 1);
    setPassengers(newCount);

    if (increment) {
      setPassengerDetails([
        ...passengerDetails,
        { fullName: "", email: "", phone: "", idNumber: "" },
      ]);
    } else {
      setPassengerDetails(passengerDetails.slice(0, -1));
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const handleContinue = () => {
    const subtotal = trip.price * passengers;
    const serviceFee = calculateServiceFee(subtotal);
    const totalAmount = subtotal + serviceFee;

    navigate("/booking/payment", {
      state: {
        trip,
        searchParams,
        passengers,
        passengerDetails,
        totalAmount,
        serviceFee,
      },
    });
  };

  if (!trip) {
    navigate("/");
    return null;
  }

  const subtotal = trip.price * passengers;
  const serviceFee = calculateServiceFee(subtotal);
  const totalAmount = subtotal + serviceFee;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-4xl">
          <h1 className="text-2xl font-raleway font-bold text-charcoal mb-6">
            Booking Details
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Summary */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Trip Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Company:</span>
                    <span className="font-semibold">{trip.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Route:</span>
                    <span className="font-semibold">
                      {trip.from} → {trip.to}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date:</span>
                    <span className="font-semibold">
                      {searchParams?.date || "Today"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Departure:</span>
                    <span className="font-semibold">{trip.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Arrival:</span>
                    <span className="font-semibold">{trip.arrivalTime}</span>
                  </div>
                </div>
              </Card>

              {/* Passenger Count */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">
                  Number of Passengers
                </h2>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Passengers</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handlePassengerCountChange(false)}
                      disabled={passengers === 1}
                      className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <FaMinus />
                    </button>
                    <span className="text-xl font-bold w-12 text-center">
                      {passengers}
                    </span>
                    <button
                      onClick={() => handlePassengerCountChange(true)}
                      disabled={passengers >= trip.seatsAvailable}
                      className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Passenger Information */}
              {passengerDetails.map((passenger, index) => (
                <Card key={index}>
                  <h2 className="text-lg font-semibold mb-4">
                    Passenger {index + 1} Information
                  </h2>
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      name={`fullName-${index}`}
                      placeholder="John Doe"
                      value={passenger.fullName}
                      onChange={(e) =>
                        handlePassengerChange(index, "fullName", e.target.value)
                      }
                      icon={FaUser}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name={`email-${index}`}
                      placeholder="john@example.com"
                      value={passenger.email}
                      onChange={(e) =>
                        handlePassengerChange(index, "email", e.target.value)
                      }
                      icon={FaEnvelope}
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      name={`phone-${index}`}
                      placeholder="+1 (555) 000-0000"
                      value={passenger.phone}
                      onChange={(e) =>
                        handlePassengerChange(index, "phone", e.target.value)
                      }
                      icon={FaPhone}
                      required
                    />
                    <Input
                      label="ID Number"
                      name={`idNumber-${index}`}
                      placeholder="Passport or National ID"
                      value={passenger.idNumber}
                      onChange={(e) =>
                        handlePassengerChange(index, "idNumber", e.target.value)
                      }
                      icon={FaIdCard}
                      required
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Price Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Price per person:</span>
                    <span className="font-semibold">₦{trip.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Passengers:</span>
                    <span className="font-semibold">×{passengers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-semibold">₦{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Service Fee:</span>
                    <span className="font-semibold">₦{serviceFee}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₦{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="primary" fullWidth onClick={handleContinue}>
                  Continue to Payment
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(-1)}
                  className="mt-3">
                  Back to Results
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

export default BookingDetails;
