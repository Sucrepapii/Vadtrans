import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  FaTruck,
  FaTrash,
  FaUser,
  FaFileInvoice,
  FaTicketAlt,
  FaBox,
  FaCopy,
  FaLink,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { westAfricanCountries, westAfricanCities } from "../../data/locations";
import { useLocationsAPI } from "../../hooks/useLocationsAPI";
import MaterialDatePicker, {
  MaterialTimePicker,
} from "../../components/MaterialDatePicker";
import { nigerianBanks } from "../../data/banks";
import DocumentsTab from "../../components/company/DocumentsTab";
import PassengersTab from "../../components/company/PassengersTab";
import ShipmentsTab from "../../components/company/ShipmentsTab";
import { FaUsers } from "react-icons/fa";
import { calculateServiceFee, calculateVAT } from "../../utils/pricing";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/search?companyId=${user.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Booking link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
    },
    freightCapabilities: {
      vehicleTypes: "", // stored as comma-separated string for simplicity in frontend
      cargoCapacity: "",
      weightLimit: "",
      crossBorderCapability: false,
      insuranceStatus: "",
    },
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
    transportType: "carpooling",
    departureTime: "",
    departureDate: "",
    operatingDays: [],
    duration: "",
    price: "",
    seats: 18,
    serviceCategory: "passenger",
    freightType: "",

    state: "",
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
    // Carpooling specific fields
    timeWindowStart: "",
    timeWindowEnd: "",
    minSeats: 1,
    depositAmount: 0,
    cancellationWindow: 12,
    confirmationWindow: 2,
    vehicleName: "",
    vehiclePlateNumber: "",
    driverContact: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "tickets", label: "Tickets", icon: FaTicketAlt },
    { id: "passengers", label: "Passengers", icon: FaUsers },
    { id: "shipments", label: "Shipments", icon: FaBox },
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
        bankDetails: userData.bankDetails || {
          bankName: "",
          accountNumber: "",
          accountName: "",
        },
        freightCapabilities: userData.freightCapabilities || {
          vehicleTypes: "",
          cargoCapacity: "",
          weightLimit: "",
          crossBorderCapability: false,
          insuranceStatus: "",
        },
      };

      console.log("Loaded Profile Data:", profileData);

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
      const rawTrips = response.data.trips || [];
      const transformedTrips = rawTrips.map((trip) => ({
        ...trip,
        transportType:
          trip.transportType === "intra-state"
            ? "carpooling"
            : trip.transportType,
      }));
      setTrips(transformedTrips);
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
      console.log("Sending to Backend:", editData);
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
      if (error.response?.status === 413) {
        toast.error(
          "Logo image is too large. Please upload an image smaller than 10MB.",
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update profile",
        );
      }
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
        departureDate: formData.departureDate || null,
        operatingDays:
          formData.operatingDays && formData.operatingDays.length > 0
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
        timeWindowStart: formData.timeWindowStart || null,
        timeWindowEnd: formData.timeWindowEnd || null,
        minSeats: Number(formData.minSeats || 1),
        depositAmount: Number(formData.depositAmount || 0),
        cancellationWindow: Number(formData.cancellationWindow || 12),
        confirmationWindow: Number(formData.confirmationWindow || 2),
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
        departureDate: "",
        operatingDays: [],
        duration: "",
        price: "",
        seats: 18,
        serviceCategory: "passenger",
        freightType: "",

        state: "",
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
        timeWindowStart: "",
        timeWindowEnd: "",
        minSeats: 1,
        depositAmount: 0,
        cancellationWindow: 12,
        confirmationWindow: 2,
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

  const { states, getCitiesForState } = useLocationsAPI();
  const [apiFromCities, setApiFromCities] = useState([]);
  const [apiToCities, setApiToCities] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const stateToFetch =
      formData.transportType === "carpooling" ||
      formData.transportType === "inter-state"
        ? formData.state
        : null;

    if (stateToFetch) {
      getCitiesForState(stateToFetch).then((fetchedCities) => {
        if (isMounted) setApiFromCities(fetchedCities || []);
      });
    } else {
      setApiFromCities([]);
    }
    return () => {
      isMounted = false;
    };
  }, [formData.transportType, formData.state, getCitiesForState]);

  useEffect(() => {
    let isMounted = true;
    const stateToFetch =
      formData.transportType === "inter-state" ? formData.toState : null;

    if (stateToFetch) {
      getCitiesForState(stateToFetch).then((fetchedCities) => {
        if (isMounted) setApiToCities(fetchedCities || []);
      });
    } else {
      setApiToCities([]);
    }
    return () => {
      isMounted = false;
    };
  }, [formData.transportType, formData.toState, getCitiesForState]);

  const locationOptions = useMemo(() => {
    if (formData.transportType === "international") {
      return westAfricanCountries;
    }
    return states.map((s) => s.name);
  }, [formData.transportType, states]);

  const fromCities = useMemo(() => apiFromCities, [apiFromCities]);
  const toCities = useMemo(() => apiToCities, [apiToCities]);

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
      <Navbar variant="desktop" portalLabel="COMPANY PORTAL" />

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

                {/* Direct Booking Link */}
                <Card className="bg-neutral-800 text-white border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaLink size={80} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <FaLink className="text-primary text-xl" />
                      <h2 className="text-lg font-bold">Direct Booking Link</h2>
                    </div>
                    <p className="text-neutral-300 text-sm mb-6 max-w-2xl">
                      Share this unique link with your customers to direct them
                      straight to your available trips and services. Perfect for
                      social media bios or WhatsApp status updates.
                    </p>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                      <div className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-mono truncate">
                        {user?.id ? (
                          `${window.location.origin}/search?companyId=${user.id}`
                        ) : (
                          <span className="text-neutral-500 italic">
                            Generating your unique link...
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCopyLink}
                          disabled={!user?.id}
                          className="bg-primary hover:bg-primary-dark text-white border-0 flex items-center gap-2 whitespace-nowrap">
                          {copied ? <FaCheckCircle /> : <FaCopy />}
                          <span>{copied ? "Copied!" : "Copy Link"}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            user?.id &&
                            window.open(
                              `/search?companyId=${user.id}`,
                              "_blank",
                            )
                          }
                          disabled={!user?.id}
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-2 whitespace-nowrap">
                          <FaExternalLinkAlt size={14} />
                          <span>View Page</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Company Logo */}
                <Card className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Company Logo</h2>
                    {!isEditing && (
                      <Button
                        variant="secondary"
                        onClick={handleEdit}
                        className="text-sm py-1 px-3">
                        <FaEdit className="inline mr-1" /> Edit
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative flex-shrink-0">
                      {(isEditing ? editData.avatar : companyData.avatar) ? (
                        <img
                          src={isEditing ? editData.avatar : companyData.avatar}
                          alt="Company Logo"
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-neutral-200 flex items-center justify-center text-4xl text-neutral-500 font-bold border-4 border-white shadow-md">
                          {(companyData.name || "C").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex-1 w-full bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Upload New Logo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Optional: check size <= 2MB
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("Image must be smaller than 2MB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditData({
                                  ...editData,
                                  avatar: reader.result,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          disabled={saving}
                          className="w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer mb-2"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Recommended: Square image, max 2MB (JPEG/PNG).
                        </p>
                        {editData.avatar && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditData({ ...editData, avatar: "" })
                            }
                            className="text-xs text-red-600 mt-3 font-medium hover:underline">
                            Remove Logo
                          </button>
                        )}
                      </div>
                    )}
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

                {/* Bank Information */}
                <Card>
                  <h2 className="text-lg font-semibold mb-4">
                    Bank Information
                  </h2>
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-neutral-700">
                            Bank Name
                          </label>
                          <select
                            value={editData.bankDetails?.bankName || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                bankDetails: {
                                  ...editData.bankDetails,
                                  bankName: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={saving}>
                            <option value="">Select Bank</option>
                            {nigerianBanks.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Input
                          label="Account Number"
                          value={editData.bankDetails?.accountNumber || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              bankDetails: {
                                ...editData.bankDetails,
                                accountNumber: e.target.value,
                              },
                            })
                          }
                          disabled={saving}
                        />
                        <Input
                          label="Account Name"
                          value={editData.bankDetails?.accountName || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              bankDetails: {
                                ...editData.bankDetails,
                                accountName: e.target.value,
                              },
                            })
                          }
                          disabled={saving}
                        />
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-neutral-600">
                              Bank Name
                            </p>
                            <p className="font-semibold">
                              {companyData.bankDetails?.bankName ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">
                              Account Number
                            </p>
                            <p className="font-semibold">
                              {companyData.bankDetails?.accountNumber ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">
                              Account Name
                            </p>
                            <p className="font-semibold">
                              {companyData.bankDetails?.accountName ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Freight Capabilities */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <FaTruck className="text-primary" />
                    <h2 className="text-lg font-semibold">
                      Freight Capabilities
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {isEditing ? (
                      <>
                        <Input
                          label="Vehicle Types (e.g. Truck, Van, Pickup)"
                          value={
                            editData.freightCapabilities?.vehicleTypes || ""
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              freightCapabilities: {
                                ...editData.freightCapabilities,
                                vehicleTypes: e.target.value,
                              },
                            })
                          }
                          disabled={saving}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Cargo Capacity (e.g. 10 Tons)"
                            value={
                              editData.freightCapabilities?.cargoCapacity || ""
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                freightCapabilities: {
                                  ...editData.freightCapabilities,
                                  cargoCapacity: e.target.value,
                                },
                              })
                            }
                            disabled={saving}
                          />
                          <Input
                            label="Weight Limit (e.g. 10000 kg)"
                            value={
                              editData.freightCapabilities?.weightLimit || ""
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                freightCapabilities: {
                                  ...editData.freightCapabilities,
                                  weightLimit: e.target.value,
                                },
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Insurance Status (e.g. Active, Comprehensive)"
                            value={
                              editData.freightCapabilities?.insuranceStatus ||
                              ""
                            }
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                freightCapabilities: {
                                  ...editData.freightCapabilities,
                                  insuranceStatus: e.target.value,
                                },
                              })
                            }
                            disabled={saving}
                          />
                          <div className="flex items-center mt-6">
                            <input
                              type="checkbox"
                              id="crossBorderCheckbox"
                              checked={
                                editData.freightCapabilities
                                  ?.crossBorderCapability || false
                              }
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  freightCapabilities: {
                                    ...editData.freightCapabilities,
                                    crossBorderCapability: e.target.checked,
                                  },
                                })
                              }
                              disabled={saving}
                              className="w-4 h-4 text-primary bg-neutral-100 border-neutral-300 rounded focus:ring-primary focus:ring-2"
                            />
                            <label
                              htmlFor="crossBorderCheckbox"
                              className="ml-2 text-sm font-medium text-neutral-700">
                              Cross-Border Capability
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-neutral-600">
                              Vehicle Types
                            </p>
                            <p className="font-semibold">
                              {companyData.freightCapabilities?.vehicleTypes ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">
                              Cargo Capacity
                            </p>
                            <p className="font-semibold">
                              {companyData.freightCapabilities?.cargoCapacity ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">
                              Weight Limit
                            </p>
                            <p className="font-semibold">
                              {companyData.freightCapabilities?.weightLimit ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">
                              Insurance Status
                            </p>
                            <p className="font-semibold">
                              {companyData.freightCapabilities
                                ?.insuranceStatus || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600">
                              Cross-Border Capability
                            </p>
                            <p className="font-semibold">
                              {companyData.freightCapabilities
                                ?.crossBorderCapability ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <FaCheckCircle /> Yes
                                </span>
                              ) : (
                                "No"
                              )}
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
                  {/* <Button
                    variant="primary"
                    onClick={() => navigate("/company/tickets?add=true")}>
                    <div className="flex items-center gap-2">
                      <FaBus />
                      <span>Add New Trip</span>
                    </div>
                  </Button> */}
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
                                  from: trip.from || "",
                                  to: trip.to || "",
                                  transportType:
                                    trip.transportType || "inter-state",
                                  departureTime: trip.departureTime || "",
                                  departureDate: trip.departureDate || "",
                                  operatingDays: Array.isArray(
                                    trip.operatingDays,
                                  )
                                    ? trip.operatingDays
                                    : trip.operatingDays
                                      ? trip.operatingDays.split(",")
                                      : [],
                                  duration: trip.duration || "",
                                  price: trip.price,
                                  seats: trip.seats || 18,
                                  serviceCategory:
                                    trip.serviceCategory || "passenger",
                                  freightType: trip.freightType || "",
                                  vehicleType:
                                    trip.vehicleType || "Hiace Bus (18 seater)",
                                  terminal: trip.terminal || "",
                                  city: trip.city || "",
                                  state: trip.state || "",
                                  documentPrices: trip.documentPrices || {
                                    "Regular Passport": "",
                                    "Virgin Passport": "",
                                    NIN: "",
                                    "No Document": "",
                                  },
                                  vehicleName: trip.vehicleName || "",
                                  vehiclePlateNumber: trip.vehiclePlateNumber || "",
                                  toState: trip.toState || trip.to || "",
                                  timeWindowStart: trip.timeWindowStart || "",
                                  timeWindowEnd: trip.timeWindowEnd || "",
                                  minSeats: trip.minSeats || 1,
                                  depositAmount: trip.depositAmount || 0,
                                  cancellationWindow: trip.cancellationWindow || 12,
                                  confirmationWindow: trip.confirmationWindow || 2,
                                  driverContact: trip.driverContact || "",
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
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Service Category
                          </label>
                          <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="serviceCategory"
                                value="passenger"
                                checked={
                                  formData.serviceCategory === "passenger"
                                }
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
                            <option value="carpooling">
                              Carpooling (City-to-City)
                            </option>
                            <option value="inter-state">
                              Nigeria (State-to-State)
                            </option>
                            <option value="international">
                              International (West Africa)
                            </option>
                          </select>
                        </div>

                        {/* Vehicle Information - Standard across all trip types */}
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 mb-4">
                          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <FaCar className="text-primary" /> Vehicle
                            Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-2">
                                {formData.serviceCategory === "freight"
                                  ? "Carrier / Vehicle Type"
                                  : "Vehicle Category"}
                              </label>
                              {formData.serviceCategory === "freight" ? (
                                <select
                                  value={formData.vehicleType}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      vehicleType: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                  disabled={saving}>
                                  <option value="Mini Van">Mini Van</option>
                                  <option value="Delivery Van">
                                    Delivery Van
                                  </option>
                                  <option value="Box Truck">Box Truck</option>
                                  <option value="Heavy Duty Truck">
                                    Heavy Duty Truck
                                  </option>
                                  <option value="Refrigerated Truck">
                                    Refrigerated Truck
                                  </option>
                                </select>
                              ) : (
                                <select
                                  value={formData.vehicleType}
                                  onChange={(e) => {
                                    const vehicleType = e.target.value;
                                    let seats = formData.seats;
                                    if (vehicleType.includes("18 seater"))
                                      seats = 18;
                                    else if (vehicleType.includes("32 seater"))
                                      seats = 32;
                                    else if (vehicleType.includes("52 seater"))
                                      seats = 52;
                                    else if (
                                      vehicleType === "Mini Buses (7 seater)"
                                    )
                                      seats = 7;
                                    else if (
                                      vehicleType === "Sienna car (7 seats)"
                                    )
                                      seats = 7;
                                    else if (
                                      vehicleType === "Sedan (small car)"
                                    )
                                      seats = 4;
                                    setFormData({
                                      ...formData,
                                      vehicleType,
                                      seats,
                                    });
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
                                  <option value="Sedan (small car)">
                                    Sedan (small car)
                                  </option>
                                </select>
                              )}
                            </div>
                            <div>
                              <Input
                                label="Vehicle Name / Model"
                                type="text"
                                placeholder="e.g. Toyota Corolla, Nissan, Lexus 360"
                                value={formData.vehicleName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    vehicleName: e.target.value,
                                  })
                                }
                                disabled={saving}
                                required
                              />
                              <div>
                                <Input
                                  label="Vehicle Plate Number"
                                  type="text"
                                  placeholder="e.g. LAG-123-AB"
                                  value={formData.vehiclePlateNumber}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      vehiclePlateNumber: e.target.value,
                                    })
                                  }
                                  disabled={saving}
                                  required
                                />
                              </div>
                              <div className="md:col-span-2 mt-4">
                                <Input
                                  label="Driver Contact Number"
                                  type="text"
                                  placeholder="e.g. 08012345678"
                                  value={formData.driverContact}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      driverContact: e.target.value,
                                    })
                                  }
                                  disabled={saving}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                        {/* FROM/TO LOCATION */}
                        {formData.transportType === "carpooling" ? (
                          <>
                            {/* Single State Selection for city-to-city trips */}
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-2">
                                State (for carpooling trip)
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
                                {locationOptions?.map((state) => (
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
                                    setFormData({
                                      ...formData,
                                      from: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                  required
                                  disabled={saving}>
                                  <option value="">
                                    Select departure city
                                  </option>
                                  {fromCities?.map((city) => (
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
                                    setFormData({
                                      ...formData,
                                      to: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                  required
                                  disabled={saving}>
                                  <option value="">
                                    Select destination city
                                  </option>
                                  {fromCities?.map((city) => (
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
                                  setFormData({
                                    ...formData,
                                    state: e.target.value,
                                    from: "",
                                  })
                                }
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                disabled={saving}>
                                <option value="">Select departure state</option>
                                {locationOptions?.map((state) => (
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
                                    setFormData({
                                      ...formData,
                                      from: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                  required
                                  disabled={saving}>
                                  <option value="">
                                    Select departure city
                                  </option>
                                  {fromCities?.map((city) => (
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
                                  setFormData({
                                    ...formData,
                                    toState: e.target.value,
                                    to: "",
                                  })
                                }
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                disabled={saving}>
                                <option value="">
                                  Select destination state
                                </option>
                                {locationOptions?.map((state) => (
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
                                    setFormData({
                                      ...formData,
                                      to: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                  required
                                  disabled={saving}>
                                  <option value="">
                                    Select destination city
                                  </option>
                                  {toCities?.map((city) => (
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
                                  setFormData({
                                    ...formData,
                                    from: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                disabled={saving}>
                                <option value="">
                                  Select departure country
                                </option>
                                {locationOptions?.map((location) => (
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
                                  setFormData({
                                    ...formData,
                                    to: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                disabled={saving}>
                                <option value="">
                                  Select destination country
                                </option>
                                {locationOptions?.map((location) => (
                                  <option key={location} value={location}>
                                    {location}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
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
                                setFormData({
                                  ...formData,
                                  terminal: e.target.value,
                                })
                              }
                              disabled={saving}
                            />
                          </div>

                          <div className="flex flex-col justify-end">
                            <MaterialTimePicker
                              label="Departure Time"
                              value={formData.departureTime}
                              onChange={(timeStr) =>
                                setFormData({
                                  ...formData,
                                  departureTime: timeStr,
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>

                        {formData.transportType === "international" && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Terminal City
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter city name"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  city: e.target.value,
                                })
                              }
                              disabled={saving}
                            />
                          </div>
                        )}

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
                                const month = String(
                                  date.getMonth() + 1,
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0",
                                );
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
                                    checked={formData.operatingDays.includes(
                                      day,
                                    )}
                                    disabled={saving || formData.departureDate}
                                    onChange={(e) => {
                                      const newDays = e.target.checked
                                        ? [...formData.operatingDays, day]
                                        : formData.operatingDays.filter(
                                            (d) => d !== day,
                                          );
                                      setFormData({
                                        ...formData,
                                        operatingDays: newDays,
                                        departureDate: "",
                                      });
                                    }}
                                  />
                                  <span className="text-sm">
                                    {day.substring(0, 3)}
                                  </span>
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
                            setFormData({
                              ...formData,
                              duration: e.target.value,
                            })
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
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
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
                              setFormData({
                                ...formData,
                                seats: e.target.value,
                              })
                            }
                            required
                            disabled={saving}
                          />
                        </div>

                        {/* Price Summary Breakdown */}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-700">
                              Standard Ticket Price
                            </span>
                            <span className="font-semibold text-blue-900">
                              ₦{Number(formData.price || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-700">
                              Service Fee (5%)
                            </span>
                            <span className="font-semibold text-blue-900">
                              ₦
                              {calculateServiceFee(
                                Number(formData.price || 0),
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-700">VAT (7.5%)</span>
                            <span className="font-semibold text-blue-900">
                              ₦
                              {calculateVAT(
                                calculateServiceFee(
                                  Number(formData.price || 0),
                                ),
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                            <span className="font-bold text-blue-900">
                              Total Customer Pays
                            </span>
                            <span className="font-bold text-primary text-lg">
                              ₦
                              {(
                                Number(formData.price || 0) +
                                calculateServiceFee(
                                  Number(formData.price || 0),
                                ) +
                                calculateVAT(
                                  calculateServiceFee(
                                    Number(formData.price || 0),
                                  ),
                                )
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {formData.serviceCategory === "freight" && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Freight Type
                            </label>
                            <select
                              value={formData.freightType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  freightType: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              disabled={saving}
                              required>
                              <option value="">Select Freight Type</option>
                              <option value="Small Parcel">Small Parcel</option>
                              <option value="Medium Cargo">Medium Cargo</option>
                              <option value="Large/Bulk Cargo">
                                Large/Bulk Cargo
                              </option>
                            </select>
                          </div>
                        )}

                        {formData.transportType === "carpooling" && (
                          <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-semibold text-primary">
                              Carpooling Specifics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Time Window Start"
                                type="time"
                                value={formData.timeWindowStart}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    timeWindowStart: e.target.value,
                                  })
                                }
                                disabled={saving}
                              />
                              <Input
                                label="Time Window End"
                                type="time"
                                value={formData.timeWindowEnd}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    timeWindowEnd: e.target.value,
                                  })
                                }
                                disabled={saving}
                              />
                            </div>
                            <Input
                              label="Min Seats for Departure"
                              type="number"
                              value={formData.minSeats}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  minSeats: e.target.value,
                                })
                              }
                              disabled={saving}
                            />

                            <div className="grid grid-cols-3 gap-4">
                              <Input
                                label="Deposit (₦)"
                                type="number"
                                value={formData.depositAmount}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    depositAmount: e.target.value,
                                  })
                                }
                                disabled={saving}
                              />
                              <Input
                                label="Cancel Window (hrs)"
                                type="number"
                                value={formData.cancellationWindow}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    cancellationWindow: e.target.value,
                                  })
                                }
                                disabled={saving}
                              />
                              <Input
                                label="Confirm Window (hrs)"
                                type="number"
                                value={formData.confirmationWindow}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    confirmationWindow: e.target.value,
                                  })
                                }
                                disabled={saving}
                              />
                            </div>
                          </div>
                        )}

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
                                value={
                                  formData.documentPrices["Regular Passport"]
                                }
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
                                value={
                                  formData.documentPrices["Virgin Passport"]
                                }
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

                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setShowModal(false)}
                            disabled={saving}>
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={saving}>
                            {saving ? (
                              <div className="flex items-center gap-2">
                                <FaSpinner className="animate-spin" />
                                <span>Saving...</span>
                              </div>
                            ) : editingTrip ? (
                              "Save Changes"
                            ) : (
                              "Create Trip"
                            )}
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
              <DocumentsTab user={user} onRefresh={fetchProfile} />
            )}

            {/* Passengers Tab */}
            {activeTab === "passengers" && <PassengersTab />}

            {/* Shipments Tab */}
            {activeTab === "shipments" && <ShipmentsTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompanyProfile;
