const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Public webhook route (called by Paystack)
router.post("/webhook", handleWebhook);

// Protected routes below
router.use(protect);

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);

module.exports = router;
