const cron = require("node-cron");
const { Op } = require("sequelize");
const ProviderPayable = require("../models/ProviderPayable");
const Payout = require("../models/Payout");
const Trip = require("../models/Trip");
const PrivateRideRequest = require("../models/PrivateRideRequest");
const {
  executeProviderPayout,
  triggerPayoutsForCompletedTrip,
} = require("../utils/payoutService");

/**
 * Initialize Automated Marketplace Payout Cron Jobs
 */
const initPayoutCron = () => {
  console.log("⏰ Initializing Automated Marketplace Payout Cron Job...");

  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule("*/10 * * * *", async () => {
    console.log("🔄 [Payout Cron] Running automated payout cycle...");

    try {
      // 1. Process eligible payables that have reached completion
      const eligiblePayables = await ProviderPayable.findAll({
        where: { status: "eligible" },
        limit: 25,
      });

      if (eligiblePayables.length > 0) {
        console.log(`🚀 [Payout Cron] Found ${eligiblePayables.length} eligible payables to disburse.`);
        for (const payable of eligiblePayables) {
          try {
            await executeProviderPayout(payable.id);
          } catch (err) {
            console.error(`❌ [Payout Cron] Failed payout for payable #${payable.id}:`, err.message);
          }
        }
      }

      // 2. Retry failed payouts with retryCount < 3
      const failedPayouts = await Payout.findAll({
        where: {
          status: "failed",
          retryCount: { [Op.lt]: 3 },
          updatedAt: { [Op.lt]: new Date(Date.now() - 30 * 60 * 1000) }, // 30 minutes cooldown
        },
        limit: 10,
      });

      if (failedPayouts.length > 0) {
        console.log(`🔁 [Payout Cron] Retrying ${failedPayouts.length} failed payouts.`);
        for (const payout of failedPayouts) {
          try {
            const payable = await ProviderPayable.findOne({ where: { payoutId: payout.id } });
            if (payable) {
              await executeProviderPayout(payable.id);
            }
          } catch (retryErr) {
            console.error(`❌ [Payout Cron] Retry failed for payout #${payout.id}:`, retryErr.message);
          }
        }
      }
    } catch (cycleErr) {
      console.error("❌ [Payout Cron] Unexpected error in payout cycle:", cycleErr);
    }
  });

  console.log("✅ [Payout Cron] Automated marketplace payout worker active.");
};

module.exports = { initPayoutCron };
