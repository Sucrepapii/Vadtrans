const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

// All booking routes require authentication
router.use(protect);

router.post("/", createBooking);
router.get("/", getUserBookings);
router.get("/:id", getBooking);
router.put("/:id/cancel", cancelBooking);

module.exports = router;
