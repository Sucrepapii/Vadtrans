import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  FaTachometerAlt,
  FaUsers,
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
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/admin" },
    { icon: FaUsers, label: "Clients", path: "/admin/clients" },
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
    <div
      className={`bg-charcoal text-white h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-700">
        {!isCollapsed && (
          <h1 className="text-xl font-raleway font-bold">Vadtrans Admin</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:text-primary transition-colors">
          {isCollapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}>
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick Navigation */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-t border-neutral-700">
          <p className="text-xs text-neutral-500 mb-2">Quick Access</p>
          <div className="space-y-2">
            <button
              onClick={() => handlePortalAccess("/")}
              className="block w-full px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm text-center transition-colors">
              Traveler Portal
            </button>
            <button
              onClick={() => handlePortalAccess("/company/tickets")}
              className="block w-full px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm text-center transition-colors">
              Company Portal
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-neutral-700 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full text-neutral-300 hover:text-white transition-colors">
          <FaSignOutAlt size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
