import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { bookingAPI } from "../../services/api";
import {
  FaEye,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
} from "react-icons/fa";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching bookings...");
      const response = await bookingAPI.getUserBookings();
      console.log("✅ Bookings response:", response.data);
      setBookings(response.data.bookings || []);
      console.log("📝 Bookings set:", response.data.bookings?.length || 0);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.bookingId?.toLowerCase().includes(searchLower) ||
      booking.trip?.from?.toLowerCase().includes(searchLower) ||
      booking.trip?.to?.toLowerCase().includes(searchLower)
    );
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  });

  const paginatedBookings = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-8 px-4">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl hover:text-primary transition-colors">
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal">
              Tickets List
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Table Header - Hidden on mobile */}
          <div className="hidden sm:grid sm:grid-cols-[1.2fr_1.5fr_1.2fr_1fr_1fr_1fr_0.5fr] gap-4 bg-white border border-neutral-200 rounded-t-lg px-6 py-3 mb-2 font-semibold text-sm text-neutral-600">
            <div>Ticket ID</div>
            <div>Transport Company</div>
            <div>Destination</div>
            <div>Trip Type</div>
            <div>Amount</div>
            <div>Date</div>
            <div></div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-lg">
              <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                <p className="text-neutral-600">Loading bookings...</p>
              </div>
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-16 text-center">
              <p className="text-neutral-600 text-lg mb-2">No bookings found</p>
              <p className="text-neutral-500 text-sm mb-6">
                {searchTerm
                  ? "Try adjusting your search"
                  : "You haven't made any bookings yet"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  Book a Trip
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Bookings List */}
              <div className="space-y-2">
                {paginatedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
                    {/* Mobile Layout */}
                    <div className="sm:hidden p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-charcoal">
                          {booking.bookingId}
                        </span>
                        <button
                          onClick={() =>
                            navigate(`/booking/confirmation`, {
                              state: { bookingId: booking.bookingId },
                            })
                          }
                          className="text-primary hover:text-primary-dark">
                          <FaEye size={20} />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Company</p>
                        <p className="font-medium">
                          {booking.trip?.company?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">Route</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {booking.trip?.from || "N/A"}
                          </span>
                          <FaArrowRight className="text-primary" />
                          <span className="font-medium">
                            {booking.trip?.to || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-neutral-600">Amount</p>
                          <p className="text-red-600 font-semibold">
                            ₦ {Number(booking.totalAmount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Date</p>
                          <p className="font-medium">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-[1.2fr_1.5fr_1.2fr_1fr_1fr_1fr_0.5fr] gap-4 items-center px-6 py-4">
                      <div className="font-semibold text-charcoal">
                        {booking.bookingId}
                      </div>
                      <div className="text-neutral-700">
                        {booking.trip?.company?.name || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {booking.trip?.from || "N/A"}
                        </span>
                        <FaArrowRight className="text-primary text-sm" />
                        <span className="font-medium">
                          {booking.trip?.to || "N/A"}
                        </span>
                      </div>
                      <div className="text-neutral-700">
                        {booking.trip?.transportType?.includes("round")
                          ? "Round Trip"
                          : "One Way"}
                      </div>
                      <div className="text-red-600 font-semibold">
                        ₦ {Number(booking.totalAmount).toLocaleString()}
                      </div>
                      <div className="text-neutral-700">
                        {formatDate(booking.createdAt)}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            navigate(`/booking/confirmation`, {
                              state: { bookingId: booking.bookingId },
                            })
                          }
                          className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm">
                          <span>View</span>
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaArrowLeft />
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${
                        currentPage === index + 1
                          ? "bg-primary text-white border-primary"
                          : "border-neutral-300 hover:bg-neutral-100"
                      }`}>
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaArrowRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;
