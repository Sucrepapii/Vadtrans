import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import api, { bookingAPI } from "../../services/api";
import {
  FaEye,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaBan,
  FaSuitcase,
  FaCar,
  FaInfoCircle,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [activeTab, setActiveTab] = useState("shared"); // "shared" or "private"
  const [privateRides, setPrivateRides] = useState([]);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [privateFilter, setPrivateFilter] = useState("active");
  const displayedPrivateRides = privateRides.filter(r => privateFilter === "active" ? !['completed', 'cancelled'].includes(r.status) : ['completed', 'cancelled'].includes(r.status));

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchBookings();
    fetchPrivateRides();
  }, []);

  const fetchPrivateRides = async () => {
    try {
      setLoadingPrivate(true);
      const res = await api.get("/private-rides");
      setPrivateRides(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrivate(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if booking can be cancelled (within 32 days total: 48hr refund + 30-day reuse)
  const canCancel = (booking) => {
    if (booking.bookingStatus !== "confirmed") return false;

    const bookingDate = new Date(booking.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - bookingDate);
    const diffHours = diffTime / (1000 * 60 * 60);

    return diffHours <= 768; // 32 days limit
  };

  const initiateCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      setCancelling(true);
      await bookingAPI.cancelBooking(
        bookingToCancel.id,
        "User requested cancellation",
      );
      toast.success("Booking cancelled successfully");
      setIsCancelModalOpen(false);
      fetchBookings(); // Refresh list to show updated status
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
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
    currentPage * itemsPerPage,
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
              My Bookings
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === "shared" ? "border-primary text-primary" : "border-transparent text-neutral-500 hover:text-charcoal"
              }`}
            >
              Shared Tickets
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === "private" ? "border-primary text-primary" : "border-transparent text-neutral-500 hover:text-charcoal"
              }`}
            >
              Private Rides
            </button>
          </div>

          {activeTab === "shared" ? (
            <>
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
                        <div className="flex flex-col">
                          <span className="font-semibold text-charcoal">
                            {booking.bookingId}
                          </span>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {booking.paymentStatus}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              booking.bookingStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {booking.bookingStatus}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {canCancel(booking) ? (
                            <button
                              onClick={() => initiateCancel(booking)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Booking">
                              <FaBan size={18} />
                            </button>
                          ) : booking.bookingStatus === "cancelled" ? (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Cancelled
                            </span>
                          ) : null}
                          <button
                            onClick={() =>
                              navigate(`/booking/confirmation`, {
                                state: {
                                  bookingId: booking.bookingId,
                                  trip: booking.trip,
                                  passengers: booking.passengers,
                                  selectedSeats: booking.selectedSeats,
                                  paymentMethod: booking.paymentMethod,
                                  totalAmount: booking.totalAmount,
                                  serviceFee: booking.serviceFee,
                                },
                              })
                            }
                            className="text-primary hover:text-primary-dark">
                            <FaEye size={20} />
                          </button>
                        </div>
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
                      <div className="flex flex-col">
                        <span className="font-semibold text-charcoal">
                          {booking.bookingId}
                        </span>
                        <div className="flex gap-1.5 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            booking.bookingStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {booking.bookingStatus}
                          </span>
                        </div>
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
                        {booking.bookingStatus === "cancelled" && (
                          <span className="block text-xs text-red-600 font-medium">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <div className="flex justify-end gap-3">
                        {canCancel(booking) && (
                          <button
                            onClick={() => initiateCancel(booking)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                            title="Cancel Booking">
                            <span>Cancel</span>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            navigate(`/booking/confirmation`, {
                              state: {
                                bookingId: booking.bookingId,
                                trip: booking.trip,
                                passengers: booking.passengers,
                                selectedSeats: booking.selectedSeats,
                                paymentMethod: booking.paymentMethod,
                                totalAmount: booking.totalAmount,
                                serviceFee: booking.serviceFee,
                              },
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
          </>
            ) : (
              // Private Rides Tab Content
              <div>
                <div className="flex gap-2 mb-6">
                  <button onClick={() => setPrivateFilter("active")} className={`px-4 py-2 text-sm font-bold rounded-lg ${privateFilter === "active" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>Active</button>
                  <button onClick={() => setPrivateFilter("archived")} className={`px-4 py-2 text-sm font-bold rounded-lg ${privateFilter === "archived" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>Archived</button>
                </div>
                {loadingPrivate ? (
                <div className="flex items-center justify-center py-16 bg-white rounded-lg">
                  <FaSpinner className="animate-spin text-4xl text-primary" />
                  </div>
                ) : displayedPrivateRides.length === 0 ? (
                  <div className="bg-white rounded-lg border border-neutral-200 p-16 text-center">
                  <p className="text-neutral-600 text-lg mb-2">No private rides found</p>
                  <button
                    onClick={() => navigate("/request-private-ride")}
                    className="px-6 py-2 bg-primary text-white rounded-lg mt-4 hover:bg-primary-dark transition-colors">
                    Request a Private Ride
                  </button>
                </div>
              ) : (
                  <div className="space-y-4">
                    {displayedPrivateRides.map(ride => {
                      const acceptedBid = ride.bids?.find(b => b.status === "accepted" || b.driverId === ride.driverId) || (ride.bids && ride.bids.length > 0 ? ride.bids[0] : null);
                      const isPaid = ride.paymentStatus === "paid";
                      const isConfirmed = isPaid || ["driver_assigned", "en_route", "arrived", "started", "completed"].includes(ride.status);

                      return (
                        <div key={ride.id} className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2.5">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                                ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                                ride.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                isPaid || ride.status === 'driver_assigned' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold' :
                                ride.status === 'en_route' ? 'bg-blue-100 text-blue-800 font-bold' :
                                ride.status === 'arrived' ? 'bg-indigo-100 text-indigo-800 font-bold' :
                                ride.status === 'started' ? 'bg-purple-100 text-purple-800 font-bold' :
                                ride.status === 'awaiting_payment' ? 'bg-amber-100 text-amber-800 font-bold animate-pulse' :
                                'bg-yellow-100 text-yellow-800 animate-pulse font-bold'
                              }`}>
                                {isPaid || ride.status === 'driver_assigned' ? 'Driver Assigned (Paid)' : ride.status.replace("_", " ")}
                              </span>

                              {ride.agreedPrice && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                                  ₦{ride.agreedPrice.toLocaleString()}
                                </span>
                              )}

                              <span className="text-xs font-medium text-neutral-400 ml-auto md:ml-0">
                                {formatDate(ride.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-lg font-bold text-charcoal">
                              <span>{ride.pickupLocation}</span>
                              <FaArrowRight className="text-primary text-sm shrink-0" />
                              <span>{ride.destination}</span>
                            </div>

                            <div className="text-sm text-neutral-600 mt-1">
                              {ride.rideType.replace("-", " ")} • {ride.passengersCount} Passenger(s)
                            </div>

                            {/* Passenger Luggage & Request Info */}
                            {(ride.luggageInfo || ride.specialNotes) && (
                              <div className="text-xs text-neutral-500 mt-2.5 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 space-y-1">
                                {ride.luggageInfo && <p><strong>Passenger Luggage:</strong> {ride.luggageInfo}</p>}
                                {ride.specialNotes && <p><strong>Passenger Notes:</strong> {ride.specialNotes}</p>}
                              </div>
                            )}

                            {/* Driver Luggage Space, Vehicle & Notes */}
                            {(acceptedBid?.luggageDescription || acceptedBid?.vehicleDetails || acceptedBid?.furtherInformation) && (
                              <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs space-y-1.5 animate-fade-in">
                                <p className="font-bold text-primary uppercase tracking-wider text-[10px] mb-1">
                                  Driver Proposal & Vehicle Details
                                </p>
                                {acceptedBid.luggageDescription && (
                                  <div className="flex items-center gap-1.5 text-neutral-700">
                                    <FaSuitcase className="text-primary text-xs shrink-0" />
                                    <span><strong>Driver Luggage Capacity:</strong> {acceptedBid.luggageDescription}</span>
                                  </div>
                                )}
                                {acceptedBid.vehicleDetails && (
                                  <div className="flex items-center gap-1.5 text-neutral-700">
                                    <FaCar className="text-primary text-xs shrink-0" />
                                    <span><strong>Vehicle Info:</strong> {acceptedBid.vehicleDetails}</span>
                                  </div>
                                )}
                                {acceptedBid.furtherInformation && (
                                  <div className="flex items-start gap-1.5 text-neutral-600 italic">
                                    <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
                                    <span><strong>Driver Note:</strong> {acceptedBid.furtherInformation}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                            {ride.driverId || ride.driver ? (
                              <div className="md:text-right">
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Assigned Driver</p>
                                <p className="font-bold text-charcoal">{ride.driver?.name || "Professional Driver"}</p>
                                {ride.driver?.phone && (
                                  <a href={`tel:${ride.driver.phone}`} className="text-xs text-primary font-bold hover:underline block mt-0.5">
                                    📞 {ride.driver.phone}
                                  </a>
                                )}
                              </div>
                            ) : ride.status === "awaiting_payment" ? (
                              <div className="md:text-right">
                                <p className="text-amber-600 font-bold text-sm">Awaiting Payment</p>
                                <p className="text-xs text-neutral-400">Complete payment to finalize</p>
                              </div>
                            ) : (
                              <div className="md:text-right">
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {ride.bids?.length || 0} Driver bid(s) received
                                </p>
                              </div>
                            )}
                            
                            <div className="flex gap-2 w-full md:w-auto">
                              {ride.status === 'searching' ? (
                                <button
                                  onClick={() => navigate('/request-private-ride')}
                                  className="w-full md:w-auto px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                                >
                                  View Bids ({ride.bids?.length || 0})
                                </button>
                              ) : ride.status === 'awaiting_payment' && !isPaid ? (
                                <button
                                  onClick={() => navigate('/request-private-ride')}
                                  className="w-full md:w-auto px-5 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20"
                                >
                                  Pay Now & Confirm Driver
                                </button>
                              ) : isConfirmed ? (
                                <button
                                  onClick={() => {
                                    navigate('/tracking', { state: { bookingId: ride.requestId || `PR-${ride.id}` } });
                                  }}
                                  className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                                >
                                  <FaShieldAlt className="text-xs" /> Track Live Ride
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => !cancelling && setIsCancelModalOpen(false)}
        title="Cancel Booking"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={cancelling}>
              Close
            </Button>
            <Button
              variant="danger" // Assuming Button supports 'danger' or just use custom style
              onClick={confirmCancel}
              disabled={cancelling}
              className="bg-red-600 text-white hover:bg-red-700">
              {cancelling ? (
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  <span>Cancelling...</span>
                </div>
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to cancel this booking?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-2">Refund & Ticket Reuse Policy</p>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-yellow-900 mb-1">
                  1. Refund Eligibility (48 Hours Only)
                </p>
                <p>
                  Customers are eligible for a full refund within 48 hours from
                  the time a trip is booked. Refund requests made after 48 hours
                  from the booking time will not be approved.
                </p>
              </div>
              <div>
                <p className="font-medium text-yellow-900 mb-1">
                  2. Ticket Reuse After 48 Hours
                </p>
                <p>
                  If a request is made after the 48-hour refund window has
                  expired, the ticket will no longer be eligible for a monetary
                  refund. However, the ticket may be reused for another travel
                  date, with the same transport company, and for the same trip
                  route.
                </p>
              </div>
              <div>
                <p className="font-medium text-yellow-900 mb-1">
                  3. 30-Day Reuse Validity Period
                </p>
                <p>
                  The ticket reuse option remains valid for 30 days, starting 48
                  hours after the original booking time. If the ticket is not
                  reused within this 30-day period, it will automatically expire
                  and cannot be refunded, reused, or transferred.
                </p>
              </div>
              <div>
                <p className="font-medium text-yellow-900 mb-1">
                  4. Non-Transferability
                </p>
                <p>
                  Reused tickets are non-transferable and must be used by the
                  original passenger unless otherwise permitted by the transport
                  company.
                </p>
              </div>
            </div>
          </div>
          {bookingToCancel && (
            <div className="text-sm text-neutral-500">
              Booking ID: <strong>{bookingToCancel.bookingId}</strong>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
