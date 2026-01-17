import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Input from "../../components/Input";
import {
  nigerianStates,
  westAfricanCountries,
  nigerianStatesWithCities,
} from "../../data/locations";
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
} from "react-icons/fa";
import { MaterialTimePicker } from "../../components/MaterialDatePicker";

const TicketsManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    transportType: "inter-state",
    departureTime: "",
    duration: "",
    price: "",
    seats: "",
    state: "", // For intra-state: the selected state for city-to-city trips
  });

  // Determine location options based on transport type
  const locationOptions = useMemo(() => {
    if (formData.transportType === "international") {
      return westAfricanCountries;
    } else if (formData.transportType === "inter-state") {
      return nigerianStates;
    } else if (formData.transportType === "intra-state") {
      // For intra-state, return states for the state selection
      return Object.keys(nigerianStatesWithCities);
    }
    return nigerianStates;
  }, [formData.transportType]);

  // Get cities for selected state (intra-state only)
  const stateCities = useMemo(() => {
    if (formData.transportType === "intra-state" && formData.state) {
      return nigerianStatesWithCities[formData.state] || [];
    }
    return [];
  }, [formData.transportType, formData.state]);

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
        price: Number(trip.price),
        seats: trip.seats,
        availableSeats: trip.availableSeats,
        status: trip.status,
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
    setEditingTicket(null);
    setFormData({
      from: "",
      to: "",
      transportType: "inter-state",
      departureTime: "",
      duration: "",
      price: "",
      seats: "",
      state: "",
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
      duration: ticket.duration || "",
      price: ticket.price,
      seats: ticket.seats,
    });
    setIsModalOpen(true);
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await tripAPI.deleteTrip(id);
        toast.success("Trip deleted successfully!");
        fetchTrips(); // Refresh the list
      } catch (error) {
        console.error("Error deleting trip:", error);
        toast.error(error.response?.data?.message || "Failed to delete trip");
      }
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
        duration: formData.duration || null,
        price: Number(formData.price),
        seats: Number(formData.seats),
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

  const getTransportIcon = (type) => {
    // All transport types use bus icon
    return <FaBus className="text-primary" />;
  };

  const columns = [
    {
      key: "route",
      label: "Route",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getTransportIcon(row.transportType)}
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
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" portalLabel="COMPANY PORTAL" />

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
                    {stateCities.map((city) => (
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
                    {stateCities.map((city) => (
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
                    Select departure{" "}
                    {formData.transportType === "international"
                      ? "country"
                      : "state"}
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
                    Select destination{" "}
                    {formData.transportType === "international"
                      ? "country"
                      : "state"}
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

          <MaterialTimePicker
            label="Departure Time"
            value={formData.departureTime}
            onChange={(timeStr) =>
              setFormData({ ...formData, departureTime: timeStr })
            }
            className="w-full"
          />

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
              label="Price (₦)"
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
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default TicketsManagement;
