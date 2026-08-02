import React, { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Input from "../../components/Input";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import VisualShowcase from "../../components/VisualShowcase";

const SignIn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const redirectPath = searchParams.get("redirect");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
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

    // Validate fields
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);

      // Call backend API
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      // Save token (session storage clears on tab close)
      sessionStorage.setItem("token", response.data.token);

      // Update auth context
      login(response.data.user);

      // Show success message
      toast.success(
        `Welcome back, ${
          response.data.user.name || response.data.user.email.split("@")[0]
        }!`,
      );

      // Redirect based on role or URL param/state
      const from = location.state?.from;

      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else if (from) {
        navigate(from);
      } else if (redirectPath) {
        navigate(redirectPath);
      } else if (response.data.user.role === "company") {
        navigate("/company/tickets");
      } else {
        navigate("/search");
      }
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);

      if (message.toLowerCase().includes("verify your email")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      await authAPI.resendVerification(formData.email);
      toast.success("Verification email sent! Please check your inbox.");
      setShowResend(false); // Hide button after success
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend verification email.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col premium-gradient-bg">
      <Navbar variant="desktop" />

      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-2xl shadow-premium border border-white/50 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Form */}
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl sm:text-4xl font-raleway font-black text-charcoal mb-2">
              Hello! Welcome Back
            </h1>
            <p className="text-sm text-neutral-500 mb-8 font-medium">
              Access your account to book and manage your trips
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="E.g. passenger@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary/20 accent-primary"
                  />
                  <span className="ml-2 text-xs font-semibold text-neutral-600">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3.5 rounded-button font-bold text-sm hover:bg-primary-dark hover:-translate-y-0.5 shadow-md hover:shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full bg-blue-50 text-blue-700 py-3 rounded-button font-semibold text-sm hover:bg-blue-100/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 border border-blue-200/50">
                  {resendLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              )}
            </form>

            <p className="mt-8 text-center text-xs font-medium text-neutral-500">
              New to VadTrans?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-primary-dark font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          {/* Right side - Visual Illustration */}
          <div className="hidden lg:block h-[500px]">
            <VisualShowcase mode="traveler" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
