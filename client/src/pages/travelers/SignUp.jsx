import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Input from "../../components/Input";
import { FaSpinner } from "react-icons/fa";
import VisualShowcase from "../../components/VisualShowcase";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New state for success message

  // Get redirect path and preset role from URL
  const redirectPath = searchParams.get("redirect");
  const presetRole = searchParams.get("role");

  const [userType, setUserType] = useState(presetRole || "traveler"); // 'traveler' or 'company'
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

      // Show success message state instead of auto-redirect
      setIsSuccess(true);
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
    <div className="min-h-screen flex flex-col premium-gradient-bg">
      <Navbar variant="desktop" />

      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-2xl shadow-premium border border-white/50 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-raleway font-black text-charcoal mb-2">
                Create Your Account
              </h1>
              <p className="text-sm text-neutral-500 font-medium">
                Start booking affordable carpools and managing routes
              </p>
            </div>

          {isSuccess ? (
            <div className="bg-green-50/50 border border-green-200/50 p-8 rounded-premium text-center">
              <div className="w-16 h-16 bg-green-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">
                Check Your Email!
              </h2>
              <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                We've sent a verification link to{" "}
                <strong>{formData.email}</strong>.
                <br />
                Please verify your email to activate your account and book
                trips.
              </p>
              <Link
                to="/signin"
                className="inline-block bg-primary text-white px-6 py-2.5 rounded-button font-bold text-xs hover:bg-primary-dark shadow-md hover:shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-200">
                Back to Sign In
              </Link>

              <div className="mt-6 pt-6 border-t border-green-200/20">
                <p className="text-xs text-neutral-500 mb-2">
                  Didn't receive the email?
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await authAPI.resendVerification(formData.email);
                      toast.success("Verification email resent!");
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message ||
                          "Failed to resend email"
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="text-primary hover:underline text-xs font-bold disabled:opacity-50">
                  {loading ? "Sending..." : "Resend Verification Email"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* User Type Toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserType("traveler")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${
                    userType === "traveler"
                      ? "bg-white text-primary shadow-sm"
                      : "text-neutral-500 hover:text-charcoal"
                  }`}>
                  Passenger
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("company")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${
                    userType === "company"
                      ? "bg-white text-primary shadow-sm"
                      : "text-neutral-500 hover:text-charcoal"
                  }`}>
                  Driver / Partner
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Conditional Fields based on User Type */}
                {userType === "traveler" ? (
                  <>
                    <Input
                      label="Full Name"
                      name="name"
                      placeholder="E.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      placeholder="E.g. +234-800-000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="Company Name"
                      name="companyName"
                      placeholder="E.g. Transport Logistics Ltd"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </>
                )}

                {/* Common Fields */}
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="E.g. member@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <div className="flex items-start py-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary/20 mt-0.5 accent-primary cursor-pointer"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-xs font-semibold text-neutral-600 cursor-pointer select-none">
                    I agree to{" "}
                    <Link to="/terms" className="text-primary hover:text-primary-dark font-bold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:text-primary-dark font-bold hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-button font-bold text-sm hover:bg-primary-dark hover:-translate-y-0.5 shadow-md hover:shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
            </>
          )}

          {!isSuccess && (
            <p className="mt-8 text-center text-xs font-medium text-neutral-500">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-primary hover:text-primary-dark font-bold hover:underline">
                Sign In
              </Link>
            </p>
          )}
          </div>

          {/* Right side - Visual Illustration */}
          <div className="hidden lg:block h-[540px]">
            <VisualShowcase mode="partner" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUp;
