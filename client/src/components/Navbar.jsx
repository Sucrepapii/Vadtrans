import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaSearch,
  FaWhatsapp,
  FaBus,
} from "react-icons/fa";
import Button from "./Button";

const Navbar = ({ variant = "desktop", portalLabel }) => {
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
                href="tel:+234-912-328-4931"
                className="flex items-center gap-2 hover:text-primary transition-colors">
                <FaWhatsapp className="text-xs" />
                <span>+234-912-328-4931</span>
              </a>
              <a
                href="mailto:Support@vadtrans.com"
                className="flex items-center gap-2 hover:text-primary transition-colors">
                <FaEnvelope className="text-xs" />
                <span>Support@vadtrans.com</span>
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
            <div className="flex items-center justify-between h-24 md:h-32">
              {/* Logo */}
              <Link to="/" className="flex flex-col items-start px-2">
                <div className="flex items-center gap-2 group">
                  <div className="flex flex-col justify-center">
                    <img
                      src={
                        user?.role === "company"
                          ? "/logo_transport.png"
                          : "/logo_traveller.png"
                      }
                      alt="VadTrans"
                      className="h-10 md:h-14 w-auto object-contain transition-all"
                    />
                    {portalLabel && (
                      <div className="ml-3">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-widest border border-neutral-200 leading-none">
                          {portalLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-bold transition-colors"
                      : "text-charcoal hover:text-primary transition-colors font-medium "
                  }>
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-bold transition-colors"
                      : "text-charcoal hover:text-primary transition-colors font-medium"
                  }>
                  About Us
                </NavLink>
                <NavLink
                  to="/freight"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-bold transition-colors"
                      : "text-charcoal hover:text-primary transition-colors font-medium"
                  }>
                  Freight
                </NavLink>
                {user?.role === "company" ? (
                  <NavLink
                    to="/company/driver-console"
                    className={({ isActive }) =>
                      isActive
                        ? "text-primary font-bold transition-colors"
                        : "text-charcoal hover:text-primary transition-colors font-medium"
                    }>
                    Driver Console
                  </NavLink>
                ) : (
                  <NavLink
                    to="/tracking"
                    className={({ isActive }) =>
                      isActive
                        ? "text-primary font-bold transition-colors"
                        : "text-charcoal hover:text-primary transition-colors font-medium"
                    }>
                    Tracking
                  </NavLink>
                )}
                <NavLink
                  to="/search?transportType=carpooling"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-bold transition-colors"
                      : "text-charcoal hover:text-primary transition-colors font-medium"
                  }>
                  Carpool
                </NavLink>
                {user?.role === "company" && (
                  <NavLink
                    to="/offer-ride"
                    className={({ isActive }) =>
                      isActive
                        ? "text-primary font-bold transition-colors"
                        : "text-charcoal hover:text-primary transition-colors font-medium"
                    }>
                    Offer a Ride
                  </NavLink>
                )}
                <NavLink
                  to="/signup?role=company"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-bold transition-colors"
                      : "text-charcoal hover:text-primary transition-colors font-medium"
                  }>
                  List Your Company
                </NavLink>
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

                <button
                  onClick={() => navigate("/search")}
                  className="p-2 hover:text-primary transition-colors">
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
                to="/freight"
                className="block py-2 hover:text-primary transition-colors">
                Freight
              </Link>
              {user?.role === "company" ? (
                <Link
                  to="/company/driver-console"
                  className="block py-2 hover:text-primary transition-colors">
                  Driver Console
                </Link>
              ) : (
                <Link
                  to="/tracking"
                  className="block py-2 hover:text-primary transition-colors">
                  Tracking
                </Link>
              )}
              <Link
                to="/search?transportType=carpooling"
                className="block py-2 hover:text-primary transition-colors">
                Carpool
              </Link>
              <Link
                to="/signup?role=company"
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

              {/* Mobile Contact Info */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Contact Support
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+234-912-328-4931"
                    className="flex items-center gap-3 text-charcoal hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <FaWhatsapp size={14} />
                    </div>
                    <span className="font-medium text-sm">
                      +234-912-328-4931
                    </span>
                  </a>
                  <a
                    href="mailto:Support@vadtrans.com"
                    className="flex items-center gap-3 text-charcoal hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <FaEnvelope size={14} />
                    </div>
                    <span className="font-medium text-sm">
                      Support@vadtrans.com
                    </span>
                  </a>
                </div>
              </div>
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
          <Link to="/" className="flex items-center gap-2">
            <img
              src={
                user?.role === "company"
                  ? "/logo_transport_white.png"
                  : "/logo_traveller_white.png"
              }
              alt="VadTrans"
              className="h-10 w-auto object-contain"
            />
            {portalLabel && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-black text-white/80 uppercase tracking-widest border border-white/10 ml-2">
                {portalLabel}
              </span>
            )}
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
            <Link
              to="/freight"
              className="block py-2 hover:text-primary transition-colors">
              Freight
            </Link>
            <Link
              to="/search?transportType=carpooling"
              className="block py-2 hover:text-primary transition-colors">
              Carpool
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
