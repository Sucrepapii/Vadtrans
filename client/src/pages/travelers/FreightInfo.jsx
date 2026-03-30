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

  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    type: "General goods",
    description: "",
    weight: "",
    quantity: 1,
    isFragile: false,
  });

  const addItem = () => {
    if (!currentItem.description || !currentItem.weight) {
      alert("Please provide a description and weight for the item.");
      return;
    }
    setItems([...items, { ...currentItem, id: Date.now() }]);
    setCurrentItem({
      type: "General goods",
      description: "",
      weight: "",
      quantity: 1,
      isFragile: false,
    });
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please add at least one item to your shipment.");
      return;
    }
    // Pass freight data directly to checkout
    navigate("/booking/freight-checkout", {
      state: {
        tripData,
        freightInfo: {
          senderDetails,
          receiverDetails,
          cargoDetails: { items },
        },
        searchDate,
      },
    });
  };

  const itemTypes = ["General goods", "Fragile", "Perishable", "Heavy-duty"];

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

          <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal mb-2">
            Freight & Cargo Details
          </h1>
          <p className="text-neutral-600 mb-6">
            Enter sender, receiver, and item details for your shipment.
          </p>

          <form onSubmit={handleContinue} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sender Details */}
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FaUser className="text-primary" /> Sender Details
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Full Name / Company"
                    value={senderDetails.name}
                    onChange={(e) =>
                      setSenderDetails({
                        ...senderDetails,
                        name: e.target.value,
                      })
                    }
                    icon={FaUser}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
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
                <div className="space-y-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
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
            </div>

            {/* Multi-Item Cargo Cart */}
            <Card className="border-t-4 border-t-primary">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaBox className="text-primary" /> Shipment Items (Cart)
              </h3>

              {/* Add Item Form */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
                <h4 className="text-sm font-bold text-charcoal mb-3 uppercase tracking-wider">
                  Add New Item
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">
                      Item Type
                    </label>
                    <select
                      value={currentItem.type}
                      onChange={(e) =>
                        setCurrentItem({ ...currentItem, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-primary outline-none bg-white text-sm">
                      {itemTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-neutral-500 mb-1">
                      Description (e.g. LED TV)
                    </label>
                    <input
                      type="text"
                      value={currentItem.description}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-primary outline-none bg-white text-sm"
                      placeholder="What are you shipping?"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-neutral-500 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={currentItem.weight}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            weight: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-primary outline-none bg-white text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-neutral-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-1 focus:ring-primary outline-none bg-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentItem.isFragile}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            isFragile: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-xs font-medium">Fragile?</span>
                    </label>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={addItem}
                      className="flex-1 py-2 text-sm">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-100 text-neutral-600 font-bold">
                    <tr>
                      <th className="p-3 rounded-l">Item</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Weight</th>
                      <th className="p-3 text-center">Fragile</th>
                      <th className="p-3 rounded-r text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-neutral-400 italic">
                          No items added yet. Use the form above to add items to
                          your shipment.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50">
                          <td className="p-3 font-medium text-charcoal">
                            {item.description}
                          </td>
                          <td className="p-3 text-neutral-600">{item.type}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-center">{item.weight} kg</td>
                          <td className="p-3 text-center">
                            {item.isFragile ? (
                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                Yes
                              </span>
                            ) : (
                              <span className="bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                No
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 font-medium">
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="bg-neutral-50 font-bold border-t border-neutral-200">
                      <tr>
                        <td colSpan="3" className="p-3 text-right">
                          Total Estimated Weight:
                        </td>
                        <td className="p-3 text-center">
                          {items.reduce(
                            (acc, item) =>
                              acc + parseFloat(item.weight) * item.quantity,
                            0,
                          )}{" "}
                          kg
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
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
              <Button
                type="submit"
                variant="primary"
                className="w-2/3"
                disabled={items.length === 0}>
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
