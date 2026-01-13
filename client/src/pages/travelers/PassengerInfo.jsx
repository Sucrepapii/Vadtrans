import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaArrowLeft,
} from "react-icons/fa";

const PassengerInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state?.tripData;

  const [passengers, setPassengers] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idNumber: "",
    },
  ]);

  const handleChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        idNumber: "",
      },
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // Pass passenger data to next step
    navigate("/booking/seat-selection", {
      state: { tripData, passengers },
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
                        idx === 0
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
            <div className="flex justify-between mt-2">
              {["Passenger Info", "Seat Selection", "Payment", "Review"].map(
                (step) => (
                  <p
                    key={step}
                    className="text-xs text-center text-neutral-600"
                    style={{ width: "80px" }}>
                    {step}
                  </p>
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
            <span>Back to Results</span>
          </Button>

          <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal mb-6">
            Passenger Information
          </h1>

          <form onSubmit={handleContinue} className="space-y-6">
            {passengers.map((passenger, index) => (
              <Card key={index}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Passenger {index + 1}</h3>
                  {passengers.length > 1 && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => removePassenger(index)}
                      className="text-red-600">
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={passenger.firstName}
                    onChange={(e) =>
                      handleChange(index, "firstName", e.target.value)
                    }
                    icon={FaUser}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={passenger.lastName}
                    onChange={(e) =>
                      handleChange(index, "lastName", e.target.value)
                    }
                    icon={FaUser}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={passenger.email}
                    onChange={(e) =>
                      handleChange(index, "email", e.target.value)
                    }
                    icon={FaEnvelope}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={passenger.phone}
                    onChange={(e) =>
                      handleChange(index, "phone", e.target.value)
                    }
                    icon={FaPhone}
                    required
                  />
                  <Input
                    label="ID Number"
                    placeholder="Passport or national ID"
                    value={passenger.idNumber}
                    onChange={(e) =>
                      handleChange(index, "idNumber", e.target.value)
                    }
                    icon={FaIdCard}
                    required
                    className="md:col-span-2"
                  />
                </div>
              </Card>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={addPassenger}
              fullWidth>
              Add Another Passenger
            </Button>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                fullWidth>
                Back
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Continue to Seat Selection
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PassengerInfo;
