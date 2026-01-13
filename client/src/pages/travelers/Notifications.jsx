import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import {
  FaBell,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTicketAlt,
  FaClock,
} from "react-icons/fa";

const Notifications = () => {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Booking Confirmed",
      message:
        "Your booking BK-123456 has been confirmed for tomorrow at 8:00 AM",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: "Trip Reminder",
      message:
        "Your trip to Abuja departs in 12 hours. Please arrive 30 minutes early.",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "warning",
      title: "Schedule Change",
      message: "Departure time for BK-123450 has been updated to 9:30 AM",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Payment Successful",
      message: "Payment of ₦45 received for booking BK-123456",
      time: "2 days ago",
      read: true,
    },
    {
      id: 5,
      type: "info",
      title: "New Route Available",
      message: "Swift Transport now offers direct service to Port Harcourt",
      time: "3 days ago",
      read: true,
    },
    {
      id: 6,
      type: "success",
      title: "Trip Completed",
      message:
        "Thank you for traveling with Rail Express. Rate your experience!",
      time: "5 days ago",
      read: true,
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return FaCheckCircle;
      case "warning":
        return FaExclamationTriangle;
      case "info":
        return FaInfoCircle;
      default:
        return FaBell;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-neutral-600 bg-neutral-100";
    }
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-raleway font-bold text-charcoal">
              Notifications
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}>
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}>
                Unread ({notifications.filter((n) => !n.read).length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);

              return (
                <Card
                  key={notification.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    !notification.read ? "border-l-4 border-primary" : ""
                  }`}>
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            !notification.read
                              ? "text-charcoal"
                              : "text-neutral-700"
                          }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <FaClock />
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <Card className="text-center py-12">
              <FaBell className="text-6xl text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">No unread notifications</p>
              <p className="text-sm text-neutral-500">You're all caught up!</p>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;
