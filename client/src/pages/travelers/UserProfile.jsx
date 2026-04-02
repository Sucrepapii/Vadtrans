import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaTicketAlt,
  FaChevronRight,
  FaCamera,
  FaEllipsisV,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import CompanyProfile from "../company/CompanyProfile";
import { nigerianStates } from "../../data/locations";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    city: "",
    avatar: null,
    isVerified: false,
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      const userData = response.data.user;

      setProfileData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        title: userData.title || "",
        gender: userData.gender || "",
        dateOfBirth: userData.dateOfBirth || "",
        phone: userData.phone || "",
        email: userData.email || "",
        address: userData.address || "",
        state: userData.state || "",
        city: userData.city || "",
        avatar: userData.avatar || null,
        isVerified: userData.isVerified || false,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Create full name from firstName and lastName
      const fullName =
        `${profileData.firstName} ${profileData.lastName}`.trim();

      const updateData = {
        ...profileData,
        name: fullName,
      };

      const response = await authAPI.updateProfile(updateData);

      // Update local auth context
      if (updateUser) {
        updateUser(response.data.user);
      }

      toast.success("Profile updated successfully!");
      setIsEditMode(false);
      await fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        toast.error(
          `Image size (${fileSizeMB}MB) exceeds the maximum allowed size of 2MB. Please choose a smaller image.`,
          { autoClose: 5000 },
        );
        // Reset the file input
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, "/");
  };

  // If user is a company, show CompanyProfile instead
  if (authUser?.role === "company") {
    return <CompanyProfile />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar variant="desktop" />

        <div className="flex-1 py-8 px-4">
          <div className="container-custom max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setIsEditMode(false)}
                className="text-2xl hover:text-primary transition-colors"
                disabled={saving}>
                <FaArrowLeft />
              </button>
              <h1 className="text-3xl font-raleway font-bold text-charcoal">
                Edit Profile
              </h1>
            </div>

            {/* Edit Form */}
            <form
              onSubmit={handleSave}
              className="bg-white rounded-lg p-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile Photo */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-48 h-48 rounded-full overflow-hidden bg-neutral-200">
                      {profileData.avatar ? (
                        <img
                          src={profileData.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-white text-6xl font-bold">
                          {profileData.firstName?.[0] || "U"}
                          {profileData.lastName?.[0] || "U"}
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="photo"
                      className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary-dark transition-colors">
                      <FaCamera />
                    </label>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={saving}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 mb-1">
                      Click the camera icon to edit photo
                    </p>
                    <p className="text-xs text-neutral-500">
                      Maximum file size: 2MB
                    </p>
                  </div>
                </div>

                {/* Right: Form Fields */}
                <div className="lg:col-span-2">
                  {/* First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        required
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Gender, Title, Date of Birth */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Gender
                      </label>
                      <div className="flex gap-4 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={profileData.gender === "male"}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary"
                            disabled={saving}
                          />
                          <span className="text-sm">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={profileData.gender === "female"}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary"
                            disabled={saving}
                          />
                          <span className="text-sm">Female</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Title
                      </label>
                      <select
                        name="title"
                        value={profileData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        disabled={saving}>
                        <option value="">Select</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Mobile Number and Email */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        placeholder="+234-800-000-0000"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-neutral-100 cursor-not-allowed"
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>

                  {/* Address and City */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary mt-2"
                        placeholder="Enter City"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* State Field */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      State
                    </label>
                    <select
                      name="state"
                      value={profileData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                      disabled={saving}>
                      <option value="">Select State</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-12 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // View Mode
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl hover:text-primary transition-colors">
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-raleway font-bold text-charcoal">
              Your Profile
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Profile Card */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm relative">
              {/* More Options Menu */}
              <button
                onClick={() => setIsEditMode(true)}
                className="absolute top-6 right-6 text-neutral-500 hover:text-primary">
                <FaEllipsisV />
              </button>

              {/* Profile Photo and Name */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary flex-shrink-0">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.firstName?.[0] || "U"}
                      {profileData.lastName?.[0] || "U"}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-charcoal">
                  {profileData.title && `${profileData.title} `}
                  {profileData.firstName} {profileData.lastName}
                  {profileData.isVerified && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  )}
                </h2>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="font-semibold text-charcoal mb-4">
                  Contact Details:
                </h3>
                <div className="space-y-4">
                  {profileData.phone && (
                    <div className="flex items-center gap-3 text-neutral-700">
                      <FaPhone className="text-primary" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-neutral-700">
                    <FaEnvelope className="text-primary" />
                    <span>{profileData.email}</span>
                  </div>
                  {profileData.address && (
                    <div className="flex items-start gap-3 text-neutral-700">
                      <FaHome className="text-primary mt-1" />
                      <span>
                        {profileData.address}
                        {profileData.city && `, ${profileData.city}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-6">
              {/* Bio Card */}
              <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-semibold text-charcoal mb-4">
                  Bio
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {profileData.gender && (
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Gender:</p>
                      <p className="font-semibold text-charcoal capitalize">
                        {profileData.gender}
                      </p>
                    </div>
                  )}
                  {profileData.dateOfBirth && (
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        Date of Birth:
                      </p>
                      <p className="font-semibold text-charcoal">
                        {formatDate(profileData.dateOfBirth)}
                      </p>
                    </div>
                  )}
                  {profileData.city && (
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">City:</p>
                      <p className="font-semibold text-charcoal">
                        {profileData.city}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tickets Button */}
              <button
                onClick={() => navigate("/my-bookings")}
                className="w-full bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <FaTicketAlt className="text-white text-xl" />
                  </div>
                  <span className="text-lg font-semibold text-charcoal">
                    Tickets
                  </span>
                </div>
                <FaChevronRight className="text-neutral-400 group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
