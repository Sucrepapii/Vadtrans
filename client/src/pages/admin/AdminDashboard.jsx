import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import {
  FaUsers,
  FaBuilding,
  FaTicketAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaBox,
  FaLock,
  FaWallet,
  FaCheckCircle,
  FaArrowRight,
  FaExternalLinkAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { adminAPI, financeAPI } from "../../services/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isModerator } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalTrips: 0,
    totalBookings: 0,
    totalShipments: 0,
    totalRevenue: 0,
    recentBookings: [],
    finance: null,
  });
  const [financeOverview, setFinanceOverview] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);

  const formatNaira = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchTopCompanies();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, financeRes] = await Promise.allSettled([
        adminAPI.getStats(),
        financeAPI.getOverview(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (financeRes.status === "fulfilled" && financeRes.value.data.success) {
        setFinanceOverview(
          financeRes.value.data.data?.metrics || financeRes.value.data.data,
        );
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
      icon: FaBox,
      label: "Total Shipments",
      value: loading ? "..." : (stats.totalShipments || 0).toLocaleString(),
      color: "bg-indigo-500",
    },
    {
      icon: FaMoneyBillWave,
      label: "Revenue",
      value: loading
        ? "..."
        : `₦${stats.totalRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      color: "bg-primary",
    },
  ].filter(card => !(isModerator && card.label === "Revenue"));

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

  // Helper for Chart
  const BarChart = ({ data }) => {
    // Mock data for the chart if real data isn't structured yet
    const chartData = [35, 42, 28, 55, 48, 62, 70];
    const max = Math.max(...chartData);

    return (
      <div className="flex items-end justify-between h-48 w-full gap-2 pt-4">
        {chartData.map((value, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 group w-full">
            <div className="relative w-full flex items-end justify-center h-40 bg-neutral-100 rounded-t-lg overflow-hidden group-hover:bg-neutral-200 transition-colors">
              <div
                style={{ height: `${(value / max) * 100}%` }}
                className="w-full mx-1 bg-primary/80 rounded-t-md group-hover:bg-primary transition-all duration-300 relative group-hover:shadow-[0_0_10px_rgba(var(--color-primary),0.3)]"
              />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 z-40 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-raleway font-bold text-gray-900">
              Overview
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Welcome back, Admin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              LIVE
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-300">
              AD
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat, index) => {
              // Helper to generate pastel background and matching text
              let bgClass = "";
              let textClass = "";

              if (stat.color.includes("primary")) {
                bgClass = "bg-primary/10";
                textClass = "text-primary";
              } else {
                // Determine base color name (e.g., 'blue', 'green') using regex or simple replace
                // stat.color format is 'bg-blue-500'
                const colorMatch = stat.color.match(/bg-([a-z]+)-/);
                const colorName = colorMatch ? colorMatch[1] : "gray";
                bgClass = `bg-${colorName}-100`;
                textClass = `text-${colorName}-600`;
              }

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${bgClass} ${textClass}`}>
                      <stat.icon size={20} />
                    </div>
                    {/* Mock trend */}
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <FaArrowUp size={8} /> 12%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {stat.value}
                    </h3>
                    {stat.secondaryValue && (
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {stat.secondaryValue}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-400 mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial & Automated Payout Engine Section */}
          {!isModerator && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-charcoal text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
                      Live Financial Operations
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <FaWallet className="text-emerald-400" />
                    Financial & Automated Payout Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    Real-time marketplace revenue, escrow balance held for providers, and automated Paystack bank disbursements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/admin/settlements")}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 self-start md:self-auto hover:-translate-y-0.5"
                >
                  <span>Open Full Payout Engine</span>
                  <FaArrowRight size={12} />
                </button>
              </div>

              {/* Engine Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gross Inflow */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Gross Payments Inflow
                    </span>
                    <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                      <FaMoneyBillWave size={14} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatNaira(
                      financeOverview?.grossInflow ??
                        stats.finance?.grossInflow ??
                        stats.totalRevenue,
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Total paid bookings & rides
                  </p>
                </div>

                {/* Vadtrans Platform Revenue */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Platform Commission (10%)
                    </span>
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <FaShieldAlt size={14} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                    {formatNaira(
                      financeOverview?.platformCommission ??
                        stats.finance?.platformCommission ??
                        stats.totalRevenue * 0.1,
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-300/70 mt-1">
                    Vadtrans retained platform fee
                  </p>
                </div>

                {/* Held in Escrow */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Held in Escrow
                    </span>
                    <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                      <FaLock size={14} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                    {formatNaira(
                      financeOverview?.escrowHeld ??
                        stats.finance?.escrowHeld ??
                        stats.totalRevenue * 0.9,
                    )}
                  </p>
                  <p className="text-[11px] text-amber-200/70 mt-1">
                    Awaiting trip completion
                  </p>
                </div>

                {/* Disbursed Payouts */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Disbursed Payouts
                    </span>
                    <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                      <FaCheckCircle size={14} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-purple-300 tracking-tight">
                    {formatNaira(
                      financeOverview?.payoutsDisbursed ??
                        stats.finance?.payoutsDisbursed ??
                        0,
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {financeOverview?.successPayoutsCount ??
                      stats.finance?.payoutsCount ??
                      0}{" "}
                    transfers paid to bank
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${isModerator ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
            {/* Main Chart Section */}
            {!isModerator && (
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 text-lg">
                    Revenue Analytics
                  </h3>
                  <select className="text-xs bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-500 font-medium focus:ring-0 cursor-pointer">
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <BarChart />
              </div>
            )}

            {/* Top Companies */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                Top Performers
              </h3>
              <div className="space-y-4">
                {topCompanies.map((company, i) => (
                  <div
                    key={company.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border border-white shadow-sm">
                      {company.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800">
                        {company.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {company.bookingCount} orders
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                      #{i + 1}
                    </span>
                  </div>
                ))}
                {topCompanies.length === 0 && (
                  <div className="text-center text-sm text-gray-400 py-4">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">
                Recent Bookings
              </h3>
              <button className="text-sm text-primary font-medium hover:underline">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentBookings && stats.recentBookings.length > 0 ? (
                    stats.recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center font-bold">
                              {(booking.user?.name || "U").charAt(0)}
                            </div>
                            {booking.user?.name || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {booking.trip?.company?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          ₦{booking.totalAmount?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize inline-flex items-center gap-1.5 ${
                              booking.bookingStatus === "Completed"
                                ? "bg-green-100 text-green-700"
                                : booking.bookingStatus === "Pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : booking.bookingStatus === "Cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                booking.bookingStatus === "Completed"
                                  ? "bg-green-500"
                                  : booking.bookingStatus === "Pending"
                                    ? "bg-amber-500"
                                    : booking.bookingStatus === "Cancelled"
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                              }`}></span>
                            {booking.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-400 text-sm">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
