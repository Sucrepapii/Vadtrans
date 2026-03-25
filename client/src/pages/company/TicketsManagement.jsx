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
} from "react-icons/fa";
import { MaterialTimePicker } from "../../components/MaterialDatePicker";
import MaterialDatePicker from "../../components/MaterialDatePicker";

const TicketsManagement = () => {
  const { user } = useAuth(); // Get user for verification status check
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    transportType: "inter-state",
    departureTime: "",
    departureDate: "",
    operatingDays: [],
    duration: "",
    price: "",
    seats: 18,
    serviceCategory: "passenger",
    freightType: "",

    state: "", // For intra-state: the selected state for city-to-city trips
    toState: "",
    vehicleType: "Hiace Bus (18 seater)",
    terminal: "",
    city: "",
    documentPrices: {
      "Regular Passport": "",
      "Virgin Passport": "",
      NIN: "",
      "No Document": "",
    },
  });

  const { states, getCitiesForState } = useLocationsAPI();
  const [apiFromCities, setApiFromCities] = useState([]);
  const [apiToCities, setApiToCities] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const stateToFetch = formData.transportType === "intra-state" || formData.transportType === "inter-state" 
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
        transportType: trip.transportType,
        departureTime: trip.departureTime,
        departureDate: trip.departureDate,
        operatingDays: trip.operatingDays ? trip.operatingDays.split(",") : [],
        price: Number(trip.price),
        seats: trip.seats,
        availableSeats: trip.availableSeats,
        status: trip.status,
        duration: trip.duration || "",
        serviceCategory: trip.serviceCategory || "passenger",
        freightType: trip.freightType || "",
        vehicleType: trip.vehicleType || "Hiace Bus (18 seater)",
        terminal: trip.terminal || "",
        city: trip.city || "",
        state: trip.state || "",
        documentPrices: trip.documentPrices || {
          "Regular Passport": "",
          "Virgin Passport": "",
          NIN: "",
          "No Document": "",
        },
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
      departureTime: "",
      operatingDays: [],
      duration: "",
      price: "",
      seats: 18,
      serviceCategory: "passenger",
      freightType: "",

      state: "",
      toState: "",
      vehicleType: "Hiace Bus (18 seater)",
      city: "",
      documentPrices: {
        "Regular Passport": "",
        "Virgin Passport": "",
        NIN: "",
        "No Document": "",
      },
    });
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    const [from, to] = ticket.route.split(" - ");
    setFormData({
      from,
      to,
      transportType: ticket.transportType,
      departureTime: ticket.departureTime,
      departureDate: ticket.departureDate || "",
      operatingDays: Array.isArray(ticket.operatingDays)
        ? ticket.operatingDays
        : ticket.operatingDays
          ? ticket.operatingDays.split(",")
          : [],
      duration: ticket.duration || "",
      price: ticket.price,
      seats: ticket.seats,
      serviceCategory: ticket.serviceCategory || "passenger",
      freightType: ticket.freightType || "",
      vehicleType: ticket.vehicleType || "Hiace Bus (18 seater)",
      terminal: ticket.terminal || "",
      city: ticket.city || "",
      state: ticket.state || "",
      documentPrices: ticket.documentPrices || {
        "Regular Passport": "",
        "Virgin Passport": "",
        NIN: "",
        "No Document": "",
      },
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
        departureDate: formData.departureDate || null,
        operatingDays:
          formData.operatingDays.length > 0
            ? formData.operatingDays.join(",")
            : null,
        duration: formData.duration || null,
        price: Number(formData.price),
        serviceCategory: formData.serviceCategory,
        freightType:
          formData.serviceCategory === "freight" ? formData.freightType : null,

        seats: Number(formData.seats),
        vehicleType: formData.vehicleType,
        terminal: formData.terminal,
        city: formData.city,
        documentPrices: formData.documentPrices,
      };

      if (editingTicket) {
        // Update existing trip
        await tripAPI.updateTrip(editingTicket.id, tripData);
        toast.success("Trip updated successfully!");
      } else {
        // Create new trip
        await tripAPI.createTrip(tripData);
        toast.success("Trip created successfully!");
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
      <Navbar variant="desktop" portalLabel="TRANSPORT PORTAL" />

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
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Service Category
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="serviceCategory"
                  value="passenger"
                  checked={formData.serviceCategory === "passenger"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceCategory: e.target.value,
                    })
                  }
                  disabled={saving}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Passenger Transport
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="serviceCategory"
                  value="freight"
                  checked={formData.serviceCategory === "freight"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceCategory: e.target.value,
                    })
                  }
                  disabled={saving}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Freight Transport
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Transport Type
            </label>
            <select
              value={formData.transportType}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  transportType: e.target.value,
                  from: "",
                  to: "",
                  state: "",
                });
              }}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={saving}>
              <option value="inter-state">
                Inter-State Trips Across Nigeria
              </option>
              <option value="international">
                International Trips Within West Africa
              </option>
              <option value="intra-state">
                Intra-State City-to-City Trips
              </option>
            </select>
          </div>

          {formData.serviceCategory === "freight" ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Freight Type
              </label>
              <select
                value={formData.freightType}
                onChange={(e) =>
                  setFormData({ ...formData, freightType: e.target.value })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={saving}
                required>
                <option value="">Select Freight Type</option>
                <option value="Small Parcel">Small Parcel</option>
                <option value="Medium Cargo">Medium Cargo</option>
                <option value="Large/Bulk Cargo">Large/Bulk Cargo</option>
              </select>
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
          )}

          {/* FROM/TO LOCATION */}
          {formData.transportType === "intra-state" ? (
            <>
              {/* Single State Selection for city-to-city trips */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  State (for city-to-city trip)
                </label>
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

              {/* From City - within selected state */}
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

              {/* To City - within same state */}
              {formData.state && (
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
                    {fromCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : formData.transportType === "inter-state" ? (
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
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  From
                </label>
                <select
                  value={formData.from}
                  onChange={(e) =>
                    setFormData({ ...formData, from: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={saving}>
                  <option value="">
                    Select departure country
                  </option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  To
                </label>
                <select
                  value={formData.to}
                  onChange={(e) =>
                    setFormData({ ...formData, to: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={saving}>
                  <option value="">
                    Select destination country
                  </option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
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
            {(formData.transportType === "international") && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Terminal City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={saving}>
                  <option value="">Select City</option>
                  {formData.from && westAfricanCities[formData.from]
                    ? westAfricanCities[formData.from].map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))
                    : null}
                </select>
              </div>
            )}
          </div>

          <MaterialTimePicker
            label="Departure Time"
            value={formData.departureTime}
            onChange={(timeStr) =>
              setFormData({ ...formData, departureTime: timeStr })
            }
            className="w-full"
          />

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
              {formData.departureDate && (
                <p className="text-xs text-amber-600 mt-2">
                  Clear specific date to use recurring days.
                </p>
              )}
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
              <p className="text-xs text-neutral-500 italic">
                * If left empty, the Standard Price will be used.
              </p>
            </div>
          )}
        </form>
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
