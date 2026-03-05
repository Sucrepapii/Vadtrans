import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
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
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState({ open: false, id: null });

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await adminAPI.updateBooking(id, newStatus);
      if (response.data.success) {
        toast.success("Booking status updated");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancel = (id) => {
    setCancelConfirm({ open: true, id });
  };

  const confirmCancel = async () => {
    if (cancelConfirm.id) {
      await handleStatusChange(cancelConfirm.id, "cancelled");
      setCancelConfirm({ open: false, id: null });
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
      render: (value, row) => (
        <select
          value={value}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer outline-none appearance-none ${getStatusColor(
            value,
          )}`}>
          <option value="pending" className="bg-white text-black text-sm">
            Pending
          </option>
          <option value="confirmed" className="bg-white text-black text-sm">
            Confirmed
          </option>
          <option value="completed" className="bg-white text-black text-sm">
            Completed
          </option>
          <option value="cancelled" className="bg-white text-black text-sm">
            Cancelled
          </option>
        </select>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="text"
            className="text-blue-600"
            onClick={() => handleView(row)}>
            <FaEye />
          </Button>
          {row.bookingStatus !== "cancelled" && (
            <Button
              variant="text"
              className="text-red-600"
              onClick={() => handleCancel(row.id)}>
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
    currentPage * itemsPerPage,
  );

  // Calculate statistics from real data
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
    revenue: bookings
      .filter(
        (b) => b.paymentStatus === "paid" || b.bookingStatus === "completed",
      )
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

      {/* Booking Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedBooking && (
          <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4 font-raleway text-charcoal">
              Booking Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Booking ID</span>
                <span className="font-mono font-bold">
                  {selectedBooking.bookingId}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Customer</span>
                <span className="font-medium">
                  {selectedBooking.user?.name || "N/A"} (
                  {selectedBooking.user?.email || "N/A"})
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Route</span>
                <span className="font-medium">
                  {selectedBooking.trip?.from} - {selectedBooking.trip?.to}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Departure</span>
                <span className="font-medium">
                  {selectedBooking.trip?.departureTime}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Payment Status</span>
                <span className="font-medium capitalize">
                  {selectedBooking.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Total Amount</span>
                <span className="font-medium text-primary">
                  ₦
                  {parseFloat(
                    selectedBooking.totalAmount || 0,
                  ).toLocaleString()}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-neutral-700 mb-2">
                  Passengers ({selectedBooking.passengers?.length || 0})
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedBooking.passengers?.map((p, i) => (
                    <li key={i} className="text-sm">
                      {p.fullName} ({p.gender})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelConfirm.open}
        onClose={() => setCancelConfirm({ open: false, id: null })}>
        <div className="p-6 max-w-sm mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-2xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Cancel Booking</h2>
          <p className="text-neutral-600 mb-6">
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setCancelConfirm({ open: false, id: null })}>
              No, Keep It
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmCancel}>
              Yes, Cancel It
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;
