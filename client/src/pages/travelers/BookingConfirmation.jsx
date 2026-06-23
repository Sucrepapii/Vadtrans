import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { bookingAPI } from "../../services/api";
import { calculateServiceFee, calculateVAT } from "../../utils/pricing";
import {
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaCalendar,
  FaMapMarkerAlt,
  FaClock,
  FaBus,
  FaArrowLeft,
  FaPrint,
  FaArrowRight,
  FaPhone,
  FaIdCard,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    trip,
    searchParams,
    passengers,
    passengerDetails,
    selectedSeats,
    totalAmount,
    paymentMethod,
    bookingId,
    paidAmount,
    isDeposit,
  } = location.state || {}; // bookingId might be passed from MyBookings

  // State to hold fetched booking details
  const [fetchedBooking, setFetchedBooking] = useState(null);
  const [loading, setLoading] = useState(!trip && !!bookingId); // Only load if we have an ID but no trip data

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!trip && bookingId) {
        try {
          const response = await bookingAPI.getBooking(bookingId);
          if (response.data && response.data.success) {
            setFetchedBooking(response.data.booking);
          }
        } catch (error) {
          console.error("Failed to fetch booking details:", error);
          toast.error("Failed to load full ticket details.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBookingDetails();
  }, [trip, bookingId]);

  // Use fetched data if available, otherwise use location state, otherwise fallback
  const finalTrip = fetchedBooking?.trip ||
    trip || {
      from: "Lagos",
      to: "Abuja",
      departureTime: "08:00 AM",
      company: "Vadtrans",
      type: "inter-state",
    };

  // Robust check for driver contact number from all possible sources
  const driverNumber = 
    finalTrip?.driverContact || 
    trip?.driverContact || 
    fetchedBooking?.trip?.driverContact ||
    null;

  // Handle company name - it could be an object or string
  const companyName =
    typeof finalTrip.company === "object" && finalTrip.company !== null
      ? finalTrip.company.name ||
        finalTrip.company.companyName ||
        "Unknown Company"
      : finalTrip.company || "Vadtrans";

  const finalPassengers =
    fetchedBooking?.passengers || passengerDetails || passengers || [];
  const passengerCount = finalPassengers.length || 1;
  const finalTotal = fetchedBooking?.totalAmount
    ? Number(fetchedBooking.totalAmount)
    : Number(totalAmount) || 0;
  const finalPaidAmount = fetchedBooking?.paidAmount
    ? Number(fetchedBooking.paidAmount)
    : Number(paidAmount) || finalTotal;
  const finalIsDeposit = fetchedBooking?.isDeposit ?? isDeposit;
  const finalBookingId =
    fetchedBooking?.bookingId || bookingId || `BK-${Date.now()}`;
  const finalPaymentMethod =
    fetchedBooking?.paymentMethod || paymentMethod || "Paystack";

  // Derive subtotal from trip data or back-calculate correctly
  const pricePerPerson = Number(finalTrip?.selectedPrice || finalTrip?.price) || 0;
  const subtotal =
    pricePerPerson > 0
      ? pricePerPerson * passengerCount
      : Math.round(finalTotal / 1.05375); // reverse (1 + 0.05 * 1.075)

  const serviceFee = calculateServiceFee(subtotal);
  const vat = calculateVAT(serviceFee);

  const handleDownloadTicket = async () => {
    const element = document.getElementById("ticket-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`VadTrans-Ticket-${finalBookingId}.pdf`);
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download ticket");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate arrival time based on departure time and duration
  const calculateArrivalTime = () => {
    if (!finalTrip.departureTime) return "-";

    try {
      const duration = Number(finalTrip.duration) || 12; // default 12 hours

      // Parse departure time
      const timeMatch = finalTrip.departureTime.match(
        /(\d+):(\d+)\s*(AM|PM)?/i,
      );
      if (!timeMatch) return "-";

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3];

      // Convert to 24-hour format
      if (period) {
        if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
      }

      // Add duration
      const totalMinutes = hours * 60 + minutes + duration * 60;
      let arrivalHours = Math.floor(totalMinutes / 60) % 24;
      const arrivalMinutes = totalMinutes % 60;

      // Convert back to 12-hour format
      const arrivalPeriod = arrivalHours >= 12 ? "PM" : "AM";
      if (arrivalHours > 12) arrivalHours -= 12;
      if (arrivalHours === 0) arrivalHours = 12;

      return `${arrivalHours}:${arrivalMinutes
        .toString()
        .padStart(2, "0")} ${arrivalPeriod}`;
    } catch (e) {
      return "-";
    }
  };

  const arrivalTime = calculateArrivalTime();
  const durationText = finalTrip.duration
    ? `${finalTrip.duration} hrs`
    : finalTrip.transportType === "carpooling" ? "" : "12 hrs";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <Navbar variant="desktop" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-neutral-600">Loading ticket details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar variant="desktop" />

      <div className="flex-1 py-6 sm:py-8 px-4">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/")}
                className="flex items-center gap-2">
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-2xl sm:text-3xl font-raleway font-bold text-charcoal">
                Ticket Details
              </h1>
            </div>
            <Button
              variant="secondary"
              onClick={handlePrint}
              className="flex items-center gap-2">
              <FaPrint />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <FaCheckCircle className="text-3xl text-green-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-green-900 text-lg">
                {finalIsDeposit ? "Reservation Confirmed!" : "Booking Confirmed!"}
              </h2>
              <p className="text-green-700 text-sm">
                Your {finalIsDeposit ? "reservation" : "booking"} reference:{" "}
                <span className="font-mono font-bold">{finalBookingId}</span>
              </p>
              {finalIsDeposit && (
                <p className="text-[10px] text-green-600 mt-1">
                  You've paid a deposit of ₦{finalPaidAmount.toLocaleString()}. The balance is due on departure.
                </p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div id="ticket-content">
            <Card className="p-4 sm:p-6 mb-6">
              {/* Trip Card */}
              <div className="bg-white border-2 border-neutral-200 rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  {/* Company Logo/Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaBus className="text-3xl text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{companyName}</h3>
                      <p className="text-sm text-neutral-600">
                        {finalBookingId}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200">
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">Vehicle</p>
                          <p className="text-sm font-bold text-charcoal">{finalTrip.vehicleName || "Assigned Vehicle"}</p>
                        </div>
                        {finalTrip.vehiclePlateNumber && (
                          <div className="bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            <p className="text-[10px] text-amber-600 font-bold uppercase">Plate Number</p>
                            <p className="text-sm font-bold text-amber-700 tracking-wider">{finalTrip.vehiclePlateNumber}</p>
                          </div>
                        )}
                        <div className="bg-neutral-100 px-2 py-1 rounded border border-neutral-200">
                          <p className="text-[10px] text-neutral-500 font-bold uppercase">Type</p>
                          <p className="text-sm font-bold text-charcoal">{finalTrip.vehicleType || "Bus"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Overview */}
                  <div className="flex items-center gap-2 sm:gap-4 bg-neutral-50 px-4 py-3 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <FaBus className="text-primary text-xs" />
                        <span className="font-bold text-lg">
                          {finalTrip.departureTime}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-neutral-600">
                        {finalTrip.from}
                      </span>
                    </div>
                    <FaArrowRight className="text-primary mx-2" />
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <FaMapMarkerAlt className="text-primary text-xs" />
                        <span className="font-bold text-lg">
                          {finalTrip.transportType === "carpooling" && !finalTrip.duration ? finalTrip.timeWindowEnd || finalTrip.departureTime : arrivalTime}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-neutral-600">
                        {finalTrip.selectedDestination || finalTrip.to}
                      </span>
                    </div>
                    {finalTrip.transportType === "carpooling" && finalTrip.timeWindowEnd && !finalTrip.duration ? (
                      <div className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold ml-2">
                        PICKUP WINDOW
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500 ml-2">
                        <FaClock className="inline mr-1" />
                        {durationText}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                  <FaCalendar className="text-primary" />
                  <span>
                    {searchParams?.date ||
                      finalTrip?.departureDate ||
                      (fetchedBooking?.createdAt
                        ? new Date(
                            fetchedBooking.createdAt,
                          ).toLocaleDateString()
                        : new Date().toLocaleDateString())}
                  </span>
                </div>

                {driverNumber && (
                  <div className="flex items-center gap-2 text-sm text-neutral-800 bg-primary/5 p-3 rounded-lg border border-primary/10 mb-4">
                    <FaPhone className="text-primary flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Driver's Contact</span>
                      <span className="font-bold text-base">{driverNumber}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Journey Details */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Departure */}
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-2">Departure</p>
                      <div className="flex items-center gap-2">
                        <FaBus className="text-primary" />
                        <div>
                          <p className="font-bold">{finalTrip.from}</p>
                          <p className="text-sm text-neutral-600">
                            {finalTrip.departureTime}
                          </p>
                          {finalTrip.terminal && (
                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-primary text-[10px]" />
                              {finalTrip.terminal}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-2">Arrival</p>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-primary" />
                        <div>
                          <p className="font-bold">{finalTrip.selectedDestination || finalTrip.to}</p>
                          <p className="text-sm text-neutral-600">
                            {arrivalTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="bg-neutral-50 p-4 sm:p-6 rounded-lg mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <FaBus className="text-primary" />
                      Route Information
                    </h3>
                    <div className="relative pl-8">
                      {/* Departure */}
                      <div className="mb-6 relative">
                        <div className="absolute -left-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <FaBus className="text-white text-xs" />
                        </div>
                        <p className="font-semibold">
                          Departs: {finalTrip.from}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {finalTrip.departureTime}
                        </p>
                        {finalTrip.terminal && (
                          <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-primary text-[10px]" />
                            Terminal: {finalTrip.terminal}
                          </p>
                        )}
                      </div>

                      {/* Dotted line */}
                      <div className="absolute left-[-29px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-neutral-300"></div>

                      {/* Arrival */}
                      <div className="relative">
                        <div className="absolute -left-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt className="text-white text-xs" />
                        </div>
                        <p className="font-semibold">
                          Arrives Terminal: {finalTrip.selectedDestination || finalTrip.to}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="bg-neutral-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Passenger Details</h3>
                    <div className="space-y-3">
                      {finalPassengers.map((passenger, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                              <div>
                                <p className="font-medium">
                                  {passenger.firstName ||
                                    passenger.fullName ||
                                    `Passenger ${index + 1}`}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  {passenger.phone && (
                                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                                      <FaPhone className="text-[10px]" />
                                      {passenger.phone}
                                    </p>
                                  )}
                                  {selectedSeats && selectedSeats[index] && (
                                    <p className="text-xs text-neutral-600 bg-neutral-200 px-1.5 rounded">
                                      Seat {selectedSeats[index]}
                                    </p>
                                  )}
                                </div>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side - Fare Summary */}
                <div>
                  <div className="bg-neutral-50 p-4 sm:p-6 rounded-lg sticky top-4">
                    <h3 className="font-semibold mb-4">Fare Summary</h3>

                    <div className="space-y-3 mb-4 pb-4 border-b border-neutral-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                          Adult X {passengerCount}
                        </span>
                        <span className="font-semibold">
                          ₦{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                          Service Fee (5%)
                        </span>
                        <span className="font-semibold">
                          ₦{serviceFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">VAT (7.5%)</span>
                        <span className="font-semibold">
                          ₦{vat.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 italic mt-1 pb-2">
                        This service fee helps us verify transport partners,
                        maintain the platform, and provide customer support for
                        a smooth and reliable travel experience.
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{finalIsDeposit ? "Deposit Paid" : "Total Paid"}</span>
                        <span className="text-2xl font-bold text-primary">
                          ₦{finalPaidAmount.toLocaleString()}
                        </span>
                      </div>
                      {finalIsDeposit && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-neutral-500">Balance Due</span>
                          <span className="text-sm font-semibold text-neutral-700">
                            ₦{(finalTotal - finalPaidAmount).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-neutral-600 mt-1">
                        {passengerCount} passenger
                        {passengerCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-1">
                        Payment Method
                      </p>
                      <p className="font-medium">
                        {finalPaymentMethod === "card" ||
                        finalPaymentMethod === "Card"
                          ? "Paystack (Online)"
                          : finalPaymentMethod === "bank"
                            ? "Bank Transfer"
                            : finalPaymentMethod === "mobile"
                              ? "Mobile Money"
                              : finalPaymentMethod || "Paystack"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="mb-6 bg-blue-50 border border-blue-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaEnvelope className="text-blue-600" />
              What's Next?
            </h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  A confirmation email has been sent to your registered email
                  address
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Your e-ticket is attached to the confirmation email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Please arrive at the departure point 30 minutes before
                  departure time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Carry a valid ID matching the passenger details provided
                </span>
              </li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="primary" fullWidth onClick={handleDownloadTicket}>
              <div className="flex items-center justify-center gap-2">
                <FaDownload />
                <span>Download E-Ticket</span>
              </div>
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
