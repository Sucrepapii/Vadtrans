import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import {
  FaUsers,
  FaBuilding,
  FaTicketAlt,
  FaDollarSign,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalTrips: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
  });
  const [topCompanies, setTopCompanies] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTopCompanies();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCompanies = async () => {
    try {
      const response = await adminAPI.getTopCompanies(4);
      if (response.data.success) {
        setTopCompanies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching top companies:", error);
      // Don't show error toast, just fail silently
    }
  };

  const statCards = [
    {
      icon: FaUsers,
      label: "Total Users",
      value: loading ? "..." : stats.totalUsers.toLocaleString(),
      color: "bg-blue-500",
    },
    {
      icon: FaBuilding,
      label: "Transport Companies",
      value: loading ? "..." : stats.totalCompanies.toLocaleString(),
      color: "bg-green-500",
    },
    {
      icon: FaTicketAlt,
      label: "Total Bookings",
      value: loading ? "..." : stats.totalBookings.toLocaleString(),
      color: "bg-purple-500",
    },
    {
      icon: FaDollarSign,
      label: "Revenue",
      value: loading
        ? "..."
        : `₦${stats.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      color: "bg-primary",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <h1 className="text-3xl font-raleway font-bold text-charcoal">
            Dashboard
          </h1>
          <p className="text-neutral-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-charcoal mb-2">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white text-2xl" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary" />
                Booking Trends
              </h3>
              <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                <p className="text-neutral-500">
                  Chart visualization would go here
                </p>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaBuilding className="text-primary" />
                Top Companies
              </h3>
              <div className="space-y-3">
                {topCompanies.length > 0 ? (
                  topCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-sm text-neutral-600">
                        {company.bookingCount} bookings
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    No companies with bookings yet
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Bookings Table */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Booking ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-neutral-500">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : stats.recentBookings &&
                    stats.recentBookings.length > 0 ? (
                    stats.recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">
                          #{booking.id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.user?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking.trip?.company?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          ₦{booking.totalAmount?.toLocaleString() || "0"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.bookingStatus
                            )}`}>
                            {booking.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-neutral-500">
                        No recent bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
