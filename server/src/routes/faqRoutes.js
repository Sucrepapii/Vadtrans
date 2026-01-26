const express = require("express");
const router = express.Router();
const {
  getFAQs,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getFAQs);

// Admin routes
router.get("/admin", protect, authorize("admin"), getAllFAQsAdmin);
router.post("/admin", protect, authorize("admin"), createFAQ);
router.put("/admin/:id", protect, authorize("admin"), updateFAQ);
router.delete("/admin/:id", protect, authorize("admin"), deleteFAQ);

module.exports = router;
