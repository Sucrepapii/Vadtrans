const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// All payment routes require authentication
router.use(protect);

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);

module.exports = router;
