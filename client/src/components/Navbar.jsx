import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaSearch,
} from "react-icons/fa";
import Button from "./Button";

const Navbar = ({ variant = "desktop" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  // Desktop navbar with top contact bar
  if (variant === "desktop") {
    return (
      <nav>
        {/* Top contact bar - Hidden on mobile */}
        <div className="hidden md:block bg-black text-white py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <a
                href="tel:+234-812-945-0899"
                className="flex items-center gap-2 hover:text-primary transition-colors">
                <FaPhone className="text-xs" />
                <span>+234-812-945-0899</span>
              </a>
              <a
                href="mailto:contact@vadtrans.com.ng"
                className="flex items-center gap-2 hover:text-primary transition-colors">
                <FaEnvelope className="text-xs" />
                <span>contact@vadtrans.com.ng</span>
              </a>
            </div>
            <button className="px-3 sm:px-4 py-1 border border-white rounded-full text-xs sm:text-sm hover:bg-white hover:text-black transition-colors">
              Follow Us
            </button>
          </div>
        </div>

        {/* Main navbar */}
        <div className="bg-white border-b">
          <div className="container-custom">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-xl sm:text-2xl font-raleway font-bold text-primary">
                  VadTrans
                </span>
                <span className="ml-1 text-2xl">🚐</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <Link
                  to="/"
                  className="text-charcoal hover:text-primary transition-colors font-medium">
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-charcoal hover:text-primary transition-colors font-medium">
                  About Us
                </Link>
                <Link
                  to="/tracking"
                  className="text-charcoal hover:text-primary transition-colors font-medium">
                  Tracking
                </Link>
                <Link
                  to="/help"
                  className="text-charcoal hover:text-primary transition-colors font-medium">
                  Contact Us
                </Link>
                <Link
                  to="/company/register"
                  className="text-charcoal hover:text-primary transition-colors font-medium">
                  List Your Company
                </Link>
              </div>

              {/* Right side buttons */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:text-primary transition-colors">
                      <FaUser />
                      <span>{user?.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-charcoal text-white rounded hover:bg-charcoal/90 transition-colors">
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      className="px-6 py-2 bg-black text-white rounded hover:bg-black/90 transition-colors">
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors">
                      Sign Up
                    </Link>
                  </>
                )}

                <button className="p-2 hover:text-primary transition-colors">
                  <FaSearch size={20} />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-charcoal focus:outline-none">
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b">
            <div className="container-custom py-4 space-y-3">
              <Link
                to="/"
                className="block py-2 hover:text-primary transition-colors">
                Home
              </Link>
              <Link
                to="/about"
                className="block py-2 hover:text-primary transition-colors">
                About Us
              </Link>
              <Link
                to="/tracking"
                className="block py-2 hover:text-primary transition-colors">
                Tracking
              </Link>
              <Link
                to="/help"
                className="block py-2 hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link
                to="/company/register"
                className="block py-2 hover:text-primary transition-colors">
                List Your Company
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block py-2 hover:text-primary transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 hover:text-primary transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="block py-2 hover:text-primary transition-colors">
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="block py-2 hover:text-primary transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Mobile variant (existing)
  return (
    <nav className="bg-charcoal text-white">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-raleway font-bold">
            Vadtrans
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="pb-4 space-y-2">
            <Link
              to="/"
              className="block py-2 hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              to="/about"
              className="block py-2 hover:text-primary transition-colors">
              About
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 hover:text-primary transition-colors">
                  Profile ({user?.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 hover:text-primary transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="block py-2 hover:text-primary transition-colors">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
