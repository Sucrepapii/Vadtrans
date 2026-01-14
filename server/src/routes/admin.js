const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getTopCompanies,
  getAllTrips,
  updateTrip,
  deleteTrip,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateUser,
  getAllFares,
  createFare,
  updateFare,
  deleteFare,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/top-companies", getTopCompanies);

// Trip Management
router.get("/trips", getAllTrips);
router.put("/trips/:id", updateTrip);
router.delete("/trips/:id", deleteTrip);

// Booking Management
router.get("/bookings", getAllBookings);
router.put("/bookings/:id", updateBookingStatus);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);

// Fare Management
router.get("/fares", getAllFares);
router.post("/fares", createFare);
router.put("/fares/:id", updateFare);
router.delete("/fares/:id", deleteFare);

module.exports = router;
