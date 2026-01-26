import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaDollarSign,
  FaTicketAlt,
  FaCalendarCheck,
  FaQuestionCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/admin" },
    { icon: FaUsers, label: "Clients", path: "/admin/clients" },
    { icon: FaBuilding, label: "Companies", path: "/admin/companies" },
    { icon: FaTicketAlt, label: "Tickets", path: "/admin/tickets" },
    { icon: FaCalendarCheck, label: "Bookings", path: "/admin/bookings" },
    { icon: FaDollarSign, label: "Fares", path: "/admin/fares" },
    { icon: FaQuestionCircle, label: "FAQs", path: "/admin/faqs" },
  ];

  const handleLogout = () => {
    logout();
    toast.info("Admin logged out successfully");
    navigate("/signin");
  };

  const handlePortalAccess = (path) => {
    logout();
    toast.info("Logged out from admin panel");
    navigate(path);
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible only on mobile when closed) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-charcoal text-white rounded-lg shadow-lg">
        <FaBars size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`bg-charcoal text-white h-screen fixed md:sticky top-0 transition-transform duration-300 flex flex-col shadow-2xl z-50 
        ${isCollapsed ? "md:w-20" : "md:w-64"} 
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <FaTachometerAlt className="text-sm text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-raleway font-bold text-white leading-none">
                  Vad<span className="text-primary">Trans</span>
                </h1>
                <span className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase block mt-1">
                  Admin Portal
                </span>
              </div>
            </div>
          )}

          {/* Collapse Button (Desktop) / Close Button (Mobile) */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileOpen(false);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className={`text-neutral-400 hover:text-white transition-colors ${
              isCollapsed && !isMobileOpen ? "mx-auto" : ""
            }`}>
            {isMobileOpen ? (
              <FaTimes size={18} />
            ) : isCollapsed ? (
              <FaBars size={20} />
            ) : (
              <FaTimes size={18} />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showLabel = !isCollapsed || isMobileOpen;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)} // Close on mobile navigation
                className={`relative flex items-center gap-4 px-6 py-3 transition-all duration-300 group ${
                  isActive
                    ? "text-primary bg-gradient-to-r from-primary/10 to-transparent border-r-4 border-primary"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? "text-primary" : "group-hover:text-white"
                  }`}
                />
                {showLabel && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Navigation */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-6 py-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Switch Portal
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handlePortalAccess("/")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-all border border-transparent hover:border-white/10">
                <span>Traveler</span>
                <span className="text-xs">↗</span>
              </button>
              <button
                onClick={() => handlePortalAccess("/company/tickets")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-all border border-transparent hover:border-white/10">
                <span>Company</span>
                <span className="text-xs">↗</span>
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${
              isCollapsed && !isMobileOpen ? "justify-center" : ""
            }`}>
            <FaSignOutAlt size={18} />
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-medium text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
