const express = require("express");
const router = express.Router();
const privateRideController = require("../controllers/privateRideController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Traveler routes
router.post("/request", authorize("traveler", "admin"), privateRideController.createRequest);
router.get("/nearby-drivers", authorize("traveler", "admin"), privateRideController.getNearbyDrivers);
router.post("/bids/:bidId/accept", authorize("traveler", "admin"), privateRideController.acceptBid);
router.post("/:id/pay", authorize("traveler", "admin"), privateRideController.initializePayment);
router.get("/verify/:reference", privateRideController.verifyPayment);

// Company routes
router.post("/:id/bid", authorize("company", "admin"), privateRideController.placeBid);
router.put("/:id/status", authorize("company", "admin"), privateRideController.updateRideStatus);

// Shared route (get own requests)
router.get("/", privateRideController.getMyRides);

module.exports = router;
