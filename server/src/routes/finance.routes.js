const express = require("express");
const router = express.Router();
const {
  getFinancialOverview,
  getTransactionLedger,
  getProviderPayables,
  getPayouts,
  triggerManualPayout,
  verifyAndSaveBank,
  getNigerianBanks,
} = require("../controllers/financeController");
const { protect, authorize } = require("../middleware/auth");

// Public/authenticated banks list
router.get("/banks", getNigerianBanks);

// Protected routes
router.use(protect);

// Provider bank verification
router.post("/verify-bank", authorize("company", "admin"), verifyAndSaveBank);

// Admin & Finance routes
router.get("/overview", authorize("admin", "finance"), getFinancialOverview);
router.get("/ledger", authorize("admin", "finance"), getTransactionLedger);
router.get("/payables", authorize("admin", "finance"), getProviderPayables);
router.get("/payouts", authorize("admin", "finance"), getPayouts);
router.post("/payables/:id/execute", authorize("admin"), triggerManualPayout);

module.exports = router;
