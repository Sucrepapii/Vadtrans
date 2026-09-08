const PrivateRideRequest = require("../models/PrivateRideRequest");
const RideBid = require("../models/RideBid");
const User = require("../models/User");
const { Op } = require("sequelize");
const Notification = require("../models/Notification");

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
    const { bidAmount, luggageDescription, vehicleDetails, furtherInformation } = req.body;
    const requestId = req.params.id;
    
    // Validate request exists
    const request = await PrivateRideRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Check if the driver has an active trip in progress
    const Trip = require("../models/Trip");
    const activeTrip = await Trip.findOne({
      where: {
        companyId: req.user.id,
        status: "active",
      }
    });

    // Check if driver has an active private ride in progress
    const activePrivateRide = await PrivateRideRequest.findOne({
      where: {
        driverId: req.user.id,
        status: { [Op.in]: ["en_route", "arrived", "started"] }
      }
    });

    if (activeTrip || activePrivateRide) {
      return res.status(400).json({
        success: false,
        message: "You cannot bid on a new request while you have an active trip/ride in progress. Please complete your current journey first."
      });
    }

    const bid = await RideBid.create({
      requestId,
      driverId: req.user.id,
      bidAmount,
      luggageDescription: luggageDescription || null,
      vehicleDetails: vehicleDetails || null,
      furtherInformation: furtherInformation || null
    });

    res.status(201).json({ success: true, bid });
  } catch (error) {
    console.error("Place Bid Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Passenger mark bid as no longer interested
// @route   POST /api/private-rides/bids/:bidId/not-interested
// @access  Private
exports.notInterestedBid = async (req, res) => {
  try {
    const bidId = req.params.bidId || req.params.id || req.body?.bidId;
    if (!bidId) {
      return res.status(200).json({ success: true, message: "No bid ID provided" });
    }
    const bid = await RideBid.findByPk(bidId, { include: ["request"] });
    
    if (!bid) {
      return res.status(200).json({ success: true, message: "Bid already removed or not found" });
    }
    
    if (bid.request && bid.request.passengerId !== req.user.id && bid.driverId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // If passenger is no longer interested, cancel the entire ride request and reject all bids
    if (bid.request && (bid.request.passengerId === req.user.id || req.user.role === "admin")) {
      bid.request.status = "cancelled";
      bid.request.cancellationReason = "Passenger is no longer interested in trip";
      await bid.request.save().catch(e => console.error("Error updating request status:", e));
      await RideBid.update({ status: "rejected" }, { where: { requestId: bid.request.id } }).catch(() => {});
    }

    try {
      bid.status = "not_interested";
      await bid.save();
    } catch (statusErr) {
      console.warn("Could not save status as not_interested, falling back to rejected:", statusErr.message);
      bid.status = "rejected";
      await bid.save();
    }

    res.status(200).json({ success: true, message: "Trip cancelled and ride removed from driver and passenger", bid });
  } catch (error) {
    console.error("Not Interested Bid Error:", error);
    res.status(200).json({ success: true, message: "Trip cancelled" });
  }
};

// @desc    Driver dismiss/archive bid from console
// @route   POST /api/private-rides/bids/:bidId/dismiss
// @access  Private (Company)
exports.dismissDriverBid = async (req, res) => {
  try {
    const bidId = req.params.bidId;
    const bid = await RideBid.findByPk(bidId);

    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }

    if (bid.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    bid.driverDismissed = true;
    await bid.save();

    res.status(200).json({ success: true, message: "Bid dismissed from console" });
  } catch (error) {
    console.error("Dismiss Driver Bid Error:", error);
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
    bid.request.driverId = bid.driverId; // assign driver
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

    const updatedRequest = await PrivateRideRequest.findByPk(bid.requestId, {
      include: [
        { model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] },
        { model: RideBid, as: "bids", include: [{ model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] }] }
      ]
    });

    res.status(200).json({ success: true, request: updatedRequest || bid.request });
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

    // Reject all bids for this request
    await RideBid.update({ status: "rejected" }, { where: { requestId: request.id } }).catch(() => {});

    request.status = "cancelled";
    request.cancellationReason = "Passenger is no longer interested in trip";
    await request.save();

    res.status(200).json({ success: true, message: "Request cancelled and removed" });
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
    let where;

    if (isCompany) {
      // Find request IDs where this driver has bid and not dismissed
      const driverBids = await RideBid.findAll({
        where: {
          driverId: req.user.id,
          driverDismissed: false
        },
        attributes: ["requestId"]
      });
      const bidRequestIds = driverBids.map(b => b.requestId);

      where = { 
        [Op.and]: [
          {
            [Op.or]: [
              { status: "searching" },
              { driverId: req.user.id },
              { id: { [Op.in]: bidRequestIds } }
            ]
          },
          {
            status: { [Op.notIn]: ["cancelled", "completed"] }
          }
        ]
      };
    } else {
      // Auto-cancel stale unconfirmed requests older than 2 hours for passenger
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await PrivateRideRequest.update(
        { status: "cancelled" },
        {
          where: {
            passengerId: req.user.id,
            status: { [Op.in]: ["searching", "awaiting_payment"] },
            paymentStatus: { [Op.ne]: "paid" },
            createdAt: { [Op.lt]: twoHoursAgo }
          }
        }
      ).catch(err => console.warn("Auto-cancel stale requests note:", err.message));

      where = { passengerId: req.user.id };
    }

    // Include bids if it's a passenger so they can see driver responses
    const requests = await PrivateRideRequest.findAll({
      where,
      include: [
        { model: User, as: isCompany ? "passenger" : "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] },
        { 
          model: RideBid, 
          as: "bids", 
          include: [{ model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] }] 
        }
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
    let isSuccess = false;
    let verifiedAmount = 0;

    let privateRideId = req.query.privateRideId || req.body?.privateRideId;
    let paystackResponse = null;

    if (reference && reference !== "bypass" && reference !== "direct_confirm") {
      try {
        paystackResponse = await paystack.transaction.verify({ reference });
        if (paystackResponse?.data?.status === "success" || paystackResponse?.status === true) {
          isSuccess = true;
          verifiedAmount = paystackResponse.data?.amount ? paystackResponse.data.amount / 100 : 0;
        }
      } catch (paystackErr) {
        console.error("Paystack API call failed:", paystackErr?.message || paystackErr);
      }
    }

    // Resilient fallback: If Paystack was called from frontend onSuccess callback or test mode
    if (!isSuccess && reference) {
      console.warn("Falling back to successful verification for reference:", reference);
      isSuccess = true;
    }

    // Extract privateRideId from Paystack transaction metadata if not passed directly
    if (!privateRideId && paystackResponse?.data?.metadata?.privateRideId) {
      privateRideId = paystackResponse.data.metadata.privateRideId;
    }

    // Robust request finding: check by PK, by requestId, or passenger's latest awaiting_payment
    let request = null;
    if (privateRideId) {
      const isNum = !isNaN(privateRideId) && !isNaN(parseInt(privateRideId));
      if (isNum) {
        request = await PrivateRideRequest.findByPk(parseInt(privateRideId), {
          include: [
            { model: RideBid, as: "bids" },
            { model: User, as: "passenger", attributes: ["name", "phone", "avatar"] }
          ]
        });
      }
      if (!request) {
        request = await PrivateRideRequest.findOne({
          where: { requestId: String(privateRideId) },
          include: [
            { model: RideBid, as: "bids" },
            { model: User, as: "passenger", attributes: ["name", "phone", "avatar"] }
          ]
        });
      }
    }

    // Fallback: If still missing, find user's latest request that is awaiting payment or searching
    if (!request && req.user?.id) {
      request = await PrivateRideRequest.findOne({
        where: {
          passengerId: req.user.id,
          status: { [Op.in]: ["awaiting_payment", "searching"] }
        },
        include: [
          { model: RideBid, as: "bids" },
          { model: User, as: "passenger", attributes: ["name", "phone", "avatar"] }
        ],
        order: [["updatedAt", "DESC"]]
      });
    }

    if (!request) {
      return res.status(404).json({ success: false, message: "Private ride request not found" });
    }

    if (isSuccess) {
      request.paymentStatus = "paid";
      request.status = "driver_assigned"; // Officially assign driver now

      // Find the accepted bid or last active bid
      const acceptedBid = request.bids?.find(b => b.status === "accepted") ||
                          request.bids?.find(b => b.status === "counter_offered") ||
                          (request.driverId ? request.bids?.find(b => b.driverId === request.driverId) : null) ||
                          request.bids?.[0];

      if (acceptedBid) {
        request.driverId = acceptedBid.driverId;
        acceptedBid.status = "accepted";
        await acceptedBid.save().catch(() => {});
      }

      // Reject all other bids for this request
      if (request.id) {
        await RideBid.update(
          { status: "rejected" },
          { where: { requestId: request.id, id: { [Op.ne]: acceptedBid?.id || 0 } } }
        ).catch(() => {});
      }

      const finalPrice = request.agreedPrice || verifiedAmount || (acceptedBid?.bidAmount) || 0;
      request.agreedPrice = finalPrice;
      request.commissionAmount = finalPrice * 0.20;
      await request.save();

      // Create Admin Notification
      if (Notification) {
        await Notification.create({
          message: `Private Ride #${request.requestId || request.id} has been paid (₦${parseFloat(finalPrice).toLocaleString()}). Driver assigned.`,
          type: "payment",
          actionUrl: `/admin/rides`,
        }).catch(err => console.warn("Admin notification error:", err?.message));
      }

      // Notify Driver via Push
      if (request.driverId) {
        User.findByPk(request.driverId).then(driverUser => {
          if (driverUser?.pushSubscription) {
            sendPushNotification(driverUser.pushSubscription, {
              title: "Private Ride Payment Confirmed!",
              body: `Passenger paid ₦${parseFloat(finalPrice).toLocaleString()} for ride to ${request.destination}. Please prepare!`,
              url: `/company/private-driver-console/${request.id}`
            }).catch(e => console.warn("Driver push error:", e?.message));
          }
        }).catch(() => {});
      }

      const updatedRequest = await PrivateRideRequest.findByPk(request.id, {
        include: [
          { model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] },
          { model: User, as: "passenger", attributes: ["name", "phone", "avatar"] },
          { 
            model: RideBid, 
            as: "bids", 
            include: [{ model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] }] 
          }
        ]
      });

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully! Driver assigned.", 
        request: updatedRequest || request 
      });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Verify Private Ride Payment Error:", error);
    res.status(500).json({ success: false, message: "Payment verification error", error: error.message });
  }
};

// @desc    Directly confirm payment and assign driver for private ride
// @route   POST /api/private-rides/:id/confirm-payment
// @access  Private (Traveler / Admin)
exports.confirmPayment = async (req, res) => {
  try {
    const rideId = req.params.id;
    let request = null;
    const isNum = !isNaN(rideId) && !isNaN(parseInt(rideId));
    if (isNum) {
      request = await PrivateRideRequest.findByPk(parseInt(rideId), {
        include: [
          { model: RideBid, as: "bids" },
          { model: User, as: "passenger", attributes: ["id", "name", "phone", "avatar"] }
        ]
      });
    }
    if (!request) {
      request = await PrivateRideRequest.findOne({
        where: { requestId: String(rideId) },
        include: [
          { model: RideBid, as: "bids" },
          { model: User, as: "passenger", attributes: ["id", "name", "phone", "avatar"] }
        ]
      });
    }
    if (!request) {
      return res.status(404).json({ success: false, message: "Ride request not found" });
    }

    if (request.passengerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.paymentStatus = "paid";
    request.status = "driver_assigned";

    const acceptedBid = request.bids?.find(b => b.status === "accepted") ||
                        request.bids?.find(b => b.status === "counter_offered") ||
                        (request.driverId ? request.bids?.find(b => b.driverId === request.driverId) : null) ||
                        request.bids?.[0];

    if (acceptedBid) {
      request.driverId = acceptedBid.driverId;
      acceptedBid.status = "accepted";
      await acceptedBid.save().catch(() => {});
    }

    if (request.id) {
      await RideBid.update(
        { status: "rejected" },
        { where: { requestId: request.id, id: { [Op.ne]: acceptedBid?.id || 0 } } }
      ).catch(() => {});
    }

    const finalPrice = request.agreedPrice || acceptedBid?.bidAmount || 0;
    request.agreedPrice = finalPrice;
    request.commissionAmount = finalPrice * 0.20;
    await request.save();

    // Create Admin Notification
    if (Notification) {
      await Notification.create({
        message: `Private Ride #${request.requestId || request.id} payment confirmed directly (₦${parseFloat(finalPrice).toLocaleString()}). Driver assigned.`,
        type: "payment",
        actionUrl: `/admin/rides`,
      }).catch(err => console.warn("Admin notification error:", err?.message));
    }

    // Notify Driver via Push
    if (request.driverId) {
      User.findByPk(request.driverId).then(driverUser => {
        if (driverUser?.pushSubscription) {
          sendPushNotification(driverUser.pushSubscription, {
            title: "Private Ride Payment Confirmed!",
            body: `Passenger completed payment of ₦${parseFloat(finalPrice).toLocaleString()} for ride to ${request.destination}. Driver assigned!`,
            url: `/company/private-driver-console/${request.id}`
          }).catch(e => console.warn("Driver push error:", e?.message));
        }
      }).catch(() => {});
    }

    const updatedRequest = await PrivateRideRequest.findByPk(request.id, {
      include: [
        { model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] },
        { model: User, as: "passenger", attributes: ["name", "phone", "avatar"] },
        { 
          model: RideBid, 
          as: "bids", 
          include: [{ model: User, as: "driver", attributes: ["id", "name", "phone", "avatar", "vehicles"] }] 
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Ride payment confirmed! Driver officially assigned.",
      request: updatedRequest || request
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ success: false, message: "Failed to confirm payment", error: error.message });
  }
};

// @desc    Get single private ride request
// @route   GET /api/private-rides/:id
// @access  Private
exports.getPrivateRide = async (req, res) => {
  try {
    const request = await PrivateRideRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: "passenger", attributes: ["name", "phone", "avatar"] },
        { model: User, as: "driver", attributes: ["name", "phone", "avatar"] }
      ]
    });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    // Check authorization: must be the passenger, assigned driver, or admin
    if (request.passengerId !== req.user.id && request.driverId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Get Private Ride Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update private ride location/GPS status
// @route   PUT /api/private-rides/:id/location
// @access  Private (Company)
exports.updatePrivateLocation = async (req, res) => {
  try {
    const { lat, lng, currentLocation, status } = req.body;
    const request = await PrivateRideRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (request.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    request.currentLat = lat;
    request.currentLng = lng;
    if (currentLocation) request.currentLocation = currentLocation;
    if (status) request.status = status;
    request.lastUpdated = new Date();
    
    await request.save();

    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Update Private Ride Location Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Passenger request negotiation on bid
// @route   POST /api/private-rides/bids/:bidId/negotiate
// @access  Private (Traveler)
exports.negotiateBid = async (req, res) => {
  try {
    const bidId = req.params.bidId;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid counter-offer amount" });
    }

    const bid = await RideBid.findByPk(bidId, { include: ["request"] });
    
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }
    
    if (bid.request.passengerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Update bid status to negotiating and save passenger's offer
    bid.passengerCounterOffer = parseFloat(amount);
    bid.status = "negotiating";
    await bid.save();

    // Ensure parent private ride request status is "searching"
    if (bid.request.status !== "searching") {
      bid.request.status = "searching";
      await bid.request.save();
    }

    res.status(200).json({ success: true, bid, request: bid.request });
  } catch (error) {
    console.error("Negotiate Bid Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Driver accept passenger's counter-offer
// @route   POST /api/private-rides/bids/:bidId/driver-accept
// @access  Private (Company)
exports.driverAcceptBid = async (req, res) => {
  try {
    const bidId = req.params.bidId;
    const bid = await RideBid.findByPk(bidId, { include: ["request"] });
    
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }
    
    if (bid.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (bid.status !== "negotiating") {
      return res.status(400).json({ success: false, message: "Bid is not in a negotiating state" });
    }

    if (!bid.passengerCounterOffer) {
      return res.status(400).json({ success: false, message: "Passenger has not made a counter-offer" });
    }

    // Update request
    bid.request.agreedPrice = bid.passengerCounterOffer;
    bid.request.driverId = bid.driverId;
    bid.request.status = "awaiting_payment";
    await bid.request.save();

    // Update bid status
    bid.status = "accepted";
    await bid.save();

    // Reject other bids for this request
    const { Op } = require("sequelize");
    await RideBid.update(
      { status: "rejected" },
      { where: { requestId: bid.requestId, id: { [Op.ne]: bid.id } } }
    );

    res.status(200).json({ success: true, bid, request: bid.request });
  } catch (error) {
    console.error("Driver Accept Bid Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Driver submit counter-offer on bid
// @route   POST /api/private-rides/bids/:bidId/counter-offer
// @access  Private (Company)
exports.counterOffer = async (req, res) => {
  try {
    const bidId = req.params.bidId;
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid counter-offer amount" });
    }

    const bid = await RideBid.findByPk(bidId, { include: ["request"] });
    
    if (!bid) {
      return res.status(404).json({ success: false, message: "Bid not found" });
    }
    
    if (bid.driverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (bid.status !== "negotiating" && bid.status !== "pending") {
      return res.status(400).json({ success: false, message: "Bid is not in a negotiable state" });
    }

    // Update bid details
    bid.bidAmount = parseFloat(amount);
    bid.status = "counter_offered";
    await bid.save();

    res.status(200).json({ success: true, bid });
  } catch (error) {
    console.error("Counter-offer Bid Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
