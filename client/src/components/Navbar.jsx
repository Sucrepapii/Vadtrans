import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaSearch,
  FaWhatsapp,
  FaBus,
  FaBell,
} from "react-icons/fa";
import Button from "./Button";
import BrandLogo from "./BrandLogo";

const Navbar = ({ variant = "desktop", portalLabel }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [privateRequests, setPrivateRequests] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const fetchPrivateRequests = async () => {
    try {
      const res = await api.get("/private-rides");
      const active = res.data.requests?.filter(r => !['completed', 'cancelled'].includes(r.status)) || [];
      setPrivateRequests(active);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    let interval;
    if (isAuthenticated && user?.role !== "company") {
      fetchPrivateRequests();
      interval = setInterval(fetchPrivateRequests, 10000); // Poll every 10s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, user]);

  const awaitingPaymentRide = privateRequests.find(r => r.status === "awaiting_payment");

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  // Desktop navbar with top contact bar
  if (variant === "desktop") {
    return (
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-neutral-200/50 shadow-premium">
        {/* Sticky Alert Banner for pending bids */}
        {awaitingPaymentRide && (
          <div 
            onClick={() => navigate('/request-private-ride')}
            className="bg-primary text-white py-2 px-4 text-center text-sm font-bold flex justify-center items-center gap-2 cursor-pointer hover:bg-primary-dark transition-colors"
          >
            <span className="animate-ping text-lg">🚨</span> 
            A driver has placed a bid on your Private Ride request! Click here to view and accept.
          </div>
        )}
        
        {/* Top contact bar - Hidden on mobile */}
        <div className="hidden md:block bg-charcoal text-white/80 py-1.5 border-b border-charcoal-light/10 text-xs">
          <div className="container-custom flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-6">
              <a
                href="tel:+234-912-328-4931"
                className="flex items-center gap-2 hover:text-primary transition-colors">
                <FaWhatsapp className="text-xs text-green-500" />
                <span>+234-912-328-4931</span>
              </a>
              <a
                href="mailto:Support@vadtrans.com"
                className="flex items-center gap-2 hover:text-primary transition-colors">
                <FaEnvelope className="text-xs" />
                <span>Support@vadtrans.com</span>
              </a>
            </div>
            <button className="px-3 py-0.5 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors font-medium">
              Follow Us
            </button>
          </div>
        </div>

        {/* Main navbar */}
        <div className="bg-white/80 backdrop-blur-md">
          <div className="container-custom">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <Link to="/" className="flex flex-col items-start">
                <div className="flex items-center gap-2 group">
                  <div className="flex flex-col justify-center">
                    <BrandLogo 
                      className="h-10 md:h-12" 
                    />

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
                    {/* Notification Bell */}
                    {user?.role !== "company" && (
                      <div className="relative">
                        <button 
                          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                          className="p-2 text-charcoal hover:text-primary transition-colors relative"
                        >
                          <FaBell size={20} />
                          {privateRequests.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>
                          )}
                        </button>

                        {isNotificationsOpen && (
                          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                              <h3 className="font-bold text-charcoal">Active Requests</h3>
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{privateRequests.length}</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {privateRequests.length === 0 ? (
                                <div className="p-6 text-center text-neutral-500 text-sm">No active private ride requests.</div>
                              ) : (
                                privateRequests.map(req => (
                                  <div 
                                    key={req.id} 
                                    onClick={() => {
                                      setIsNotificationsOpen(false);
                                      if (["driver_assigned", "en_route", "arrived", "started"].includes(req.status)) {
                                        navigate('/tracking', { state: { bookingId: req.requestId } });
                                      } else {
                                        navigate('/request-private-ride');
                                      }
                                    }}
                                    className="p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-bold text-primary uppercase">{req.rideType.replace('-', ' ')}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${req.status === 'awaiting_payment' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {req.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <p className="text-sm font-semibold text-charcoal truncate">{req.pickupLocation} → {req.destination}</p>
                                    {req.status === 'awaiting_payment' && (
                                      <p className="text-xs text-amber-600 font-bold mt-1">Driver bid received! Click to pay.</p>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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
                      className="px-5 py-2 bg-neutral-100 text-charcoal rounded-button hover:bg-neutral-200 transition-colors text-sm font-semibold">
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-5 py-2 bg-primary text-white rounded-button hover:bg-primary-dark hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold">
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
    <nav className="bg-charcoal text-white sticky top-0 z-50 w-full shadow-md">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo 
              variant="white" 
              className="h-10" 
            />

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
