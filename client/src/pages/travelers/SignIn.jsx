import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Input from "../../components/Input";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
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

      // Save token
      localStorage.setItem("token", response.data.token);

      // Update auth context
      login(response.data.user);

      // Show success message
      toast.success(
        `Welcome back, ${
          response.data.user.name || response.data.user.email.split("@")[0]
        }!`
      );

      // Redirect based on role
      if (response.data.user.role === "admin") {
        navigate("/admin");
      } else if (response.data.user.role === "company") {
        navigate("/company/tickets");
      } else {
        navigate("/search");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Form */}
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
                    <FaSpinner className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Phone mockup illustration */}
              <div className="w-96 h-auto">
                <svg viewBox="0 0 400 600" className="w-full h-auto">
                  {/* Phone frame */}
                  <rect
                    x="50"
                    y="20"
                    width="300"
                    height="560"
                    rx="30"
                    fill="#f5f5f5"
                    stroke="#e0e0e0"
                    strokeWidth="2"
                  />

                  {/* Screen */}
                  <rect
                    x="70"
                    y="50"
                    width="260"
                    height="500"
                    rx="10"
                    fill="white"
                  />

                  {/* Sign in text */}
                  <text
                    x="200"
                    y="120"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#333">
                    Sign in
                  </text>

                  {/* Input fields representation */}
                  <rect
                    x="100"
                    y="150"
                    width="200"
                    height="40"
                    rx="5"
                    fill="#f0f0f0"
                  />
                  <rect
                    x="100"
                    y="210"
                    width="200"
                    height="40"
                    rx="5"
                    fill="#f0f0f0"
                  />

                  {/* Sign in button */}
                  <rect
                    x="100"
                    y="280"
                    width="200"
                    height="45"
                    rx="8"
                    fill="#FF3D3D"
                  />
                </svg>

                {/* Person illustration */}
                <div className="absolute bottom-0 right-0">
                  <svg viewBox="0 0 200 300" className="w-48 h-auto">
                    {/* Person sitting */}
                    <ellipse cx="100" cy="80" rx="30" ry="35" fill="#4A4A4A" />
                    <rect
                      x="70"
                      y="110"
                      width="60"
                      height="80"
                      rx="10"
                      fill="#5A5A5A"
                    />
                    <ellipse cx="100" cy="250" rx="40" ry="15" fill="#FFB4B4" />
                  </svg>
                </div>
              </div>

              {/* Decorative plants */}
              <div className="absolute -left-20 bottom-32">
                <svg viewBox="0 0 80 120" className="w-20 h-auto">
                  <ellipse cx="40" cy="110" rx="30" ry="10" fill="#FF6B6B" />
                  <rect x="35" y="60" width="10" height="50" fill="#2D4A3E" />
                  <path
                    d="M 40 60 Q 25 40 30 20"
                    stroke="#2D4A3E"
                    strokeWidth="8"
                    fill="none"
                  />
                  <path
                    d="M 40 60 Q 55 40 50 20"
                    stroke="#2D4A3E"
                    strokeWidth="8"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
