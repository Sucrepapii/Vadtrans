import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { calculateServiceFee } from "../../utils/pricing";
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
    bookingId = `BK-${Date.now()}`,
  } = location.state || {};

  // Set default values if coming from new flow
  const finalTrip = trip || {
    from: "Lagos",
    to: "Abuja",
    departureTime: "08:00 AM",
    company: "Vadtrans",
    type: "inter-state",
  };

  // Handle company name - it could be an object or string
  const companyName =
    typeof finalTrip.company === "object" && finalTrip.company !== null
      ? finalTrip.company.name ||
        finalTrip.company.companyName ||
        "Unknown Company"
      : finalTrip.company || "Vadtrans";

  const finalPassengers = passengerDetails || passengers || [];
  const finalTotal = totalAmount || 100;
  const finalBookingId = bookingId;

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

  // Calculate pricing breakdown
  const pricePerPerson =
    Number(finalTrip.price) || finalTotal / (finalPassengers.length || 1);
  const subtotal = pricePerPerson * finalPassengers.length;
  const serviceFee = calculateServiceFee(subtotal);

  // Calculate arrival time based on departure time and duration
  const calculateArrivalTime = () => {
    if (!finalTrip.departureTime) return "-";

    try {
      const duration = Number(finalTrip.duration) || 12; // default 12 hours

      // Parse departure time
      const timeMatch = finalTrip.departureTime.match(
        /(\d+):(\d+)\s*(AM|PM)?/i
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
    : "12 hrs";

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
                Booking Confirmed!
              </h2>
              <p className="text-green-700 text-sm">
                Your booking reference:{" "}
                <span className="font-mono font-bold">{finalBookingId}</span>
              </p>
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
                        <span className="font-bold text-lg">{arrivalTime}</span>
                      </div>
                      <span className="text-xs font-medium text-neutral-600">
                        {finalTrip.to}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 ml-2">
                      <FaClock className="inline mr-1" />
                      {durationText}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                  <FaCalendar className="text-primary" />
                  <span>
                    {searchParams?.date || new Date().toLocaleDateString()}
                  </span>
                </div>
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
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-2">Arrival</p>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-primary" />
                        <div>
                          <p className="font-bold">{finalTrip.to}</p>
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
                          Departs Terminal: {finalTrip.from}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {finalTrip.departureTime}
                        </p>
                      </div>

                      {/* Dotted line */}
                      <div className="absolute left-[-29px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-neutral-300"></div>

                      {/* Arrival */}
                      <div className="relative">
                        <div className="absolute -left-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt className="text-white text-xs" />
                        </div>
                        <p className="font-semibold">
                          Arrives Terminal: {finalTrip.to}
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
                              {selectedSeats && selectedSeats[index] && (
                                <p className="text-xs text-neutral-600">
                                  Seat {selectedSeats[index]}
                                </p>
                              )}
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
                          Adult X {finalPassengers.length}
                        </span>
                        <span className="font-semibold">
                          ₦{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Service Fee</span>
                        <span className="font-semibold">
                          ₦{serviceFee.toLocaleString()}
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
                        <span className="font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ₦{finalTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        {finalPassengers.length} traveller
                        {finalPassengers.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600 mb-1">
                        Payment Method
                      </p>
                      <p className="font-medium capitalize">
                        {paymentMethod || "Card"}
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
