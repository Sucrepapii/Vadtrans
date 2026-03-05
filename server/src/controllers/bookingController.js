const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const User = require("../models/User");
const { sequelize } = require("../config/database");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { tripId, passengers, selectedSeats, paymentMethod, totalAmount } =
      req.body;

    // Validate input
    if (
      !tripId ||
      !passengers ||
      !selectedSeats ||
      !paymentMethod ||
      !totalAmount
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Find trip
    const trip = await Trip.findByPk(tripId, { transaction });
    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check if seats are available
    const bookedSeats = trip.bookedSeats || [];
    const unavailableSeats = selectedSeats.filter((seat) =>
      bookedSeats.includes(seat),
    );

    if (unavailableSeats.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(", ")} are no longer available`,
      });
    }

    // Check if enough seats available
    if (selectedSeats.length > trip.availableSeats) {
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

      if (isInternational && specificPrice && Number(specificPrice) > 0) {
        subtotal += Number(specificPrice);
      } else {
        subtotal += Number(trip.price);
      }
    });
    const serviceFee = Math.round(subtotal * 0.05);
    const vat = Math.round(serviceFee * 0.075);
    const bookingTotalAmount = subtotal + serviceFee + vat;

    // Optional: Validate that the total from frontend roughly matches our calculation
    if (Math.abs(bookingTotalAmount - Number(totalAmount)) > 1) {
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
        paymentStatus: "pending", // Payment will be verified via Paystack
      },
      { transaction },
    );

    // Update trip seats
    trip.bookedSeats = [...bookedSeats, ...selectedSeats];
    trip.availableSeats = trip.availableSeats - selectedSeats.length;
    await trip.save({ transaction });

    await transaction.commit();

    // Fetch booking with associations
    const populatedBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Trip, as: "trip" },
        { model: User, as: "user", attributes: ["name", "email"] },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
      detail:
        error.name === "SequelizeDatabaseError" ? error.parent.message : null,
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

    // Check cancellation policy: 48 hours for refund, +30 days for reuse (total 32 days)
    const bookingDate = new Date(booking.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - bookingDate);
    const diffHours = diffTime / (1000 * 60 * 60);

    // 48 hours + 30 days = 32 days = 768 hours
    if (diffHours > 768) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Ticket has expired. Cancellations and reuse are only allowed within 32 days (48 hours + 30 days) from the booked date",
      });
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    booking.cancellationReason = req.body.reason || "User cancelled";
    booking.cancelledAt = new Date();

    // Set payment status based on whether it is within the 48-hour refund window
    if (diffHours <= 48) {
      booking.paymentStatus = "refunded";
    } else {
      // Kept as 'paid', meaning it is cancelled for reuse
      // (No explicit "reusable" enum value exists, so we leave it paid)
    }

    await booking.save({ transaction });

    // Release seats
    const trip = await Trip.findByPk(booking.tripId, { transaction });
    if (trip) {
      const bookedSeats = trip.bookedSeats || [];
      trip.bookedSeats = bookedSeats.filter(
        (seat) => !booking.selectedSeats.includes(seat),
      );
      trip.availableSeats = trip.availableSeats + booking.selectedSeats.length;
      await trip.save({ transaction });
    }

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
