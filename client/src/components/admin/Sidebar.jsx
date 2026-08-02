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
  FaBox,
  FaUserShield,
  FaMoneyBillWave,
} from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import BrandLogo from "../BrandLogo";

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
    { icon: FaBox, label: "Shipments", path: "/admin/shipments" },
    { icon: FaQuestionCircle, label: "FAQs", path: "/admin/faqs" },
    { icon: FaUserShield, label: "Staff", path: "/admin/staff" },
    { icon: FaMoneyBillWave, label: "Settlements", path: "/admin/settlements" },
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
        <div className="flex items-center justify-between py-4 px-5 border-b border-white/10">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <FaTachometerAlt className="text-sm text-primary" />
              </div>
              <div>
                  <BrandLogo 
                    variant="white" 
                    className="h-9" 
                  />
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

        {/* Notifications (Desktop & Mobile) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex justify-center border-b border-white/10 py-2 relative z-50">
            <NotificationBell />
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 py-1 space-y-0 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showLabel = !isCollapsed || isMobileOpen;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)} // Close on mobile navigation
                className={`relative flex items-center gap-4 px-5 py-1.5 transition-all duration-300 group ${
                  isActive
                    ? "text-primary bg-gradient-to-r from-primary/10 to-transparent border-r-4 border-primary"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon
                  size={17}
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
          <div className="px-5 py-2 mx-2 mb-1 flex items-center justify-between text-xs text-neutral-400 border-t border-white/5">
            <span className="font-bold text-[10px] text-neutral-500 uppercase tracking-wider">Switch Portal</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePortalAccess("/")}
                className="hover:text-primary transition-colors text-[11px] font-medium text-neutral-300">
                Passenger ↗
              </button>
              <span className="text-neutral-700">|</span>
              <button
                onClick={() => handlePortalAccess("/company/tickets")}
                className="hover:text-primary transition-colors text-[11px] font-medium text-neutral-300">
                Company ↗
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-2.5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${
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
