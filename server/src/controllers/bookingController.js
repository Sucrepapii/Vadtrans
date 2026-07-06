const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sequelize } = require("../config/database");
const { syncTripSeats } = require("./tripController");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log("Creating booking with body:", JSON.stringify(req.body, null, 2));
    const { tripId, passengers, selectedSeats, paymentMethod, totalAmount, paidAmount, isDeposit } =
      req.body;

    // Validate input
    if (
      !tripId ||
      !passengers ||
      !selectedSeats ||
      !paymentMethod ||
      !totalAmount
    ) {
      console.log("Validation failed: Missing required fields");
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
        received: { tripId, passengers: !!passengers, selectedSeats: !!selectedSeats, paymentMethod, totalAmount }
      });
    }

    // Sync seats before checking availability to release any expired pending reservations
    await syncTripSeats(tripId);

    // Find trip (now with updated seats)
    const trip = await Trip.findByPk(tripId, { transaction });
    if (!trip) {
      console.log(`Trip not found: ${tripId}`);
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check if seats are available
    let bookedSeats = [];
    if (Array.isArray(trip.bookedSeats)) {
      bookedSeats = trip.bookedSeats;
    } else if (typeof trip.bookedSeats === "string") {
      try {
        bookedSeats = JSON.parse(trip.bookedSeats || "[]");
      } catch (e) {
        bookedSeats = [];
      }
    }

    const unavailableSeats = selectedSeats.filter((seat) =>
      bookedSeats.includes(seat),
    );

    if (unavailableSeats.length > 0) {
      console.log(`Seats unavailable: ${unavailableSeats.join(", ")}`);
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(", ")} are no longer available`,
      });
    }

    // Check if enough seats available
    if (selectedSeats.length > trip.availableSeats) {
      console.log(`Not enough seats: requested ${selectedSeats.length}, available ${trip.availableSeats}`);
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Not enough seats available",
      });
    }

    // Calculate charges: 5% service fee + 7.5% VAT on subtotal
    let subtotal = 0;
    const docPrices = trip.documentPrices || {};
    const isInternational = trip.transportType === "international";

    passengers.forEach((passenger) => {
      const docType = passenger.documentType || "No Document";
      const specificPrice = docPrices[docType];

      // Handle both decimal strings from Postgres and numbers
      if (isInternational && specificPrice && parseFloat(specificPrice) > 0) {
        subtotal += parseFloat(specificPrice);
      } else {
        subtotal += parseFloat(trip.price || 0);
      }
    });

    if (isNaN(subtotal)) {
      console.error("Subtotal calculation resulted in NaN", { subtotal, tripPrice: trip.price });
      subtotal = parseFloat(totalAmount) || 0; // Fallback to frontend total if calculation fails
    }

    const serviceFee = 0; // Math.round(subtotal * 0.05);
    const vat = 0; // Math.round(serviceFee * 0.075);
    const bookingTotalAmount = subtotal + serviceFee + vat;

    console.log("Pricing calculation:", { subtotal, serviceFee, vat, total: bookingTotalAmount });

    // Optional: Validate that the total from frontend roughly matches our calculation
    if (Math.abs(bookingTotalAmount - Number(totalAmount)) > 10) {
      console.warn(
        `Total amount mismatch: Frontend ${totalAmount}, Backend ${bookingTotalAmount}`,
      );
    }

    // Create booking
    const booking = await Booking.create(
      {
        userId: req.user.id,
        tripId,
        passengers,
        selectedSeats,
        paymentMethod,
        totalAmount: bookingTotalAmount,
        serviceFee,
        vat,
        paidAmount: paidAmount !== undefined ? paidAmount : 0,
        isDeposit: isDeposit || false,
        paymentStatus: "pending", 
        bookingStatus: "pending", 
      },
      { transaction },
    );

    // Update trip seats
    trip.bookedSeats = [...bookedSeats, ...selectedSeats];
    trip.availableSeats = Math.max(0, trip.availableSeats - selectedSeats.length);
    await trip.save({ transaction });

    await transaction.commit();

    // Fetch booking with associations
    const populatedBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Trip, as: "trip" },
        { model: User, as: "user", attributes: ["name", "email"] },
      ],
    });

    console.log("Booking created successfully:", booking.id);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      detail: error.parent?.message || error.original?.message || error.name,
      receivedBody: { tripId: req.body.tripId, passengersCount: req.body.passengers?.length }
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Trip, as: "trip" }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Get company bookings
// @route   GET /api/bookings/company/my-bookings
// @access  Private (Company only)
exports.getCompanyBookings = async (req, res) => {
  try {
    // 1. Find all trips that belong to this company
    const myTrips = await Trip.findAll({
      where: { companyId: req.user.id },
      attributes: ["id"], // Only need IDs to fetch the bookings
    });

    const tripIds = myTrips.map((trip) => trip.id);

    if (tripIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
      });
    }

    // 2. Find all bookings for those trips
    const bookings = await Booking.findAll({
      where: { tripId: tripIds },
      include: [
        { model: Trip, as: "trip" },
        { model: User, as: "user", attributes: ["name", "email", "phone"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get company bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company bookings",
      error: error.message,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Trip, as: "trip" },
        { model: User, as: "user", attributes: ["name", "email", "phone"] },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to user
    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const booking = await Booking.findByPk(req.params.id, { transaction });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to user
    if (booking.userId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking is already cancelled
    if (booking.bookingStatus === "cancelled") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Fetch trip to get cancellation window
    const trip = await Trip.findByPk(booking.tripId, { transaction });
    const cancellationWindow = trip?.cancellationWindow || 12; // hours
    const currentDate = new Date();

    // Check departure time
    const departureDate = new Date(trip?.departureDate || booking.createdAt);
    // Parse departureTime (e.g., "07:00")
    if (trip?.departureTime) {
      const [hours, minutes] = trip.departureTime.split(':');
      departureDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    const timeToDeparture = (departureDate - currentDate) / (1000 * 60 * 60);

    if (booking.isDeposit) {
      // Deposits are non-refundable as per policy
      booking.paymentStatus = "failed";
      booking.refundAmount = 0;
      booking.bookingStatus = "cancelled";
    } else if (timeToDeparture > 12) {
      // Free cancellation up to 12 hours before trip (full refund)
      booking.paymentStatus = "refunded";
      booking.refundAmount = booking.paidAmount || booking.totalAmount;
      booking.bookingStatus = "cancelled";
    } else if (timeToDeparture >= 3) {
      // Cancellation within 12 hours -> 5% fee (95% refund)
      // Note: Using partially_refunded if supported, otherwise just refunded with logged amount
      booking.paymentStatus = "refunded"; 
      const total = booking.totalAmount;
      booking.refundAmount = Math.round(total * 0.95);
      booking.bookingStatus = "cancelled";
    } else {
      // Cancellation within 3 hours -> no refund
      booking.paymentStatus = "failed";
      booking.refundAmount = 0;
      booking.bookingStatus = "cancelled";
    }

    // Update booking status
    booking.cancellationReason = req.body.reason || "User cancelled";
    booking.cancelledAt = new Date();

    await booking.save({ transaction });

    // Release seats
    // const trip = await Trip.findByPk(booking.tripId, { transaction }); // Already fetched above
    if (trip) {
      let bookedSeats = [];
      if (typeof trip.bookedSeats === "string") {
        try {
          bookedSeats = JSON.parse(trip.bookedSeats);
        } catch (e) {}
      } else if (Array.isArray(trip.bookedSeats)) {
        bookedSeats = trip.bookedSeats;
      }

      const selectedSeats = Array.isArray(booking.selectedSeats)
        ? booking.selectedSeats
        : typeof booking.selectedSeats === "string"
          ? JSON.parse(booking.selectedSeats || "[]")
          : [];

      trip.bookedSeats = bookedSeats.filter(
        (seat) => !selectedSeats.includes(seat),
      );
      trip.availableSeats = Number(trip.availableSeats) + Number(selectedSeats.length);
      await trip.save({ transaction });
    }

    // Create Admin Notification
    const displayId = booking.bookingId || String(booking.id).padStart(5, "0");
    await Notification.create(
      {
        message: `Booking #${displayId} was cancelled by the user.`,
        type: "cancellation",
        // relatedBookingId: booking.id, // Removed to fix UUID Postgres error
        actionUrl: `/admin/bookings?search=${displayId}`,
      },
      { transaction },
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// @desc    Abandon a pending booking (e.g. when user cancels payment)
// @route   DELETE /api/bookings/:id/abandon
// @access  Private
exports.abandonBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only allow abandonment of pending bookings
    if (booking.bookingStatus !== "pending" || booking.paymentStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending, unpaid bookings can be abandoned",
      });
    }

    // Make sure booking belongs to user
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to abandon this booking",
      });
    }

    const tripId = booking.tripId;
    await booking.destroy();

    // Sync trip seats immediately to release them
    const { syncTripSeats } = require("./tripController");
    await syncTripSeats(tripId);

    res.status(200).json({
      success: true,
      message: "Booking abandoned and seats released",
    });
  } catch (error) {
    console.error("Abandon booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error abandoning booking",
      error: error.message,
    });
  }
};
