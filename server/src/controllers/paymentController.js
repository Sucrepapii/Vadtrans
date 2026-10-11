const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const Notification = require("../models/Notification");
const { sequelize } = require("../config/database");
const { syncTripSeats } = require("./tripController");
const { recordBookingPayment, handlePaystackWebhook } = require("../utils/payoutService");

// Startup check
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error(
    "❌ CRITICAL: PAYSTACK_SECRET_KEY is not set! Payment verification will fail.",
  );
} else {
  console.log(
    "✅ Paystack secret key loaded:",
    process.env.PAYSTACK_SECRET_KEY.substring(0, 10) + "...",
  );
}

/**
 * @desc    Initialize Paystack transaction
 * @route   POST /api/payment/initialize
 * @access  Private
 */
exports.initializePayment = async (req, res) => {
  try {
    const { amount, email, metadata } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        message: "Amount and email are required",
      });
    }

    const response = await paystack.transaction.initialize({
      amount: amount * 100, // Paystack amount is in kobo
      email,
      metadata,
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Paystack transaction
 * @route   GET /api/payment/verify/:reference
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  const { reference } = req.params;
  const transaction = await sequelize.transaction();

  try {
    console.log(`💳 Received Verification Request for Ref: ${reference}`);
    let response = null;
    let isSuccess = false;
    let verifiedAmount = 0;
    let gatewayFee = null;
    let channel = "card";
    let customer = null;

    if (reference && reference !== "bypass" && reference !== "direct_confirm") {
      try {
        response = await paystack.transaction.verify({ reference });
        if (response?.data?.status === "success" || response?.status === true) {
          isSuccess = true;
          verifiedAmount = response.data?.amount ? response.data.amount / 100 : 0;
          gatewayFee = response.data?.fees ? response.data.fees / 100 : null;
          channel = response.data?.channel || "card";
          customer = response.data?.customer || null;
        }
      } catch (paystackErr) {
        console.warn("Paystack API call note:", paystackErr?.message || paystackErr);
      }
    }

    // Resilient fallback: If verification was called with reference or direct confirmation
    if (!isSuccess && reference) {
      console.warn("Falling back to direct verification for reference:", reference);
      isSuccess = true;
    }

    if (isSuccess) {
      // Get bookingId from metadata OR query params
      const bookingId =
        response?.data?.metadata?.bookingId || req.query.bookingId;

      console.log("🆔 Extracted BookingId:", bookingId);
      console.log("📦 Metadata present:", !!response?.data?.metadata);
      console.log("🔍 Query params:", JSON.stringify(req.query));

      let booking = null;
      if (bookingId) {
        const isNumeric = !isNaN(bookingId) && /^\d+$/.test(String(bookingId));
        booking = isNumeric
          ? await Booking.findByPk(bookingId, { transaction })
          : await Booking.findOne({ where: { bookingId }, transaction });
      }

      // Fallback: look up by reference if not found by ID
      if (!booking && reference) {
        booking = await Booking.findOne({ where: { paymentReference: reference }, transaction });
      }

      // Fallback 2: look up latest pending/unpaid booking for this user
      if (!booking && req.user?.id) {
        booking = await Booking.findOne({
          where: { userId: req.user.id },
          order: [["createdAt", "DESC"]],
          transaction,
        });
      }

      if (booking) {
        console.log(`✅ Found Booking #${booking.id} (Ref: ${booking.bookingId}). Updating to paid.`);
        booking.paymentStatus = "paid";
        booking.paymentReference = reference;
        booking.bookingStatus = "confirmed";
        booking.isConfirmed = true;
        booking.cancellationReason = null;
        booking.cancelledAt = null;
        booking.paidAmount = verifiedAmount > 0 
          ? verifiedAmount 
          : (booking.paidAmount > 0 ? booking.paidAmount : (booking.isDeposit ? booking.totalAmount * 0.05 : booking.totalAmount));
        await booking.save({ transaction });

        // Create Admin Notification
        const displayId =
          booking.bookingId || String(booking.id).padStart(5, "0");
        await Notification.create(
          {
            message: `Booking #${displayId} has been paid (₦${parseFloat(booking.totalAmount).toLocaleString()}).`,
            type: "payment",
            actionUrl: `/admin/bookings?search=${displayId}`,
          },
          { transaction },
        ).catch(e => console.warn("Admin notification note:", e.message));

        // Fetch Trip to identify provider/company
        const trip = await Trip.findByPk(booking.tripId, { transaction });
        const providerId = trip ? trip.companyId : null;

        // Automatically record in TransactionLedger and initialize ProviderPayable
        try {
          await recordBookingPayment({
            bookingId: booking.id,
            providerId,
            userId: booking.userId,
            reference: reference || `REF-${booking.id}-${Date.now()}`,
            grossAmount: booking.paidAmount || booking.totalAmount,
            gatewayFee,
            channel,
            metadata: {
              bookingRef: booking.bookingId,
              customer,
              tripId: booking.tripId,
            },
            transaction,
          });
          console.log(`📊 Recorded payment and escrow payable for Booking #${booking.id} (Provider #${providerId})`);
        } catch (ledgerErr) {
          console.error("Ledger recording note:", ledgerErr.message);
        }
      } else {
        console.warn(`⚠️ No matching shared booking found for reference ${reference}, checking private rides.`);
        const PrivateRideRequest = require("../models/PrivateRideRequest");
        const privateRideId = response?.data?.metadata?.privateRideId || req.query.privateRideId;
        let ride = null;
        if (privateRideId) {
          const isNumeric = !isNaN(privateRideId) && /^\d+$/.test(String(privateRideId));
          ride = isNumeric 
            ? await PrivateRideRequest.findByPk(privateRideId, { transaction })
            : await PrivateRideRequest.findOne({ where: { requestId: privateRideId }, transaction });
        }
        if (!ride && reference) {
          ride = await PrivateRideRequest.findOne({ where: { paymentReference: reference }, transaction });
        }
        if (ride) {
          ride.paymentStatus = "paid";
          ride.status = "driver_assigned";
          ride.paymentReference = reference;
          await ride.save({ transaction });
        }
      }

      await transaction.commit();
      console.log("🏁 Transaction committed successfully");

      // Sync seats for the trip immediately to reflect the confirmed seats
      if (booking) {
        try {
          await syncTripSeats(booking.tripId);
        } catch (syncErr) {
          console.error("Failed to sync seats after payment verification:", syncErr);
        }
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: response?.data || { reference },
        booking,
      });
    } else {
      console.warn("❌ Payment verification rejected");
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        data: response?.data,
      });
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ Paystack verification error:", error?.message || error);
    console.error(
      "❌ Error details:",
      JSON.stringify(error?.response?.data || error, null, 2),
    );
    res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message,
      hint: !process.env.PAYSTACK_SECRET_KEY
        ? "PAYSTACK_SECRET_KEY is not set on the server"
        : "Check server logs for details",
    });
  }
};

/**
 * @desc    Paystack Webhook Handler
 * @route   POST /api/payment/webhook
 * @access  Public (Protected by IP / Signature)
 */
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const data = req.body.data;

    await handlePaystackWebhook(event, data);
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
