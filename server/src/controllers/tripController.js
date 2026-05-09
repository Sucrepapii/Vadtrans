const Trip = require("../models/Trip");
const User = require("../models/User");
const { Op } = require("sequelize");

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getAllTrips = async (req, res) => {
  try {
    const {
      from,
      to,
      transportType,
      status,
      serviceCategory,
      freightType,
      companyId,
      fromCountry,
      toCountry,
      fromState,
      toState,
      date
    } = req.query;

    const where = {};

    if (serviceCategory) where.serviceCategory = serviceCategory;
    if (freightType) where.freightType = freightType;
    if (companyId) where.companyId = companyId;

    // Filter by from location
    if (fromCountry) where.fromCountry = fromCountry;
    if (fromState) where.fromState = fromState;
    if (from) where.from = { [Op.like]: `%${from}%` };

    // Filter by to location
    if (toCountry) where.toCountry = toCountry;
    if (toState) where.toState = toState;
    if (to) where.to = { [Op.like]: `%${to}%` };

    // Filter by transportType in DB
    if (transportType && transportType !== "all") {
      where.transportType = transportType;
    }

    // Filter by departureDate if provided
    if (date) {
      const searchDate = new Date(date);
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = daysOfWeek[searchDate.getUTCDay()];

      where[Op.or] = [
        { departureDate: date }, // Matches exact date
        {
          departureDate: null,
          operatingDays: {
            [Op.like]: `%${dayName}%`, // Matches operating day
          },
        },
      ];
    }

    // Filter by status (default to active only)
    where.status = status || "active";

    console.log("Fetching trips with where clause:", where);

    const trips = await Trip.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "email", "avatar"],
        },
      ],
      limit: 100, // Safety limit
    });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips: trips,
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
          attributes: ["id", "name", "email", "avatar"],
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
    const {
      from,
      to,
      transportType,
      departureTime,
      departureDate,
      operatingDays,
      duration,
      price,
      seats,
      vehicleType,
      vehicleName,
      terminal,
      city,
      state,
      documentPrices,
      serviceCategory,
      freightType,
      baseFare,
      pricePerKg,
      minCharge,
      maxWeightCapacity,
      fromCountry,
      toCountry,
      fromState,
      toState,
      timeWindowStart,
      timeWindowEnd,
      minSeats,
      depositAmount,
      cancellationWindow,
      confirmationWindow,
    } = req.body;

    // Validate required fields
    const isFreight = serviceCategory === "freight";
    const hasRequiredLocations = from && to && transportType && departureTime;
    
    // Check for passenger required fields
    const hasPassengerInfo = !isFreight && price !== undefined && seats !== undefined;
    // Check for freight required fields
    const hasFreightInfo = isFreight && baseFare !== undefined && pricePerKg !== undefined && minCharge !== undefined && maxWeightCapacity !== undefined;

    if (!hasRequiredLocations || (!isFreight && !hasPassengerInfo) && !(isFreight && hasFreightInfo)) {
      // Allow passing if either passenger or freight info is complete
      if (!hasRequiredLocations || (!hasPassengerInfo && !hasFreightInfo)) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields for the selected category",
        });
      }
    }

    const trip = await Trip.create({
      from,
      to,
      transportType,
      departureTime,
      departureDate: departureDate || null,
      operatingDays: operatingDays || null,
      duration: duration || null,
      price: isFreight ? minCharge : price, // For freight, we can use minCharge as the 'starting' price
      seats: seats || 0,
      availableSeats: seats || 0,
      vehicleType: vehicleType || "Bus",
      vehicleName: vehicleName || null,
      terminal: terminal || null,
      city: city || null,
      state: state || null,
      documentPrices: documentPrices || null,
      serviceCategory: serviceCategory || "passenger",
      freightType: freightType || null,
      baseFare: isFreight ? baseFare : null,
      pricePerKg: isFreight ? pricePerKg : null,
      minCharge: isFreight ? minCharge : null,
      maxWeightCapacity: isFreight ? maxWeightCapacity : null,
      fromCountry: fromCountry || "Nigeria",
      toCountry: toCountry || null,
      fromState: fromState || null,
      toState: toState || null,
      timeWindowStart: timeWindowStart || null,
      timeWindowEnd: timeWindowEnd || null,
      minSeats: minSeats || 1,
      depositAmount: depositAmount || 0,
      cancellationWindow: cancellationWindow || 12,
      confirmationWindow: confirmationWindow || 2,
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
      departureDate,
      operatingDays,
      duration,
      price,
      seats,
      status,
      vehicleType,
      vehicleName,
      terminal,
      city,
      state,
      documentPrices,
      serviceCategory,
      freightType,
      baseFare,
      pricePerKg,
      minCharge,
      maxWeightCapacity,
      fromCountry,
      toCountry,
      fromState,
      toState,
      timeWindowStart,
      timeWindowEnd,
      minSeats,
      depositAmount,
      cancellationWindow,
      confirmationWindow,
    } = req.body;

    if (from) trip.from = from;
    if (to) trip.to = to;
    if (transportType) trip.transportType = transportType;
    if (departureTime) trip.departureTime = departureTime;
    if (departureDate !== undefined) trip.departureDate = departureDate || null;
    if (operatingDays !== undefined) trip.operatingDays = operatingDays;
    if (duration !== undefined) trip.duration = duration;
    if (price !== undefined) trip.price = price;
    if (vehicleType !== undefined) trip.vehicleType = vehicleType;
    if (vehicleName !== undefined) trip.vehicleName = vehicleName;
    if (terminal !== undefined) trip.terminal = terminal;
    if (city !== undefined) trip.city = city;
    if (state !== undefined) trip.state = state;
    if (documentPrices !== undefined) trip.documentPrices = documentPrices;
    if (serviceCategory !== undefined) trip.serviceCategory = serviceCategory;
    if (freightType !== undefined) trip.freightType = freightType;
    if (baseFare !== undefined) trip.baseFare = baseFare;
    if (pricePerKg !== undefined) trip.pricePerKg = pricePerKg;
    if (minCharge !== undefined) trip.minCharge = minCharge;
    if (maxWeightCapacity !== undefined) trip.maxWeightCapacity = maxWeightCapacity;
    if (fromCountry !== undefined) trip.fromCountry = fromCountry;
    if (toCountry !== undefined) trip.toCountry = toCountry;
    if (fromState !== undefined) trip.fromState = fromState;
    if (toState !== undefined) trip.toState = toState;
    if (timeWindowStart !== undefined) trip.timeWindowStart = timeWindowStart;
    if (timeWindowEnd !== undefined) trip.timeWindowEnd = timeWindowEnd;
    if (minSeats !== undefined) trip.minSeats = minSeats;
    if (depositAmount !== undefined) trip.depositAmount = depositAmount;
    if (cancellationWindow !== undefined) trip.cancellationWindow = cancellationWindow;
    if (confirmationWindow !== undefined) trip.confirmationWindow = confirmationWindow;
    
    if (seats !== undefined) {
      // Calculate booked seats BEFORE overwriting trip.seats
      const bookedSeats = (trip.seats || 0) - (trip.availableSeats || 0);
      trip.seats = seats;
      trip.availableSeats = Math.max(0, seats - bookedSeats);
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
      detail:
        error.name === "SequelizeDatabaseError" ? error.parent.message : null,
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
// @desc    Update trip location (for live tracking)
// @route   PUT /api/trips/:id/location
// @access  Private (Company only - own trips)
exports.updateTripLocation = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check ownership
    if (trip.companyId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this trip",
      });
    }

    const { lat, lng, currentLocation, status } = req.body;

    if (lat !== undefined) trip.currentLat = lat;
    if (lng !== undefined) trip.currentLng = lng;
    if (currentLocation !== undefined) trip.currentLocation = currentLocation;
    if (status !== undefined) trip.status = status;

    trip.lastUpdated = new Date();

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Location updated",
      trip,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating location",
      error: error.message,
    });
  }
};
