const Trip = require("../models/Trip");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { Op } = require("sequelize");

/**
 * Recalculates and updates a trip's bookedSeats and availableSeats based on valid bookings.
 * Valid bookings are those that are 'confirmed' or 'pending' and less than 15 minutes old.
 */
const syncTripSeats = async (tripId) => {
  try {
    const trip = await Trip.findByPk(tripId);
    if (!trip) return null;

    // Find all bookings for this trip that should still occupy seats
    // 1. Confirmed bookings
    // 2. Pending bookings that are not expired (e.g., < 15 minutes old)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const validBookings = await Booking.findAll({
      where: {
        tripId,
        [Op.or]: [
          { bookingStatus: "confirmed" },
          {
            bookingStatus: "pending",
            createdAt: { [Op.gt]: fifteenMinutesAgo },
          },
        ],
      },
    });

    // Collect all seats from valid bookings
    let newlyBookedSeats = [];
    validBookings.forEach((booking) => {
      let seats = [];
      if (Array.isArray(booking.selectedSeats)) {
        seats = booking.selectedSeats;
      } else if (typeof booking.selectedSeats === "string") {
        try {
          seats = JSON.parse(booking.selectedSeats || "[]");
        } catch (e) {
          seats = [];
        }
      }
      newlyBookedSeats = [...newlyBookedSeats, ...seats];
    });

    // Remove duplicates
    newlyBookedSeats = [...new Set(newlyBookedSeats)];

    // Update trip record if changed
    const currentBookedCount = Array.isArray(trip.bookedSeats)
      ? trip.bookedSeats.length
      : JSON.parse(trip.bookedSeats || "[]").length;

    if (
      newlyBookedSeats.length !== currentBookedCount ||
      JSON.stringify(newlyBookedSeats.sort()) !==
        JSON.stringify((Array.isArray(trip.bookedSeats) ? trip.bookedSeats : JSON.parse(trip.bookedSeats || "[]")).sort())
    ) {
      trip.bookedSeats = newlyBookedSeats;
      trip.availableSeats = Math.max(0, trip.seats - newlyBookedSeats.length);
      await trip.save();
      console.log(`Synced seats for trip ${tripId}: ${newlyBookedSeats.length} occupied`);
    }

    return trip;
  } catch (error) {
    console.error("Error syncing trip seats:", error);
    return null;
  }
};

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

    // 1. Diagnostic Database Fetch
    let tripsFromDb = [];
    try {
      tripsFromDb = await Trip.findAll({
        where: { status: status || "active" },
        include: [{ model: User, as: "company", attributes: ["id", "name", "avatar"] }],
        order: [["createdAt", "DESC"]],
        limit: 1000
      });
    } catch (dbError) {
      console.error("Database Diagnostic Error:", dbError);
      return res.status(200).json({
        success: false,
        message: "Database Schema Conflict: " + dbError.message,
        debug: "One of your database columns might be missing or the 'company' relationship is broken.",
        trips: []
      });
    }

    // 2. JavaScript Filtering (Already proven stable)
    let results = tripsFromDb.map(t => (typeof t.toJSON === 'function' ? t.toJSON() : t));

    // Filter by FROM location (city, state, or country)
    if (from) {
      const sFrom = from.toLowerCase().trim();
      results = results.filter(t => 
        (t.from && t.from.toLowerCase().includes(sFrom)) ||
        (t.fromState && t.fromState.toLowerCase().includes(sFrom)) ||
        (t.fromCountry && t.fromCountry.toLowerCase().includes(sFrom))
      );
    }

    // Filter by TO location (including Multi-Stop logic, states, and countries)
    if (to) {
      const sTo = to.toLowerCase().trim();
      results = results.filter(t => {
        const matchesPrimary = 
          (t.to && t.to.toLowerCase().includes(sTo)) ||
          (t.toState && t.toState.toLowerCase().includes(sTo)) ||
          (t.toCountry && t.toCountry.toLowerCase().includes(sTo));
        if (matchesPrimary) return true;
        
        if (t.stops && Array.isArray(t.stops)) {
          return t.stops.some(stop => {
            if (typeof stop === 'string') return stop.toLowerCase().includes(sTo);
            if (stop && stop.city) return stop.city.toLowerCase().includes(sTo);
            return false;
          });
        }
        return false;
      });
    }

    // Filter by fromState
    if (fromState) {
      const sFromState = fromState.toLowerCase().trim();
      results = results.filter(t => t.fromState && t.fromState.toLowerCase().includes(sFromState));
    }

    // Filter by toState
    if (toState) {
      const sToState = toState.toLowerCase().trim();
      results = results.filter(t => t.toState && t.toState.toLowerCase().includes(sToState));
    }

    // Filter by fromCountry
    if (fromCountry) {
      const sFromCountry = fromCountry.toLowerCase().trim();
      results = results.filter(t => t.fromCountry && t.fromCountry.toLowerCase().includes(sFromCountry));
    }

    // Filter by toCountry
    if (toCountry) {
      const sToCountry = toCountry.toLowerCase().trim();
      results = results.filter(t => t.toCountry && t.toCountry.toLowerCase().includes(sToCountry));
    }

    // Filter by DATE
    if (date) {
      const searchDate = new Date(date);
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = daysOfWeek[searchDate.getUTCDay()];

      results = results.filter(t => {
        // Exact date match
        if (t.departureDate === date) return true;
        
        // Recurring trip match
        if (!t.departureDate && t.operatingDays && t.operatingDays.toLowerCase().includes(dayName.toLowerCase())) return true;
        
        // Carpooling is daily by default
        if (t.transportType === "carpooling") return true;

        return false;
      });
    }

    // Transform carpooling dates for UI consistency
    if (date) {
      results = results.map(t => {
        if (t.transportType === "carpooling") {
          return { ...t, departureDate: date };
        }
        return t;
      });
    }

    // 3. Handle Pagination on the final filtered list
    const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    
    const paginatedResults = results.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      count: results.length,
      currentPage: pageNum,
      totalPages: Math.ceil(results.length / limitNum),
      trips: paginatedResults,
    });
  } catch (error) {
    console.error("Get trips fatal error:", error);
    return res.status(500).json({
      success: false,
      message: "Server crash: " + error.message
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

    // Sync seats before returning to ensure accuracy (e.g., release expired pending seats)
    await syncTripSeats(req.params.id);
    
    // Refresh trip data after sync
    const refreshedTrip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "email", "avatar"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      trip: refreshedTrip || trip,
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
      vehiclePlateNumber,
      pickupAddress,
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

    // --- Document Verification & Notice Logic ---
    const user = await User.findByPk(req.user.id);
    if (user) {
      const requiredDocs = [
        "id_card", "drivers_license", "profile_photo", "proof_of_address", 
        "vehicle_license", "road_worthiness", "vehicle_photo", "guarantor_info", 
        "cac_certificate", "tin"
      ];
      
      const userDocs = user.documents || [];
      // If user.documents is a string, parse it
      let parsedDocs = userDocs;
      if (typeof userDocs === "string") {
        try { parsedDocs = JSON.parse(userDocs); } catch(e) { parsedDocs = []; }
      }
      
      const uploadedDocTypes = parsedDocs.map(d => d.type);
      const hasAllRequired = requiredDocs.every(doc => uploadedDocTypes.includes(doc));
      
      if (!hasAllRequired) {
        if (!user.documentDeadline) {
          // Issue notice automatically
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 7); // 7 days from now
          
          user.documentDeadline = deadline;
          user.documentNoticeIssuedAt = new Date();
          await user.save();
          
          // Optional: Create notification for the user
          const Notification = require("../models/Notification");
          try {
            await Notification.create({
              userId: user.id,
              message: "Notice: You have missing required verification documents. Please upload them within 7 days to avoid account penalty.",
              type: "system"
            });
          } catch (notifErr) {
            console.error("Failed to create document notice notification:", notifErr);
          }
        } else if (new Date() > new Date(user.documentDeadline)) {
          // Deadline has passed
          return res.status(403).json({
            success: false,
            message: "Your 1-week grace period to upload required documents has expired. Please upload all required documents in your profile to create a trip.",
          });
        }
      }
    }
    // --------------------------------------------


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
      vehiclePlateNumber: vehiclePlateNumber || null,
      pickupAddress: pickupAddress || null,
      preferences: req.body.preferences || {},
      stops: req.body.stops || [],
      companyId: req.user.id,
      driverContact: req.body.driverContact || null,
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
      vehiclePlateNumber,
      pickupAddress,
      driverContact,
      preferences,
      stops,
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
    if (vehiclePlateNumber !== undefined) trip.vehiclePlateNumber = vehiclePlateNumber;
    if (pickupAddress !== undefined) trip.pickupAddress = pickupAddress;
    if (driverContact !== undefined) trip.driverContact = driverContact;
    if (preferences !== undefined) trip.preferences = preferences;
    if (stops !== undefined) trip.stops = stops;
    
    if (seats !== undefined) {
      // Calculate booked seats BEFORE overwriting trip.seats
      const bookedSeats = (trip.seats || 0) - (trip.availableSeats || 0);
      trip.seats = seats;
      trip.availableSeats = Math.max(0, seats - bookedSeats);
    }
    
    // Check if the trip is being marked as completed
    const isCompleting = status === "completed" && trip.status !== "completed";
    if (status) trip.status = status;

    if (isCompleting) {
      // Mark all pending/confirmed bookings as completed so they don't block seats
      const Booking = require("../models/Booking");
      const { Op } = require("sequelize");
      await Booking.update(
        { bookingStatus: "completed" },
        { 
          where: { 
            tripId: trip.id, 
            bookingStatus: { [Op.in]: ["pending", "confirmed"] } 
          } 
        }
      );
      
      // Reset the seats for the next journey
      trip.bookedSeats = [];
      trip.availableSeats = trip.seats;
    }

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
      include: [
        {
          model: Booking,
          as: "bookings",
          attributes: ["id", "paymentStatus"],
          required: false,
        },
      ],
    });

    const tripsWithRevenue = trips.map((trip) => {
      const tripJSON = trip.toJSON ? trip.toJSON() : trip;
      const hasRevenue = tripJSON.bookings && tripJSON.bookings.some((b) => b.paymentStatus === "paid");
      delete tripJSON.bookings;
      return { ...tripJSON, hasRevenue };
    });

    res.status(200).json({
      success: true,
      count: tripsWithRevenue.length,
      trips: tripsWithRevenue,
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
exports.syncTripSeats = syncTripSeats;
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
    // Check if the trip is being marked as completed
    const isCompleting = status === "completed" && trip.status !== "completed";
    if (status !== undefined) trip.status = status;

    if (isCompleting) {
      // Mark all pending/confirmed bookings as completed so they don't block seats
      const Booking = require("../models/Booking");
      const { Op } = require("sequelize");
      await Booking.update(
        { bookingStatus: "completed" },
        { 
          where: { 
            tripId: trip.id, 
            bookingStatus: { [Op.in]: ["pending", "confirmed"] } 
          } 
        }
      );
      
      // Reset the seats for the next journey
      trip.bookedSeats = [];
      trip.availableSeats = trip.seats;
    }

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
