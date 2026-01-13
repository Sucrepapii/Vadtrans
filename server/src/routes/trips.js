const express = require("express");
const router = express.Router();
const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getMyTrips,
} = require("../controllers/tripController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getAllTrips);
router.get("/:id", getTripById);

// Protected routes (Company only)
router.post("/", protect, authorize("company", "admin"), createTrip);
router.put("/:id", protect, authorize("company", "admin"), updateTrip);
router.delete("/:id", protect, authorize("company", "admin"), deleteTrip);
router.get(
  "/company/my-trips",
  protect,
  authorize("company", "admin"),
  getMyTrips
);

module.exports = router;
