import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaCheck, FaTimes } from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await adminAPI.getNotifications();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminAPI.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-600";
      case "cancellation":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-400 hover:text-white transition-colors">
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-charcoal">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-10 left-full -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-neutral-100 z-50 overflow-hidden transform origin-top-left transition-all">
          <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="font-bold text-charcoal">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-dark transition-colors font-medium flex items-center gap-1">
                <FaCheck size={10} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <FaBell className="mx-auto mb-2 opacity-20" size={24} />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors ${
                      notif.isRead ? "bg-white" : "bg-primary/5"
                    } hover:bg-neutral-50`}>
                    <div className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getIconColor(
                          notif.type,
                        )}`}>
                        <FaBell size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            notif.isRead
                              ? "text-neutral-600"
                              : "text-charcoal font-medium"
                          }`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-neutral-400">
                            {new Date(notif.createdAt).toLocaleDateString()}{" "}
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="w-5 h-5 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary transition-colors"
                              title="Mark as read">
                              <FaCheck size={10} />
                            </button>
                          )}
                        </div>
                        {notif.actionUrl && (
                          <Link
                            to={notif.actionUrl}
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
