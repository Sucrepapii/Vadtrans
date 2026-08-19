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
router.post("/bids/:bidId/negotiate", authorize("traveler", "admin"), privateRideController.negotiateBid);
router.post("/:id/pay", authorize("traveler", "admin"), privateRideController.initializePayment);
router.get("/verify/:reference", privateRideController.verifyPayment);

// Company routes
router.post("/:id/bid", authorize("company", "admin"), privateRideController.placeBid);
router.post("/bids/:bidId/counter-offer", authorize("company", "admin"), privateRideController.counterOffer);
router.put("/:id/status", authorize("company", "admin"), privateRideController.updateRideStatus);
router.put("/:id/location", authorize("company", "admin"), privateRideController.updatePrivateLocation);

// Shared routes (get own requests/single request)
router.get("/", privateRideController.getMyRides);
router.get("/:id", privateRideController.getPrivateRide);

// Cancel route
router.post("/:id/cancel", authorize("traveler", "admin"), privateRideController.cancelRequest);

module.exports = router;
