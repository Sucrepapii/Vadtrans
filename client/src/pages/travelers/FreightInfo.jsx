import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBox,
  FaWeight,
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaTimes,
  FaTruck,
  FaShieldAlt,
  FaCubes,
  FaExclamationTriangle,
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
  const [showAddItem, setShowAddItem] = useState(false);
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
    setShowAddItem(false);
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

  const totalWeight = items.reduce(
    (acc, item) => acc + parseFloat(item.weight || 0) * (item.quantity || 1),
    0,
  );

  const getItemIcon = (type) => {
    switch (type) {
      case "Fragile":
        return <FaExclamationTriangle className="text-amber-500" />;
      case "Heavy-duty":
        return <FaWeight className="text-slate-600" />;
      case "Perishable":
        return <FaCubes className="text-green-500" />;
      default:
        return <FaBox className="text-primary" />;
    }
  };

  // DHL-style Step Indicator
  const steps = [
    { label: "Describe Shipment", step: 1, active: true },
    { label: "Review & Pay", step: 2, active: false },
    { label: "Confirmation", step: 3, active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Navbar variant="desktop" />

      <div className="flex-1">
        {/* DHL-style Yellow/Red Header Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white py-6 px-4">
          <div className="container-custom max-w-5xl">
            <div className="flex items-center gap-3 mb-3">
              <FaTruck className="text-2xl opacity-80" />
              <h1 className="text-2xl font-raleway font-bold">
                Describe Your Shipment
              </h1>
            </div>

            {/* Route Summary */}
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
                  via {tripData.company?.name || "Carrier"} •{" "}
                  {tripData.vehicleType || "Vehicle"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator - DHL style */}
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
                      {s.step}
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
                        idx === 0 ? "bg-primary/30" : "bg-neutral-200"
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
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors mb-6 font-medium">
            <FaArrowLeft className="text-xs" />
            Back to search results
          </button>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* Sender & Receiver - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sender Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 flex items-center gap-2">
                  <FaUser className="text-white text-sm" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                    Sender Details
                  </h3>
                </div>
                <div className="p-5 space-y-4">
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
                    placeholder="Who is sending this shipment?"
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
                      placeholder="+234..."
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
                      placeholder="sender@email.com"
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
                    placeholder="Full pickup address..."
                  />
                </div>
              </div>

              {/* Receiver Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 flex items-center gap-2">
                  <FaUser className="text-white text-sm" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                    Receiver Details
                  </h3>
                </div>
                <div className="p-5 space-y-4">
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
                    placeholder="Who is receiving this shipment?"
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
                      placeholder="+234..."
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
                      placeholder="receiver@email.com"
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
                    placeholder="Full delivery address..."
                  />
                </div>
              </div>
            </div>

            {/* Shipment Items Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaBox className="text-white text-sm" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                    Shipment Items
                  </h3>
                  {items.length > 0 && (
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {!showAddItem && (
                  <button
                    type="button"
                    onClick={() => setShowAddItem(true)}
                    className="flex items-center gap-1.5 bg-white text-neutral-900 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                    <FaPlus size={8} />
                    ADD ITEM
                  </button>
                )}
              </div>

              <div className="p-5">
                {/* Add Item Collapsible Form */}
                {showAddItem && (
                  <div className="bg-neutral-50 rounded-xl p-5 border-2 border-dashed border-neutral-300 mb-5 animate-[fadeIn_0.2s_ease-in-out]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
                        New Item Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddItem(false)}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <FaTimes />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                          Category
                        </label>
                        <select
                          value={currentItem.type}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm font-medium">
                          {itemTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                          Description
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
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                          placeholder="e.g. Samsung 55'' LED TV"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
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
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                          Quantity
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
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <input
                            type="checkbox"
                            checked={currentItem.isFragile}
                            onChange={(e) =>
                              setCurrentItem({
                                ...currentItem,
                                isFragile: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-amber-500 rounded"
                          />
                          <span className="text-xs font-bold text-amber-700 uppercase">
                            Fragile
                          </span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                      <FaPlus size={10} />
                      Add to Shipment
                    </button>
                  </div>
                )}

                {/* Item Cards */}
                {items.length === 0 && !showAddItem ? (
                  <div className="text-center py-12">
                    <FaBox className="text-4xl text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 font-medium mb-1">
                      No items added yet
                    </p>
                    <p className="text-neutral-400 text-sm mb-4">
                      Click "Add Item" above to describe what you're shipping
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddItem(true)}
                      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                      <FaPlus size={10} />
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl p-4 border border-neutral-100 transition-all">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-neutral-100">
                          {getItemIcon(item.type)}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-neutral-900 truncate">
                              {item.description}
                            </p>
                            {item.isFragile && (
                              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase flex-shrink-0">
                                ⚠ Fragile
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {item.type} • Qty: {item.quantity}
                          </p>
                        </div>

                        {/* Weight Badge */}
                        <div className="flex-shrink-0 text-right">
                          <div className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5">
                            <span className="text-sm font-black text-neutral-800">
                              {item.weight}
                            </span>
                            <span className="text-[10px] text-neutral-400 ml-0.5">
                              kg
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 flex-shrink-0">
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Running Total Footer */}
              {items.length > 0 && (
                <div className="bg-neutral-900 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                        Total Items
                      </p>
                      <p className="text-white text-lg font-black">
                        {items.length}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-neutral-700" />
                    <div>
                      <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                        Total Weight
                      </p>
                      <p className="text-white text-lg font-black">
                        {totalWeight}{" "}
                        <span className="text-sm font-medium text-neutral-400">
                          kg
                        </span>
                      </p>
                    </div>
                    {tripData && (
                      <>
                        <div className="w-px h-8 bg-neutral-700 hidden sm:block" />
                        <div className="hidden sm:block">
                          <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                            Max Capacity
                          </p>
                          <p className="text-white text-lg font-black">
                            {tripData.maxWeightCapacity || "N/A"}{" "}
                            <span className="text-sm font-medium text-neutral-400">
                              kg
                            </span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-emerald-400 text-sm" />
                    <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                      Insured
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Footer */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-shrink-0 px-6 py-4 border-2 border-neutral-200 text-neutral-600 rounded-xl font-bold text-sm hover:border-neutral-300 transition-colors">
                <FaArrowLeft className="inline mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={items.length === 0}
                className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  items.length === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                }`}>
                Continue to Payment
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreightInfo;
