const express = require("express");
const router = express.Router();
const {
  getCompanyEarnings,
  markEarningsAsPaid,
  getMyEarnings,
} = require("../controllers/earningsController");
const { protect, authorize } = require("../middleware/auth");

// All earnings routes require authentication
router.use(protect);

// Company routes
router.get("/my-earnings", authorize("company"), getMyEarnings);

// Admin routes
router.get("/companies", authorize("admin"), getCompanyEarnings);
router.put("/companies/:companyId/settle", authorize("admin"), markEarningsAsPaid);

module.exports = router;
