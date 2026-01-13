import React from "react";
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

const AdminDashboard = () => {
  const stats = [
    {
      icon: FaUsers,
      label: "Total Users",
      value: "12,543",
      change: "+12%",
      isPositive: true,
      color: "bg-blue-500",
    },
    {
      icon: FaBuilding,
      label: "Transport Companies",
      value: "248",
      change: "+8%",
      isPositive: true,
      color: "bg-green-500",
    },
    {
      icon: FaTicketAlt,
      label: "Total Bookings",
      value: "45,892",
      change: "+23%",
      isPositive: true,
      color: "bg-purple-500",
    },
    {
      icon: FaDollarSign,
      label: "Revenue",
      value: "₦892,450",
      change: "-3%",
      isPositive: false,
      color: "bg-primary",
    },
  ];

  const recentBookings = [
    {
      id: "BK-001",
      customer: "John Doe",
      company: "Swift Transport",
      amount: "₦45",
      status: "Completed",
    },
    {
      id: "BK-002",
      customer: "Jane Smith",
      company: "Sky Airlines",
      amount: "₦320",
      status: "Pending",
    },
    {
      id: "BK-003",
      customer: "Bob Johnson",
      company: "Rail Express",
      amount: "₦85",
      status: "Completed",
    },
    {
      id: "BK-004",
      customer: "Alice Brown",
      company: "Swift Transport",
      amount: "₦52",
      status: "Cancelled",
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
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-neutral-600 text-sm mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-charcoal mb-2">
                      {stat.value}
                    </h3>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        stat.isPositive ? "text-green-600" : "text-red-600"
                      }`}>
                      {stat.isPositive ? (
                        <FaArrowUp size={12} />
                      ) : (
                        <FaArrowDown size={12} />
                      )}
                      <span>{stat.change}</span>
                      <span className="text-neutral-500">vs last month</span>
                    </div>
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
                {[
                  "Swift Transport",
                  "Sky Airlines",
                  "Rail Express",
                  "Metro Bus",
                ].map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium">{company}</span>
                    <span className="text-sm text-neutral-600">
                      {Math.floor(Math.random() * 500 + 100)} bookings
                    </span>
                  </div>
                ))}
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
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">
                        {booking.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.customer}</td>
                      <td className="px-4 py-3 text-sm">{booking.company}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {booking.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
