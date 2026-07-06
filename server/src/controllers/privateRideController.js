const PrivateRideRequest = require("../models/PrivateRideRequest");
const RideBid = require("../models/RideBid");
const User = require("../models/User");
const { Op } = require("sequelize");

const { sendPushNotification } = require("../utils/pushService");

// @desc    Create private ride request
// @route   POST /api/private-rides/request
// @access  Private (Traveler)
exports.createRequest = async (req, res) => {
  try {
    const { pickupState, pickupLocation, destinationState, destination, stops, pickupDate, pickupTime, rideType, passengersCount, luggageInfo, specialNotes, needsAC } = req.body;
    
    const request = await PrivateRideRequest.create({
      passengerId: req.user.id,
      pickupState,
      pickupLocation,
      destinationState,
      destination,
      stops,
      pickupDate,
      pickupTime,
      rideType,
      passengersCount,
      luggageInfo,
      specialNotes,
      needsAC
    });

    // Find all online drivers who accept private rides
    const onlineDrivers = await User.findAll({
      where: {
        role: "company",
        isOnline: true,
        ridePreference: { [Op.in]: ["private", "both"] },
        pushSubscription: { [Op.ne]: null }
      }
    });

    // Send push notification to all matching drivers
    const pushPromises = onlineDrivers.map(driver => {
      return sendPushNotification(driver.pushSubscription, {
        title: "New Private Ride Request!",
        body: `Pickup: ${pickupLocation}\nDropoff: ${destination}`,
        url: "/company/driver-console"
      });
    });

    // Execute push notifications asynchronously without blocking the response
    Promise.allSettled(pushPromises).catch(err => console.error("Push Error:", err));

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error("Create Private Ride Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get nearby/available drivers
// @route   GET /api/private-rides/nearby-drivers
// @access  Private (Traveler)
exports.getNearbyDrivers = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: {
        role: "company",
        isOnline: true,
        ridePreference: { [Op.in]: ["private", "both"] }
      },
      attributes: ["id", "name", "email", "phone", "avatar", "vehicles"]
    });
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    console.error("Get Nearby Drivers Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Driver bid on request
// @route   POST /api/private-rides/:id/bid
// @access  Private (Company)
exports.placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const requestId = req.params.id;
    
    // Validate request exists
    const request = await PrivateRideRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const bid = await RideBid.create({
      requestId,
      driverId: req.user.id,
      bidAmount
    });

    res.status(201).json({ success: true, bid });
  } catch (error) {
    console.error("Place Bid Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Passenger accept bid
// @route   POST /api/private-rides/bids/:bidId/accept
// @access  Private (Traveler)
exports.acceptBid = async (req, res) => {
  try {
    const bidId = req.params.bidId;
    const bid = await RideBid.findByPk(bidId, { include: ["request"] });
    
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }
    
    if (bid.request.passengerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Update request
    bid.request.agreedPrice = bid.bidAmount;
    bid.request.status = "awaiting_payment";
    await bid.request.save();

    // Update bid status
    bid.status = "accepted";
    await bid.save();

    // Reject other bids
    await RideBid.update(
      { status: "rejected" },
      { where: { requestId: bid.requestId, id: { [Op.ne]: bid.id } } }
    );

    res.status(200).json({ success: true, request: bid.request });
  } catch (error) {
    console.error("Accept Bid Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update ride status (en_route, arrived, started, completed)
// @route   PUT /api/private-rides/:id/status
// @access  Private (Company)
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PrivateRideRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (request.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Update Ride Status Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Passenger cancel request
// @route   POST /api/private-rides/:id/cancel
// @access  Private (Traveler)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await PrivateRideRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    
    if (request.passengerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (request.status !== "searching" && request.status !== "awaiting_payment") {
      return res.status(400).json({ success: false, message: "Can only cancel requests that are searching or awaiting payment" });
    }

    // If there is an accepted bid, we should probably mark it as rejected or cancelled
    if (request.status === "awaiting_payment") {
      await RideBid.update({ status: "rejected" }, { where: { requestId: request.id, status: "accepted" }});
    }

    request.status = "cancelled";
    await request.save();

    res.status(200).json({ success: true, message: "Request cancelled" });
  } catch (error) {
    console.error("Cancel Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get passenger's or driver's ride requests
// @route   GET /api/private-rides
// @access  Private
exports.getMyRides = async (req, res) => {
  try {
    const isCompany = req.user.role === "company";
    const where = isCompany 
      ? { 
          [Op.or]: [
            { status: "searching" },
            { driverId: req.user.id }
          ]
        } 
      : { passengerId: req.user.id };

    // Include bids if it's a passenger so they can see driver responses
    const requests = await PrivateRideRequest.findAll({
      where,
      include: [
        { model: User, as: isCompany ? "passenger" : "driver", attributes: ["name", "phone", "avatar"] },
        { model: RideBid, as: "bids", include: [{ model: User, as: "driver", attributes: ["name", "phone", "avatar", "vehicles"] }] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Get My Rides Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);

// @desc    Initialize Paystack for Private Ride
// @route   POST /api/private-rides/:id/pay
// @access  Private (Traveler)
exports.initializePayment = async (req, res) => {
  try {
    const request = await PrivateRideRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.passengerId !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });
    if (!request.agreedPrice) return res.status(400).json({ success: false, message: "Price not agreed yet" });

    const response = await paystack.transaction.initialize({
      amount: request.agreedPrice * 100, // in kobo
      email: req.user.email,
      metadata: { privateRideId: request.id },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Initialize Private Ride Payment Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Verify Paystack for Private Ride
// @route   GET /api/private-rides/verify/:reference
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await paystack.transaction.verify({ reference });

    if (response.data.status === "success") {
      const privateRideId = response.data.metadata?.privateRideId || req.query.privateRideId;
      if (!privateRideId) {
        return res.status(400).json({ success: false, message: "Private Ride ID missing" });
      }

      const request = await PrivateRideRequest.findByPk(privateRideId, {
        include: [{ model: RideBid, as: "bids", where: { status: "accepted" }, required: false }]
      });
      
      if (request) {
        request.paymentStatus = "paid";
        request.status = "driver_assigned"; // Officially assign driver now

        // Find the accepted bid and assign the driver
        if (request.bids && request.bids.length > 0) {
          request.driverId = request.bids[0].driverId;
        }

        // Calculate 20% commission on the agreed price
        request.commissionAmount = request.agreedPrice * 0.20;
        await request.save();
      }

      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Verify Private Ride Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment verification error", error: error.message });
  }
};
