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
  FaMapMarkerAlt,
  FaBox,
  FaWeight,
  FaMoneyBillWave,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";

const FreightInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripData = location.state?.tripData;
  const searchDate = location.state?.searchDate;

  const [senderDetails, setSenderDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [receiverDetails, setReceiverDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [cargoDetails, setCargoDetails] = useState({
    description: "",
    weight: "",
    dimensions: "",
    value: "",
  });

  const handleContinue = (e) => {
    e.preventDefault();
    // Pass freight data directly to checkout (skipping seat selection)
    navigate("/booking/freight-checkout", {
      state: {
        tripData,
        freightInfo: { senderDetails, receiverDetails, cargoDetails },
        searchDate,
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
              {["Cargo Info", "Review & Pay", "Confirmation"].map(
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
                    {idx < 2 && (
                      <div className="w-12 md:w-24 h-1 bg-neutral-200 mx-1"></div>
                    )}
                  </div>
                ),
              )}
            </div>
            <div className="flex justify-between mt-2">
              {["Cargo Info", "Review & Pay", "Confirmation"].map((step) => (
                <p
                  key={step}
                  className="text-xs text-center text-neutral-600"
                  style={{ width: "80px" }}>
                  {step}
                </p>
              ))}
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
            Freight & Cargo Details
          </h1>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* Sender Details */}
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-primary" /> Sender Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name / Company"
                  value={senderDetails.name}
                  onChange={(e) =>
                    setSenderDetails({ ...senderDetails, name: e.target.value })
                  }
                  icon={FaUser}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={senderDetails.phone}
                  onChange={(e) =>
                    setSenderDetails({
                      ...senderDetails,
                      phone: e.target.value,
                    })
                  }
                  icon={FaPhone}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={senderDetails.email}
                  onChange={(e) =>
                    setSenderDetails({
                      ...senderDetails,
                      email: e.target.value,
                    })
                  }
                  icon={FaEnvelope}
                  required
                />
                <Input
                  label="Pickup Address"
                  value={senderDetails.address}
                  onChange={(e) =>
                    setSenderDetails({
                      ...senderDetails,
                      address: e.target.value,
                    })
                  }
                  icon={FaMapMarkerAlt}
                  required
                />
              </div>
            </Card>

            {/* Receiver Details */}
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-secondary" /> Receiver Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name / Company"
                  value={receiverDetails.name}
                  onChange={(e) =>
                    setReceiverDetails({
                      ...receiverDetails,
                      name: e.target.value,
                    })
                  }
                  icon={FaUser}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={receiverDetails.phone}
                  onChange={(e) =>
                    setReceiverDetails({
                      ...receiverDetails,
                      phone: e.target.value,
                    })
                  }
                  icon={FaPhone}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={receiverDetails.email}
                  onChange={(e) =>
                    setReceiverDetails({
                      ...receiverDetails,
                      email: e.target.value,
                    })
                  }
                  icon={FaEnvelope}
                  required
                />
                <Input
                  label="Delivery Address"
                  value={receiverDetails.address}
                  onChange={(e) =>
                    setReceiverDetails({
                      ...receiverDetails,
                      address: e.target.value,
                    })
                  }
                  icon={FaMapMarkerAlt}
                  required
                />
              </div>
            </Card>

            {/* Cargo Details */}
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaBox className="text-primary" /> Cargo Specification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Item Description (What are you shipping?)"
                    value={cargoDetails.description}
                    onChange={(e) =>
                      setCargoDetails({
                        ...cargoDetails,
                        description: e.target.value,
                      })
                    }
                    icon={FaInfoCircle}
                    placeholder="e.g. 50 boxes of electronics, 2 pallets of books"
                    required
                  />
                </div>
                <Input
                  label="Estimated Weight (kg)"
                  type="number"
                  value={cargoDetails.weight}
                  onChange={(e) =>
                    setCargoDetails({ ...cargoDetails, weight: e.target.value })
                  }
                  icon={FaWeight}
                  required
                />
                <Input
                  label="Declared Value (₦)"
                  type="number"
                  value={cargoDetails.value}
                  onChange={(e) =>
                    setCargoDetails({ ...cargoDetails, value: e.target.value })
                  }
                  icon={FaMoneyBillWave}
                  required
                />
                <div className="md:col-span-2">
                  <Input
                    label="Approximate Dimensions (Optional)"
                    placeholder="e.g. 2m x 1m x 1.5m"
                    value={cargoDetails.dimensions}
                    onChange={(e) =>
                      setCargoDetails({
                        ...cargoDetails,
                        dimensions: e.target.value,
                      })
                    }
                    icon={FaBox}
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="w-1/3">
                Back
              </Button>
              <Button type="submit" variant="primary" className="w-2/3">
                Continue to Payment
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreightInfo;
