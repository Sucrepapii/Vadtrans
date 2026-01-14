import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import { FaSearch, FaEye, FaTimes } from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBookings();
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.bookingId &&
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.user?.name &&
        booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      selectedStatus === "all" || booking.bookingStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const columns = [
    {
      key: "bookingId",
      label: "Booking ID",
      sortable: true,
      render: (value) => <span className="font-mono font-medium">{value}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (_, row) => row.user?.name || "N/A",
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (_, row) => row.trip?.company?.name || "N/A",
    },
    {
      key: "route",
      label: "Route",
      render: (_, row) =>
        row.trip ? `${row.trip.from} - ${row.trip.to}` : "N/A",
    },
    {
      key: "date",
      label: "Booking Date",
      sortable: true,
      render: (_, row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "passengers",
      label: "Passengers",
      render: (_, row) => row.passengers?.length || 0,
    },
    {
      key: "totalAmount",
      label: "Amount",
      sortable: true,
      render: (value) => `₦${parseFloat(value || 0).toLocaleString()}`,
    },
    {
      key: "bookingStatus",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            value
          )}`}>
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="text" className="text-blue-600">
            <FaEye />
          </Button>
          {row.bookingStatus !== "cancelled" && (
            <Button variant="text" className="text-red-600">
              <FaTimes />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics from real data
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
    revenue: bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0),
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-neutral-200 px-8 py-6">
          <h1 className="text-3xl font-raleway font-bold text-charcoal">
            Booking Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage all bookings across the platform
          </p>
        </div>

        <div className="p-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Total Bookings</h3>
              <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Confirmed</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.confirmed}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm text-neutral-600 mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-primary">
                ₦{stats.revenue}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by booking ID or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </Card>

          {/* Bookings Table */}
          <Card>
            {loading ? (
              <div className="py-12 text-center text-neutral-500">
                Loading bookings...
              </div>
            ) : paginatedBookings.length > 0 ? (
              <>
                <Table columns={columns} data={paginatedBookings} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredBookings.length}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </>
            ) : (
              <div className="py-12 text-center text-neutral-500">
                No bookings found
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
