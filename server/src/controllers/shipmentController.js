const Shipment = require("../models/Shipment");
const Trip = require("../models/Trip");
const User = require("../models/User");

// @desc    Create new freight shipment
// @route   POST /api/shipments
// @access  Private (Traveler/Sender)
exports.createShipment = async (req, res) => {
  try {
    const {
      tripId,
      senderDetails,
      receiverDetails,
      cargoDetails,
      paymentMethod,
      totalAmount,
    } = req.body;

    if (
      !tripId ||
      !senderDetails ||
      !receiverDetails ||
      !cargoDetails ||
      !paymentMethod ||
      !totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Freight provider (Trip) not found",
      });
    }

    if (trip.serviceCategory !== "freight") {
      return res.status(400).json({
        success: false,
        message: "Selected service is not a freight service",
      });
    }

    // Determine initial payment status depending on method
    let initialPaymentStatus = "pending";
    if (paymentMethod === "pay_on_delivery") {
      initialPaymentStatus = "pending";
    }

    const shipment = await Shipment.create({
      userId: req.user.id,
      tripId,
      senderDetails,
      receiverDetails,
      cargoDetails,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      totalAmount,
      trackingStatus: "pending_approval",
    });

    res.status(201).json({
      success: true,
      message: "Shipment booked successfully",
      shipment: {
        id: shipment.id,
        trackingId: shipment.trackingId,
        paymentStatus: shipment.paymentStatus,
        totalAmount: shipment.totalAmount,
      },
    });
  } catch (error) {
    console.error("Create shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating shipment",
      error: error.message,
    });
  }
};

// @desc    Get tracking info (Public)
// @route   GET /api/shipments/track/:trackingId
// @access  Public
exports.getShipmentByTrackingId = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      where: { trackingId: req.params.trackingId },
      include: [
        {
          model: Trip,
          as: "trip",
          include: [
            {
              model: User,
              as: "company",
              attributes: ["id", "name", "phone", "email"],
            },
          ],
        },
      ],
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found with this tracking ID",
      });
    }

    res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    console.error("Track shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding shipment",
      error: error.message,
    });
  }
};

// @desc    Get current user's (sender) shipments
// @route   GET /api/shipments/me
// @access  Private (Traveler/Sender)
exports.getMyShipments = async (req, res) => {
  try {
    const shipments = await Shipment.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Trip,
          as: "trip",
          include: [
            {
              model: User,
              as: "company",
              attributes: ["name", "phone"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    console.error("Get my shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your shipments",
      error: error.message,
    });
  }
};

// @desc    Get company's shipments
// @route   GET /api/shipments/company
// @access  Private (Company only)
exports.getCompanyShipments = async (req, res) => {
  try {
    // 1. Find all trips owned by this company
    const myTrips = await Trip.findAll({
      where: { companyId: req.user.id },
      attributes: ["id"],
    });

    const tripIds = myTrips.map((t) => t.id);

    // 2. Find all shipments for those trips
    const shipments = await Shipment.findAll({
      where: { tripId: tripIds },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Trip,
          as: "trip",
        },
        {
          model: User,
          as: "sender",
          attributes: ["name", "email", "phone"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    console.error("Get company shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company shipments",
      error: error.message,
    });
  }
};

// @desc    Get all shipments (Admin)
// @route   GET /api/shipments/admin
// @access  Private (Admin only)
exports.getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Trip,
          as: "trip",
          include: [
            {
              model: User,
              as: "company",
              attributes: ["name", "phone"],
            },
          ],
        },
        {
          model: User,
          as: "sender",
          attributes: ["name", "email", "phone"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    console.error("Get all shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all shipments",
      error: error.message,
    });
  }
};

// @desc    Update shipment status
// @route   PUT /api/shipments/:id/status
// @access  Private (Company/Admin)
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { trackingStatus, statusMessage, paymentStatus } = req.body;
    const shipment = await Shipment.findByPk(req.params.id, {
      include: [{ model: Trip, as: "trip" }],
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Verify company owns this shipment
    if (shipment.trip.companyId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this shipment",
      });
    }

    if (trackingStatus) shipment.trackingStatus = trackingStatus;
    if (statusMessage) shipment.statusMessage = statusMessage;
    if (paymentStatus) shipment.paymentStatus = paymentStatus;

    await shipment.save();

    res.status(200).json({
      success: true,
      message: "Shipment status updated successfully",
      shipment,
    });
  } catch (error) {
    console.error("Update shipment status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating shipment status",
      error: error.message,
    });
  }
};

// @desc    Verify Paystack Payment and Update Shipment Payment Status
// @route   POST /api/shipments/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { reference, shipmentId } = req.body;

    if (!reference || !shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide payment reference and shipment ID",
      });
    }

    const shipment = await Shipment.findByPk(shipmentId);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Very basic verify for Paystack demo. In production, make a backend call to Paystack.
    // Assuming Paystack frontend SDK already returned success, we update the status.
    shipment.paymentStatus = "paid";
    shipment.paymentReference = reference;

    // Auto-approve if paid
    if (shipment.trackingStatus === "pending_approval") {
      shipment.trackingStatus = "pickup";
      shipment.statusMessage =
        "Payment confirmed. Shipment waiting for pickup.";
    }

    await shipment.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      shipment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};
