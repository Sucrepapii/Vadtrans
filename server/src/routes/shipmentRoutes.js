const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  createShipment,
  getShipmentByTrackingId,
  getMyShipments,
  getCompanyShipments,
  getAllShipments,
  updateShipmentStatus,
  verifyPayment,
} = require("../controllers/shipmentController");

const router = express.Router();

// Public route for anyone to track
router.get("/track/:trackingId", getShipmentByTrackingId);

// Protected routes (Traveler / Sender)
router.post("/", protect, createShipment);
router.get("/me", protect, getMyShipments);
router.post("/verify-payment", protect, verifyPayment);

// Protected routes (Company / Admin)
// The getCompanyShipments is specifically for companies
router.get(
  "/company",
  protect,
  authorize("company", "admin"),
  getCompanyShipments,
);

// Admin route
router.get("/admin", protect, authorize("admin"), getAllShipments);

// Status updates
router.put(
  "/:id/status",
  protect,
  authorize("company", "admin"),
  updateShipmentStatus,
);

module.exports = router;
