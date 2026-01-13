const Trip = require("../models/Trip");
const User = require("../models/User");

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getAllTrips = async (req, res) => {
  try {
    const { from, to, transportType, status } = req.query;

    const where = {};

    // Filter by from location (exact match)
    if (from) where.from = from;

    // Filter by to location (exact match)
    if (to) where.to = to;

    // Filter by status (default to active only)
    where.status = status || "active";

    const trips = await Trip.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    // Additional filtering for transportType (includes partial match)
    let filteredTrips = trips;
    if (transportType && transportType !== "all") {
      filteredTrips = trips.filter(
        (trip) =>
          trip.transportType &&
          trip.transportType.toLowerCase().includes(transportType.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: filteredTrips.length,
      trips: filteredTrips,
    });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trips",
      error: error.message,
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trip",
      error: error.message,
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private (Company only)
exports.createTrip = async (req, res) => {
  try {
    const { from, to, transportType, departureTime, duration, price, seats } =
      req.body;

    // Validate required fields
    if (!from || !to || !transportType || !departureTime || !price || !seats) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const trip = await Trip.create({
      from,
      to,
      transportType,
      departureTime,
      duration: duration || null,
      price,
      seats,
      availableSeats: seats,
      companyId: req.user.id,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating trip",
      error: error.message,
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (Company only - own trips)
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check if user owns this trip
    if (trip.companyId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this trip",
      });
    }

    const {
      from,
      to,
      transportType,
      departureTime,
      duration,
      price,
      seats,
      status,
    } = req.body;

    if (from) trip.from = from;
    if (to) trip.to = to;
    if (transportType) trip.transportType = transportType;
    if (departureTime) trip.departureTime = departureTime;
    if (duration !== undefined) trip.duration = duration;
    if (price) trip.price = price;
    if (seats) {
      trip.seats = seats;
      // Update available seats proportionally
      const bookedSeats = trip.seats - trip.availableSeats;
      trip.availableSeats = seats - bookedSeats;
    }
    if (status) trip.status = status;

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating trip",
      error: error.message,
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Company only - own trips)
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check if user owns this trip
    if (trip.companyId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this trip",
      });
    }

    await trip.destroy();

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting trip",
      error: error.message,
    });
  }
};

// @desc    Get company's trips
// @route   GET /api/trips/company/my-trips
// @access  Private (Company only)
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: { companyId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get my trips error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your trips",
      error: error.message,
    });
  }
};
