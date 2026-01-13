import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FaSpinner } from "react-icons/fa";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("traveler"); // 'traveler' or 'company'
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and privacy policy");
      return;
    }

    try {
      setLoading(true);

      // Call backend API
      const response = await authAPI.signup({
        name: userType === "company" ? formData.companyName : formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType, // Send the role (traveler or company)
      });

      // Save token
      localStorage.setItem("token", response.data.token);

      // Update auth context
      login(response.data.user);

      // Debug: Log what we received
      console.log("Signup response role:", response.data.user.role);

      // Show success message
      toast.success(`Welcome to VadTrans, ${response.data.user.name}! 🎉`);

      // Redirect based on role FROM BACKEND (not frontend state)
      const userRole = response.data.user.role;
      if (userRole === "company") {
        navigate("/company/tickets");
      } else {
        navigate("/search");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-raleway font-bold text-charcoal mb-2">
            Sign Up
          </h1>
          <p className="text-neutral-600 mb-6">
            Create your account to start booking
          </p>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUserType("traveler")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                userType === "traveler"
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:text-charcoal"
              }`}>
              travelers
            </button>
            <button
              type="button"
              onClick={() => setUserType("company")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                userType === "company"
                  ? "bg-primary text-white"
                  : "text-neutral-600 hover:text-charcoal"
              }`}>
              Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conditional Fields based on User Type */}
            {userType === "traveler" ? (
              <>
                {/* traveler Fields */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+234-800-000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Company Fields */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Transport Company Ltd"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary mt-1"
              />
              <label className="ml-2 text-sm text-charcoal">
                I agree to{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-primary hover:underline font-medium">
              Sign-In
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUp;
