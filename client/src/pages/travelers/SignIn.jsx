import React, { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import { FaEnvelope, FaLock } from "react-icons/fa";

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
      const userName = response.data.user?.name || response.data.user?.email?.split("@")[0] || "User";
      toast.success(`Welcome back, ${userName}!`);

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

  console.log("SignIn Component Rendering...");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-raleway font-bold text-charcoal mb-8">
            Hello! Welcome Back
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-charcoal">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-charcoal hover:text-primary">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loading size="xs" />
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
                className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
                {resendLoading ? (
                  <>
                    <Loading size="xs" />
                    Sending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-neutral-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
