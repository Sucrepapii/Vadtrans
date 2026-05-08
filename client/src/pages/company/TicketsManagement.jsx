import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import ConfirmationModal from "../../components/ConfirmationModal";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Input from "../../components/Input";
import {
  westAfricanCountries,
  westAfricanStates,
  westAfricanCities,
} from "../../data/locations";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";
import { tripAPI } from "../../services/api";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBus,
  FaCar,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
  FaTruck,
  FaExchangeAlt,
  FaMinus,
  FaUsers,
  FaInfoCircle,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MaterialTimePicker } from "../../components/MaterialDatePicker";
import MaterialDatePicker from "../../components/MaterialDatePicker";

const TicketsManagement = () => {
  const { user } = useAuth(); // Get user for verification status check
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null,
    deleting: false,
  });

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    transportType: "carpooling",
    departureTimes: [""],
    departureDate: "",
    operatingDays: [],
    duration: "",
    price: "",
    baseFare: "",
    pricePerKg: "",
    minCharge: "",
    maxWeightCapacity: "",
    seats: 18,
    serviceCategory: "passenger",
    freightType: "",

    state: "", // For carpooling: the selected state for city-to-city trips
    toState: "",
    fromCountry: "Nigeria",
    toCountry: "",
    vehicleType: "Hiace Bus (18 seater)",
    terminal: "",
    city: "",
    documentPrices: {
      "Regular Passport": "",
      "Virgin Passport": "",
      NIN: "",
      "No Document": "",
    },
    // Carpooling specific fields
    timeWindowStart: "",
    timeWindowEnd: "",
    minSeats: 1,
    departureDeadline: "",
    vehiclePlateNumber: "",
    pickupAddress: "",
  });

  const { states, getCitiesForState } = useLocationsAPI();
  const [apiFromCities, setApiFromCities] = useState([]);
  const [apiToCities, setApiToCities] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const stateToFetch = formData.transportType === "carpooling" || formData.transportType === "inter-state" 
      ? formData.state 
      : null;

    if (stateToFetch) {
      getCitiesForState(stateToFetch).then(fetchedCities => {
        if (isMounted) setApiFromCities(fetchedCities || []);
      });
    } else {
      setApiFromCities([]);
    }
    return () => { isMounted = false; };
  }, [formData.transportType, formData.state, getCitiesForState]);

  useEffect(() => {
    let isMounted = true;
    const stateToFetch = formData.transportType === "inter-state" 
      ? formData.toState 
      : null;

    if (stateToFetch) {
      getCitiesForState(stateToFetch).then(fetchedCities => {
        if (isMounted) setApiToCities(fetchedCities || []);
      });
    } else {
      setApiToCities([]);
    }
    return () => { isMounted = false; };
  }, [formData.transportType, formData.toState, getCitiesForState]);

  // Determine location options based on transport type
  const locationOptions = useMemo(() => {
    if (formData.transportType === "international") {
      return westAfricanCountries;
    }
    return states.map(s => s.name);
  }, [formData.transportType, states]);

  const fromCities = useMemo(() => apiFromCities, [apiFromCities]);
  const toCities = useMemo(() => apiToCities, [apiToCities]);

  // Fetch trips on component mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripAPI.getMyTrips();

      // Transform API data to match table format
      const transformedTrips = response.data.trips.map((trip) => ({
        id: trip.id,
        route: `${trip.from} - ${trip.to}`,
        transportType: trip.transportType === "intra-state" ? "carpooling" : trip.transportType,
        departureTime: trip.departureTime,
        departureDate: trip.departureDate,
        operatingDays: trip.operatingDays ? trip.operatingDays.split(",") : [],
        price: Number(trip.price),
        baseFare: trip.baseFare ? Number(trip.baseFare) : "",
        pricePerKg: trip.pricePerKg ? Number(trip.pricePerKg) : "",
        minCharge: trip.minCharge ? Number(trip.minCharge) : "",
        maxWeightCapacity: trip.maxWeightCapacity || "",
        seats: trip.seats,
        availableSeats: trip.availableSeats,
        status: trip.status,
        duration: trip.duration || "",
        serviceCategory: trip.serviceCategory || "passenger",
        freightType: trip.freightType || "",
        vehicleType: trip.vehicleType || "Hiace Bus (18 seater)",
        vehicleName: trip.vehicleName || "",
        terminal: trip.terminal || "",
        city: trip.city || "",
        state: trip.state || "",
        fromState: trip.fromState || "",
        toState: trip.toState || "",
        fromCountry: trip.fromCountry || "Nigeria",
        toCountry: trip.toCountry || "",
        documentPrices: trip.documentPrices || {
          "Regular Passport": "",
          "Virgin Passport": "",
          NIN: "",
          "No Document": "",
        },
        timeWindowStart: trip.timeWindowStart || "",
        timeWindowEnd: trip.timeWindowEnd || "",
        minSeats: trip.minSeats || 1,
        departureDeadline: trip.departureDeadline || "",
        depositAmount: trip.depositAmount || 0,
        cancellationWindow: trip.cancellationWindow || 12,
        confirmationWindow: trip.confirmationWindow || 2,
      }));

      setTickets(transformedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error(error.response?.data?.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = () => {
    // Check verification status
    if (user?.verificationStatus !== "verified") {
      toast.error(
        "Your account must be verified by an admin before you can create trips.",
      );
      return;
    }

    setEditingTicket(null);
    setFormData({
      from: "",
      to: "",
      transportType: "inter-state",
      departureTimes: [""],
      operatingDays: [],
      duration: "",
      price: "",
      baseFare: "",
      pricePerKg: "",
      minCharge: "",
      maxWeightCapacity: "",
      seats: 18,
      serviceCategory: "passenger",
      freightType: "",

      state: "",
      toState: "",
      vehicleType: "Hiace Bus (18 seater)",
      vehicleName: "",
      city: "",
      documentPrices: {
        "Regular Passport": "",
        "Virgin Passport": "",
        NIN: "",
        "No Document": "",
      },
    });
    setIsModalOpen(false);
    setShowTypeSelection(true);
  };

  const handleSelectTripType = (type) => {
    setShowTypeSelection(false);
    
    if (type === "carpooling") {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setFormData(prev => ({
        ...prev,
        transportType: "carpooling",
        serviceCategory: "passenger",
        vehicleType: "Sedan (small car)",
        seats: 4,
        departureDate: formattedDate
      }));
    } else if (type === "freight") {
      setFormData(prev => ({
        ...prev,
        transportType: "inter-state",
        serviceCategory: "freight",
        vehicleType: "Van"
      }));
    }
    
    setIsModalOpen(true);
  };

  const handleSwapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
      state: prev.toState, // When swapping, the previous "to" state becomes the "from" state
      toState: prev.state || prev.fromState,
      // For international
      fromCountry: prev.toCountry,
      toCountry: prev.fromCountry,
      fromState: prev.toState,
    }));
  };

  const handleAddTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      departureTimes: [...prev.departureTimes, ""],
    }));
  };

  const handleRemoveTimeSlot = (index) => {
    if (formData.departureTimes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      departureTimes: prev.departureTimes.filter((_, i) => i !== index),
    }));
  };

  const handleTimeSlotChange = (index, value) => {
    const newTimes = [...formData.departureTimes];
    newTimes[index] = value;
    setFormData((prev) => ({
      ...prev,
      departureTimes: newTimes,
    }));
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      from: ticket.route.split(" - ")[0],
      to: ticket.route.split(" - ")[1],
      transportType: ticket.transportType,
      departureTimes: [ticket.departureTime],
      departureDate: ticket.departureDate || "",
      operatingDays: ticket.operatingDays || [],
      duration: ticket.duration || "",
      price: ticket.price || "",
      baseFare: ticket.baseFare || "",
      pricePerKg: ticket.pricePerKg || "",
      minCharge: ticket.minCharge || "",
      maxWeightCapacity: ticket.maxWeightCapacity || "",
      seats: ticket.seats || 18,
      serviceCategory: ticket.serviceCategory || "passenger",
      freightType: ticket.freightType || "",
      state: ticket.state || "",
      toState: ticket.toState || "",
      fromCountry: ticket.fromCountry || "Nigeria",
      toCountry: ticket.toCountry || "",
      vehicleType: ticket.vehicleType || "Hiace Bus (18 seater)",
      terminal: ticket.terminal || "",
      city: ticket.city || "",
      documentPrices: ticket.documentPrices || {
        "Regular Passport": "",
        "Virgin Passport": "",
        NIN: "",
        "No Document": "",
      },
      timeWindowStart: ticket.timeWindowStart || "",
      timeWindowEnd: ticket.timeWindowEnd || "",
      minSeats: ticket.minSeats || 1,
      departureDeadline: ticket.departureDeadline || "",
      vehiclePlateNumber: ticket.vehiclePlateNumber || "",
      pickupAddress: ticket.pickupAddress || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteTicket = (id) => {
    setDeleteConfirm({ open: true, id, deleting: false });
  };

  const confirmDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, deleting: true }));
    try {
      await tripAPI.deleteTrip(deleteConfirm.id);
      toast.success("Trip deleted successfully!");
      setDeleteConfirm({ open: false, id: null, deleting: false });
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error(error.response?.data?.message || "Failed to delete trip");
      setDeleteConfirm((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const tripData = {
        from: formData.from,
        to: formData.to,
        transportType: formData.transportType,
        departureTime: formData.departureTime,
        departureDate: formData.departureDate 
          ? (typeof formData.departureDate === 'object' 
              ? new Date(formData.departureDate.getTime() - (formData.departureDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
              : formData.departureDate)
          : null,
        operatingDays:
          formData.operatingDays.length > 0
            ? formData.operatingDays.join(",")
            : null,
        duration: formData.duration || null,
        price: Number(formData.price || 0),
        baseFare:
          formData.serviceCategory === "freight"
            ? Number(formData.baseFare || 0)
            : null,
        pricePerKg:
          formData.serviceCategory === "freight"
            ? Number(formData.pricePerKg || 0)
            : null,
        minCharge:
          formData.serviceCategory === "freight"
            ? Number(formData.minCharge || 0)
            : null,
        maxWeightCapacity:
          formData.serviceCategory === "freight"
            ? Number(formData.maxWeightCapacity || 0)
            : null,
        serviceCategory: formData.serviceCategory,
        freightType:
          formData.serviceCategory === "freight" ? formData.freightType : null,

        seats: Number(formData.seats),
        vehicleType: formData.vehicleType,
        vehicleName: formData.vehicleName || null,
        terminal: formData.terminal,
        city: formData.city,
        // Save new cascading fields if international
        fromCountry: formData.transportType === "international" ? formData.fromCountry : "Nigeria",
        toCountry: formData.transportType === "international" ? formData.toCountry : "Nigeria",
        fromState: formData.transportType === "international" ? formData.fromState : ((formData.transportType === "inter-state" || formData.transportType === "carpooling") ? formData.state : null),
        toState: formData.transportType === "international" ? formData.toState : (formData.transportType === "inter-state" ? formData.toState : (formData.transportType === "carpooling" ? formData.state : null)),
        documentPrices: formData.documentPrices,
        timeWindowStart: formData.timeWindowStart || null,
        timeWindowEnd: formData.timeWindowEnd || null,
        minSeats: Number(formData.minSeats || 1),
        departureDeadline: formData.departureDeadline || null,
        vehiclePlateNumber: formData.vehiclePlateNumber || null,
        pickupAddress: formData.pickupAddress || null,
        depositAmount: 5, // Reserve with 5% deposit
        cancellationWindow: 12, // Free cancellation up to 12 hours
        confirmationWindow: 2,
      };

      if (formData.transportType === "carpooling") {
        if (Number(formData.price) > 5000) {
          toast.error("Carpooling price cannot exceed ₦5,000.");
          setSaving(false);
          return;
        }
        if (Number(formData.price) < 1500) {
          toast.error("Carpooling price cannot be less than ₦1,500.");
          setSaving(false);
          return;
        }
      }

      if (editingTicket) {
        // Update existing trip
        const updateData = {
          ...tripData,
          departureTime: formData.transportType === "carpooling" 
            ? formData.timeWindowStart 
            : formData.departureTimes[0],
        };
        await tripAPI.updateTrip(editingTicket.id, updateData);
        toast.success("Trip updated successfully!");
      } else {
        // Create new trip(s)
        let validTimes = [];
        
        if (formData.transportType === "carpooling") {
          if (!formData.timeWindowStart) {
            toast.error("Please set the earliest pickup time");
            setSaving(false);
            return;
          }
          validTimes = [formData.timeWindowStart];
        } else {
          validTimes = formData.departureTimes.filter((t) => t);
          if (validTimes.length === 0) {
            toast.error("Please add at least one departure time");
            setSaving(false);
            return;
          }
        }

        const promises = validTimes.map((time) => {
          return tripAPI.createTrip({
            ...tripData,
            departureTime: time,
          });
        });

        await Promise.all(promises);
        toast.success(
          formData.transportType === "carpooling"
            ? "Carpool ride posted successfully!"
            : `${validTimes.length} trip${validTimes.length > 1 ? "s" : ""} created successfully!`,
        );
      }

      setIsModalOpen(false);
      fetchTrips(); // Refresh the list
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error(error.response?.data?.message || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const getTransportIcon = (serviceCategory) => {
    return serviceCategory === "freight" ? (
      <FaTruck className="text-primary" />
    ) : (
      <FaBus className="text-primary" />
    );
  };

  const columns = [
    {
      key: "route",
      label: "Route",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getTransportIcon(row.serviceCategory)}
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "departureTime",
      label: "Departure Time",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <FaClock className="text-neutral-500" />
          {value}
        </div>
      ),
    },
    {
      key: "departureDate",
      label: "Date / Days",
      sortable: true,
      render: (value, row) => {
        if (value) return value;
        if (row.operatingDays && row.operatingDays.length > 0) {
          return row.operatingDays.join(", ");
        }
        return "Not Set";
      },
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value) => `₦${value.toLocaleString()}`,
    },
    {
      key: "availableSeats",
      label: "Seats",
      render: (value, row) => `${value}/${row.seats}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-neutral-100 text-neutral-800"
          }`}>
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="text"
            onClick={() => handleEditTicket(row)}
            className="text-blue-600">
            <FaEdit />
          </Button>
          <Button
            variant="text"
            onClick={() => handleDeleteTicket(row.id)}
            className="text-red-600">
            <FaTrash />
          </Button>
          <Button
            variant="text"
            onClick={() =>
              window.open(`/company/driver-console/${row.id}`, "_blank")
            }
            className="text-green-600"
            title="Broadcast Live Location">
            <FaMapMarkerAlt />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const paginatedTickets = tickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal">
                Tickets Management
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your transportation tickets
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddTicket}
              disabled={loading}
              className="w-full sm:w-auto">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <FaPlus />
                <span>Add Trip</span>
              </div>
            </Button>
          </div>

          <Card>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                  <p className="text-neutral-600">Loading trips...</p>
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600 mb-4">No trips yet</p>
                <Button variant="primary" onClick={handleAddTicket}>
                  <div className="flex items-center gap-2">
                    <FaPlus />
                    <span>Add Your First Trip</span>
                  </div>
                </Button>
              </div>
            ) : (
              <>
                <Table columns={columns} data={paginatedTickets} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={tickets.length}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingTicket ? "Edit Trip" : "Add New Trip"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              <div className="flex items-center gap-2">
                {saving && <FaSpinner className="animate-spin" />}
                <span>
                  {saving ? "Saving..." : editingTicket ? "Update" : "Create"}
                </span>
              </div>
            </Button>
          </>
        }>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Simplified Modal Content - Matches Offer a Ride Flow */}
          {formData.transportType === "carpooling" ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Route Information */}
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-4 border border-neutral-200">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" /> Route Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Select State</label>
                    <select
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          state: e.target.value,
                          from: "",
                          to: "",
                        })
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={saving}>
                      <option value="">Select state</option>
                      {locationOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Pickup City</label>
                      <select
                        value={formData.from}
                        onChange={(e) =>
                          setFormData({ ...formData, from: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving || !formData.state}>
                        <option value="">Select pickup city</option>
                        {fromCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Destination City</label>
                      <select
                        value={formData.to}
                        onChange={(e) =>
                          setFormData({ ...formData, to: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving || !formData.state}>
                        <option value="">Select destination city</option>
                        {fromCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time & Schedule */}
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-4 border border-neutral-200">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <FaClock className="text-primary" /> Time & Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <MaterialDatePicker
                      label="Departure Date"
                      value={formData.departureDate}
                      onChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const day = String(date.getDate()).padStart(2, "0");
                          const dateStr = `${year}-${month}-${day}`;
                          setFormData({ ...formData, departureDate: dateStr });
                        } else {
                          setFormData({ ...formData, departureDate: "" });
                        }
                      }}
                      minDate={new Date()}
                      className="w-full"
                    />
                  </div>
                  <Input
                    label="Earliest Pickup Time"
                    type="time"
                    value={formData.timeWindowStart}
                    onChange={(e) => setFormData({ ...formData, timeWindowStart: e.target.value })}
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Latest Pickup Time"
                    type="time"
                    value={formData.timeWindowEnd}
                    onChange={(e) => setFormData({ ...formData, timeWindowEnd: e.target.value })}
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Departure Deadline"
                    type="time"
                    value={formData.departureDeadline}
                    onChange={(e) => setFormData({ ...formData, departureDeadline: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Vehicle & Terminal */}
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-4 border border-neutral-200">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <FaCar className="text-primary" /> Vehicle & Terminal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Vehicle Name / Model"
                    type="text"
                    placeholder="e.g. Toyota Corolla, Nissan, Lexus 360"
                    value={formData.vehicleName}
                    onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Vehicle Plate Number"
                    type="text"
                    placeholder="e.g. LAG-123-XY"
                    value={formData.vehiclePlateNumber}
                    onChange={(e) => setFormData({ ...formData, vehiclePlateNumber: e.target.value })}
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Pickup Address / Terminal"
                    type="text"
                    placeholder="e.g. Conoil filling station, Festac"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

               {/* Capacity */}
               <div className="bg-neutral-50 p-4 rounded-2xl space-y-4 border border-neutral-200">
                 <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                   <FaUsers className="text-primary" /> Capacity
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input
                     label="Available Seats"
                     type="number"
                     min="1"
                     max="7"
                     value={formData.seats}
                     onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                     required
                     disabled={saving}
                   />
                   <Input
                     label="Min Seats to start"
                     type="number"
                     min="1"
                     max={formData.seats}
                     value={formData.minSeats}
                     onChange={(e) => setFormData({ ...formData, minSeats: e.target.value })}
                     required
                     disabled={saving}
                   />
                 </div>
               </div>

               {/* Pricing */}
               <div className="bg-neutral-50 p-4 rounded-2xl space-y-4 border border-neutral-200">
                 <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                   <FaMoneyBillWave className="text-primary" /> Pricing
                 </h3>
                 <div>
                   <Input
                     label="Price per Seat (₦)"
                     type="number"
                     placeholder="e.g. 1500"
                     value={formData.price}
                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                     required
                     disabled={saving}
                   />
                   <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
                     <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" size={14} />
                     <div>
                       <p className="text-xs font-semibold text-blue-800 mb-0.5">Price Recommendation</p>
                       <p className="text-[10px] text-blue-700 leading-relaxed">
                         Mainland ↔ Island, Peak hours: ₦1,500 - ₦5,000
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.serviceCategory === "freight" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Vehicle Type
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                      required>
                      <option value="Bike">Bike</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                  <Input
                    label="Base Fare (₦)"
                    type="number"
                    value={formData.baseFare}
                    onChange={(e) =>
                      setFormData({ ...formData, baseFare: e.target.value })
                    }
                    placeholder="e.g. 5000"
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Price per Kg (₦)"
                    type="number"
                    value={formData.pricePerKg}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerKg: e.target.value })
                    }
                    placeholder="e.g. 250"
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Minimum Charge (₦)"
                    type="number"
                    value={formData.minCharge}
                    onChange={(e) =>
                      setFormData({ ...formData, minCharge: e.target.value })
                    }
                    placeholder="e.g. 3000"
                    disabled={saving}
                    required
                  />
                  <Input
                    label="Max Capacity (kg)"
                    type="number"
                    value={formData.maxWeightCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxWeightCapacity: e.target.value })
                    }
                    placeholder="e.g. 500"
                    disabled={saving}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => {
                      const vehicleType = e.target.value;
                      let seats = formData.seats;

                      // Auto-set seats based on vehicle type
                      if (vehicleType.includes("18 seater")) seats = 18;
                      else if (vehicleType.includes("32 seater")) seats = 32;
                      else if (vehicleType.includes("52 seater")) seats = 52;
                      else if (vehicleType === "Mini Buses (7 seater)") seats = 7;
                      else if (vehicleType === "Sienna car (7 seats)") seats = 7;
                      else if (vehicleType === "Sedan (small car)") seats = 4;

                      setFormData({ ...formData, vehicleType, seats });
                    }}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={saving}>
                    <option value="Hiace Bus (18 seater)">
                      Hiace Bus (18 seater)
                    </option>
                    <option value="Coaster Bus (32 seater)">
                      Coaster Bus (32 seater)
                    </option>
                    <option value="Luxirious Bus (52 seater)">
                      Luxirious Bus (52 seater)
                    </option>
                    <option value="Mini Buses (7 seater)">
                      Mini Buses (7 seater)
                    </option>
                    <option value="Sienna car (7 seats)">
                      Sienna car (7 seats)
                    </option>
                    <option value="Sedan (small car)">Sedan (small car)</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <Input
                    label="Vehicle Name / Model"
                    type="text"
                    placeholder="e.g. Toyota Corolla, Nissan, Lexus 360"
                    value={formData.vehicleName}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleName: e.target.value })
                    }
                    disabled={saving}
                    required
                  />
                </div>
              )}

              {/* FROM/TO LOCATION */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-neutral-800">Route Selection</h3>
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10"
                  title="Swap From/To locations">
                  <FaExchangeAlt />
                  SWAP ROUTE
                </button>
              </div>

              {formData.transportType === "inter-state" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Departure State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value, from: "" })
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={saving}>
                      <option value="">Select departure state</option>
                      {locationOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.state && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        From City
                      </label>
                      <select
                        value={formData.from}
                        onChange={(e) =>
                          setFormData({ ...formData, from: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving}>
                        <option value="">Select departure city</option>
                        {fromCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Destination State
                    </label>
                    <select
                      value={formData.toState}
                      onChange={(e) =>
                        setFormData({ ...formData, toState: e.target.value, to: "" })
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={saving}>
                      <option value="">Select destination state</option>
                      {locationOptions.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.toState && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        To City
                      </label>
                      <select
                        value={formData.to}
                        onChange={(e) =>
                          setFormData({ ...formData, to: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving}>
                        <option value="">Select destination city</option>
                        {toCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Departure Country
                      </label>
                      <select
                        value={formData.fromCountry}
                        onChange={(e) =>
                          setFormData({ ...formData, fromCountry: e.target.value, fromState: "", city: "" })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving}>
                        <option value="">Select country</option>
                        {westAfricanCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Departure State/Region
                      </label>
                      <select
                        value={formData.fromState}
                        onChange={(e) =>
                          setFormData({ ...formData, fromState: e.target.value, from: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving || !formData.fromCountry}>
                        <option value="">Select state/region</option>
                        {westAfricanStates[formData.fromCountry]?.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Destination Country
                      </label>
                      <select
                        value={formData.toCountry}
                        onChange={(e) =>
                          setFormData({ ...formData, toCountry: e.target.value, toState: "", to: "" })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving}>
                        <option value="">Select country</option>
                        {westAfricanCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Destination State/Region
                      </label>
                      <select
                        value={formData.toState}
                        onChange={(e) =>
                          setFormData({ ...formData, toState: e.target.value, to: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        disabled={saving || !formData.toCountry}>
                        <option value="">Select state/region</option>
                        {westAfricanStates[formData.toCountry]?.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Terminal Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Jibowu Terminal"
                    value={formData.terminal}
                    onChange={(e) =>
                      setFormData({ ...formData, terminal: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-bold text-neutral-800 mb-1 flex items-center justify-between">
                    <span>Departure Time Slots</span>
                    {!editingTicket && (
                      <button
                        type="button"
                        onClick={handleAddTimeSlot}
                        className="text-[10px] bg-primary text-white px-2 py-1 rounded-md hover:bg-primary/90 transition-all flex items-center gap-1">
                        <FaPlus size={8} /> ADD SLOT
                      </button>
                    )}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.departureTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <MaterialTimePicker
                            label={`Slot ${index + 1}`}
                            value={time}
                            onChange={(timeStr) => handleTimeSlotChange(index, timeStr)}
                          />
                        </div>
                        {!editingTicket && formData.departureTimes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeSlot(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove time slot">
                            <FaMinus />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-700 border-b pb-2 pt-2">
                  Schedule & Dates
                </h3>

                <MaterialDatePicker
                  label="Specific Departure Date (Optional)"
                  value={formData.departureDate}
                  onChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      const dateStr = `${year}-${month}-${day}`;
                      setFormData({
                        ...formData,
                        departureDate: dateStr,
                        operatingDays: [],
                      });
                    } else {
                      setFormData({ ...formData, departureDate: "" });
                    }
                  }}
                  minDate={new Date()}
                  className="w-full"
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Or Operating Days (Recurring Trip)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-full cursor-pointer hover:bg-neutral-200 transition-colors">
                        <input
                          type="checkbox"
                          className="rounded text-primary focus:ring-primary w-4 h-4"
                          checked={formData.operatingDays.includes(day)}
                          disabled={saving || formData.departureDate}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...formData.operatingDays, day]
                              : formData.operatingDays.filter((d) => d !== day);
                            setFormData({
                              ...formData,
                              operatingDays: newDays,
                              departureDate: "",
                            });
                          }}
                        />
                        <span className="text-sm">{day.substring(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Input
                label="Duration (hours)"
                type="number"
                step="0.5"
                placeholder="12"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                disabled={saving}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Standard Price (₦)"
                  type="number"
                  placeholder="25000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  disabled={saving}
                />
                <Input
                  label="Total Seats"
                  type="number"
                  placeholder="40"
                  value={formData.seats}
                  onChange={(e) =>
                    setFormData({ ...formData, seats: e.target.value })
                  }
                  required
                  disabled={saving}
                />
              </div>

              {formData.transportType === "international" && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-neutral-700">
                    Document-Based Pricing (₦)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Regular Passport"
                      type="number"
                      placeholder="25000"
                      value={formData.documentPrices["Regular Passport"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentPrices: {
                            ...formData.documentPrices,
                            "Regular Passport": e.target.value,
                          },
                        })
                      }
                      disabled={saving}
                    />
                    <Input
                      label="Virgin Passport"
                      type="number"
                      placeholder="25000"
                      value={formData.documentPrices["Virgin Passport"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentPrices: {
                            ...formData.documentPrices,
                            "Virgin Passport": e.target.value,
                          },
                        })
                      }
                      disabled={saving}
                    />
                    <Input
                      label="NIN"
                      type="number"
                      placeholder="25000"
                      value={formData.documentPrices["NIN"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentPrices: {
                            ...formData.documentPrices,
                            NIN: e.target.value,
                          },
                        })
                      }
                      disabled={saving}
                    />
                    <Input
                      label="No Document"
                      type="number"
                      placeholder="25000"
                      value={formData.documentPrices["No Document"]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentPrices: {
                            ...formData.documentPrices,
                            "No Document": e.target.value,
                          },
                        })
                      }
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Vehicle Name */}
                <div className="bg-neutral-50 p-4 rounded-2xl space-y-4 border border-neutral-200">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <FaBus className="text-primary" /> Vehicle Details
                  </h3>
                  <div>
                    <Input
                      label="Vehicle Name / Model"
                      type="text"
                      placeholder="e.g. Toyota Corolla, Nissan"
                      value={formData.vehicleName}
                      onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={showTypeSelection}
        onClose={() => setShowTypeSelection(false)}
        title={null} // Remove default title for custom styling
      >
        <div className="bg-charcoal -mx-6 -mt-6 p-8 text-white rounded-t-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <FaPlus className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-raleway">Add New Trip</h2>
              <p className="text-neutral-400 text-sm">Select the type of service you want to offer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          {/* Carpool Option */}
          <div 
            onClick={() => handleSelectTripType("carpooling")}
            className="group cursor-pointer border border-neutral-200 hover:border-primary rounded-2xl overflow-hidden transition-all hover:shadow-lg flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <FaCar size={24} />
                </div>
                <div>
                  <h3 className="font-raleway font-bold text-lg text-charcoal">Offer a Ride</h3>
                  <p className="text-xs text-neutral-500 italic">Help others and save on fuel costs</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Post city-to-city trips for passengers. Ideal for cars and small buses.
              </p>
            </div>
            <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="font-bold text-sm">SELECT PASSENGER</span>
            </div>
          </div>

          {/* Freight Option */}
          <div 
            onClick={() => handleSelectTripType("freight")}
            className="group cursor-pointer border border-neutral-200 hover:border-primary rounded-2xl overflow-hidden transition-all hover:shadow-lg flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <FaTruck size={24} />
                </div>
                <div>
                  <h3 className="font-raleway font-bold text-lg text-charcoal">Freight Trip</h3>
                  <p className="text-xs text-neutral-500 italic">Fast and reliable cargo delivery</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Post logistics routes for cargo and parcels. Ideal for vans and trucks.
              </p>
            </div>
            <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="font-bold text-sm">SELECT FREIGHT</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center border-t border-neutral-100 pt-6">
          <button 
            onClick={() => setShowTypeSelection(false)}
            className="text-neutral-500 hover:text-charcoal text-sm font-medium transition-colors underline"
          >
            Cancel and Close
          </button>
        </div>
      </Modal>
      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() =>
          setDeleteConfirm({ open: false, id: null, deleting: false })
        }
        onConfirm={confirmDelete}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isProcessing={deleteConfirm.deleting}
      />

      <Footer />
    </div>
  );
};

export default TicketsManagement;
