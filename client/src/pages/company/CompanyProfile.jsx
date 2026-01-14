import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI, tripAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaUpload,
  FaFileAlt,
  FaBus,
  FaTrash,
  FaUser,
  FaFileInvoice,
  FaTicketAlt,
} from "react-icons/fa";
import {
  nigerianStates,
  westAfricanCountries,
  nigerianStatesWithCities,
} from "../../data/locations";

const CompanyProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Data
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessRegNo: "",
    taxId: "",
    description: "",
    founded: "",
    vehicles: 0,
    routes: 0,
    verificationStatus: "pending",
  });
  const [editData, setEditData] = useState(companyData);

  // Documents Data
  const [documents, setDocuments] = useState({
    businessRegistration: null,
    vehiclePermits: null,
    insurance: null,
    otherDocuments: null,
  });

  // Tickets Data
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    transportType: "inter-state",
    departureTime: "",
    duration: "",
    price: "",
    seats: "",
    fromState: "",
    toState: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "tickets", label: "Tickets", icon: FaTicketAlt },
    { id: "documents", label: "Documents", icon: FaFileInvoice },
  ];

  // Fetch company profile on mount
  useEffect(() => {
    fetchProfile();
    if (activeTab === "tickets") {
      fetchTrips();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      const userData = response.data.user;

      const profileData = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        businessRegNo: userData.businessRegNo || "",
        taxId: userData.taxId || "",
        description: userData.description || "",
        founded: userData.founded || "",
        vehicles: userData.vehicles || 0,
        routes: userData.routes || 0,
        verificationStatus: userData.verificationStatus || "pending",
      };

      setCompanyData(profileData);
      setEditData(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Tickets Functions
  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getMyTrips();
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(companyData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await authAPI.updateProfile(editData);
      setCompanyData(editData);
      setIsEditing(false);
      if (updateUser) {
        updateUser(response.data.user);
      }
      toast.success("Profile updated successfully!");
      await fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(companyData);
    setIsEditing(false);
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

      if (editingTrip) {
        await tripAPI.updateTrip(editingTrip.id, tripData);
        toast.success("Trip updated successfully!");
      } else {
        await tripAPI.createTrip(tripData);
        toast.success("Trip created successfully!");
      }

      setFormData({
        from: "",
        to: "",
        transportType: "inter-state",
        departureTime: "",
        duration: "",
        price: "",
        seats: "",
      });
      setShowModal(false);
      setEditingTrip(null);
      fetchTrips();
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error(error.response?.data?.message || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await tripAPI.deleteTrip(tripId);
        toast.success("Trip deleted successfully!");
        fetchTrips();
      } catch (error) {
        console.error("Error deleting trip:", error);
        toast.error("Failed to delete trip");
      }
    }
  };

  const locationOptions = useMemo(() => {
    if (formData.transportType === "international") {
      return westAfricanCountries;
    } else if (formData.transportType === "inter-state") {
      return nigerianStates;
    } else if (formData.transportType === "intra-state") {
      return Object.keys(nigerianStatesWithCities);
    }
    return nigerianStates;
  }, [formData.transportType]);

  const fromCities = useMemo(() => {
    if (formData.transportType === "intra-state" && formData.fromState) {
      return nigerianStatesWithCities[formData.fromState] || [];
    }
    return [];
  }, [formData.transportType, formData.fromState]);

  const toCities = useMemo(() => {
    if (formData.transportType === "intra-state" && formData.toState) {
      return nigerianStatesWithCities[formData.toState] || [];
    }
    return [];
  }, [formData.transportType, formData.toState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-neutral-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-raleway font-bold text-charcoal">
                Company Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your company information and trips
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-neutral-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-neutral-600 hover:text-charcoal"
                }`}>
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                {/* Verification Status */}
                <Card
                  className={`${
                    companyData.verificationStatus === "verified"
                      ? "bg-green-50 border-green-200"
                      : companyData.verificationStatus === "pending"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-red-50 border-red-200"
                  }`}>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle
                      className={`text-3xl ${
                        companyData.verificationStatus === "verified"
                          ? "text-green-600"
                          : companyData.verificationStatus === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    />
                    <div>
                      <h3
                        className={`font-semibold ${
                          companyData.verificationStatus === "verified"
                            ? "text-green-800"
                            : companyData.verificationStatus === "pending"
                            ? "text-yellow-800"
                            : "text-red-800"
                        }`}>
                        {companyData.verificationStatus === "verified" &&
                          "Verified Company"}
                        {companyData.verificationStatus === "pending" &&
                          "Verification Pending"}
                        {companyData.verificationStatus === "rejected" &&
                          "Verification Rejected"}
                      </h3>
                      <p
                        className={`text-sm ${
                          companyData.verificationStatus === "verified"
                            ? "text-green-700"
                            : companyData.verificationStatus === "pending"
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}>
                        {companyData.verificationStatus === "verified" &&
                          "Your company has been verified and approved"}
                        {companyData.verificationStatus === "pending" &&
                          "Your company verification is under review"}
                        {companyData.verificationStatus === "rejected" &&
                          "Please contact support for more information"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Basic Information */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    {!isEditing ? (
                      <Button variant="primary" onClick={handleEdit}>
                        <div className="flex items-center gap-2">
                          <FaEdit />
                          <span>Edit Profile</span>
                        </div>
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={handleCancel}
                          disabled={saving}>
                          <div className="flex items-center gap-2">
                            <FaTimes />
                            <span>Cancel</span>
                          </div>
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={saving}>
                          <div className="flex items-center gap-2">
                            {saving ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaSave />
                            )}
                            <span>{saving ? "Saving..." : "Save"}</span>
                          </div>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <Input
                          label="Company Name"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          icon={FaBuilding}
                          disabled={saving}
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={editData.email}
                          disabled
                          icon={FaEnvelope}
                          className="bg-neutral-100 cursor-not-allowed"
                        />
                        <Input
                          label="Phone"
                          type="tel"
                          value={editData.phone}
                          onChange={(e) =>
                            setEditData({ ...editData, phone: e.target.value })
                          }
                          icon={FaPhone}
                          disabled={saving}
                        />
                        <Input
                          label="Address"
                          value={editData.address}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              address: e.target.value,
                            })
                          }
                          icon={FaMapMarkerAlt}
                          disabled={saving}
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <FaBuilding className="text-neutral-500" />
                          <div>
                            <p className="text-sm text-neutral-600">
                              Company Name
                            </p>
                            <p className="font-semibold">{companyData.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaEnvelope className="text-neutral-500" />
                          <div>
                            <p className="text-sm text-neutral-600">Email</p>
                            <p className="font-semibold">{companyData.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaPhone className="text-neutral-500" />
                          <div>
                            <p className="text-sm text-neutral-600">Phone</p>
                            <p className="font-semibold">{companyData.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaMapMarkerAlt className="text-neutral-500" />
                          <div>
                            <p className="text-sm text-neutral-600">Address</p>
                            <p className="font-semibold">
                              {companyData.address}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Company Description */}
                <Card>
                  <h2 className="text-lg font-semibold mb-4">About Company</h2>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      rows="4"
                      disabled={saving}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about your company..."
                    />
                  ) : (
                    <p className="text-neutral-700">
                      {companyData.description || "No description provided"}
                    </p>
                  )}
                </Card>

                {/* Company Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {companyData.vehicles}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">Vehicles</p>
                  </Card>
                  <Card className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {trips.length}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      Active Trips
                    </p>
                  </Card>
                  <Card className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {companyData.founded || "N/A"}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">Founded</p>
                  </Card>
                </div>
              </>
            )}

            {/* Tickets Tab */}
            {activeTab === "tickets" && (
              <Card>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-semibold">Manage Trips</h2>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    <div className="flex items-center gap-2">
                      <FaBus />
                      <span>Add New Trip</span>
                    </div>
                  </Button>
                </div>

                {/* Trips List */}
                <div className="space-y-3">
                  {trips.length === 0 ? (
                    <p className="text-center text-neutral-600 py-8">
                      No trips created yet. Click "Add New Trip" to get started.
                    </p>
                  ) : (
                    trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FaBus className="text-primary" />
                              <h3 className="font-semibold">
                                {trip.from} → {trip.to}
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
                              <p>Departure: {trip.departureTime}</p>
                              <p>
                                Price: ₦{Number(trip.price).toLocaleString()}
                              </p>
                              <p>
                                Seats: {trip.availableSeats}/{trip.seats}
                              </p>
                              <p>Type: {trip.transportType}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setEditingTrip(trip);
                                setFormData({
                                  from: trip.from,
                                  to: trip.to,
                                  transportType: trip.transportType,
                                  departureTime: trip.departureTime,
                                  duration: trip.duration || "",
                                  price: trip.price,
                                  seats: trip.seats,
                                });
                                setShowModal(true);
                              }}>
                              <FaEdit />
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="text-red-600 hover:bg-red-50">
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add/Edit Trip Modal */}
                {showModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <h3 className="text-xl font-semibold mb-4">
                        {editingTrip ? "Edit Trip" : "Add New Trip"}
                      </h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Transport Type
                          </label>
                          <select
                            value={formData.transportType}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                transportType: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
                            <option value="bus-domestic">Bus - Domestic</option>
                            <option value="bus-international">
                              Bus - International
                            </option>
                            <option value="car-domestic">Car - Domestic</option>
                            <option value="car-international">
                              Car - International
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            From
                          </label>
                          <select
                            value={formData.from}
                            onChange={(e) =>
                              setFormData({ ...formData, from: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required>
                            <option value="">Select departure</option>
                            {locationOptions.map((location) => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            To
                          </label>
                          <select
                            value={formData.to}
                            onChange={(e) =>
                              setFormData({ ...formData, to: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                            required>
                            <option value="">Select destination</option>
                            {locationOptions.map((location) => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Input
                          label="Departure Time"
                          type="time"
                          value={formData.departureTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              departureTime: e.target.value,
                            })
                          }
                          required
                        />

                        <Input
                          label="Duration (hours)"
                          type="number"
                          step="0.5"
                          placeholder="12"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: e.target.value,
                            })
                          }
                        />

                        <Input
                          label="Price (₦)"
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />

                        <Input
                          label="Total Seats"
                          type="number"
                          value={formData.seats}
                          onChange={(e) =>
                            setFormData({ ...formData, seats: e.target.value })
                          }
                          required
                        />

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                              setShowModal(false);
                              setEditingTrip(null);
                            }}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={saving}>
                            {saving
                              ? "Saving..."
                              : editingTrip
                              ? "Update"
                              : "Create"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Company Documents</h2>
                  <span className="text-xs text-neutral-600">
                    Required for verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Business Registration */}
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="businessReg"
                      className="hidden"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          businessRegistration: e.target.files[0],
                        })
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="businessReg" className="cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <FaUpload className="text-2xl text-neutral-400 mb-2" />
                        <p className="font-medium text-sm mb-1">
                          Business Registration
                        </p>
                        {documents.businessRegistration ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle />
                            {documents.businessRegistration.name}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-600">
                            Click to upload
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Vehicle Permits */}
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="vehiclePermits"
                      className="hidden"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          vehiclePermits: e.target.files[0],
                        })
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="vehiclePermits" className="cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <FaUpload className="text-2xl text-neutral-400 mb-2" />
                        <p className="font-medium text-sm mb-1">
                          Vehicle Permits
                        </p>
                        {documents.vehiclePermits ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle />
                            {documents.vehiclePermits.name}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-600">
                            Click to upload
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Insurance */}
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="insurance"
                      className="hidden"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          insurance: e.target.files[0],
                        })
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="insurance" className="cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <FaUpload className="text-2xl text-neutral-400 mb-2" />
                        <p className="font-medium text-sm mb-1">
                          Insurance Certificate
                        </p>
                        {documents.insurance ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle />
                            {documents.insurance.name}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-600">
                            Click to upload
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Other Documents */}
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="otherDocs"
                      className="hidden"
                      onChange={(e) =>
                        setDocuments({
                          ...documents,
                          otherDocuments: e.target.files[0],
                        })
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="otherDocs" className="cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <FaFileAlt className="text-2xl text-neutral-400 mb-2" />
                        <p className="font-medium text-sm mb-1">
                          Other Documents
                        </p>
                        {documents.otherDocuments ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle />
                            {documents.otherDocuments.name}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-600">
                            Click to upload
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> All documents must be in PDF, JPG, or
                    PNG format (max 5MB). Documents are required for company
                    verification.
                  </p>
                </div>

                {Object.values(documents).some((doc) => doc !== null) && (
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto"
                      disabled={saving}>
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <FaSpinner className="animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaUpload />
                          <span>Upload Documents</span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompanyProfile;
