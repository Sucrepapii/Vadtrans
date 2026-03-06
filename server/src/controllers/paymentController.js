const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const { sequelize } = require("../config/database");

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
    const response = await paystack.transaction.verify({ reference });

    if (response.data.status === "success") {
      // Get bookingId from metadata OR query params
      const bookingId =
        response.data.metadata?.bookingId || req.query.bookingId;

      if (!bookingId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Booking ID missing from transaction metadata and query",
        });
      }

      const booking = await Booking.findByPk(bookingId, { transaction });
      if (booking) {
        booking.paymentStatus = "paid";
        booking.paymentReference = reference;
        booking.bookingStatus = "confirmed";
        await booking.save({ transaction });

        // Create Admin Notification
        const Notification = require("../models/Notification");
        await Notification.create(
          {
            message: `Booking #${booking.bookingId || booking.id.substring(0, 8)} has been paid (₦${parseFloat(booking.totalAmount).toLocaleString()}).`,
            type: "payment",
            relatedBookingId: booking.id,
            actionUrl: `/admin/bookings?search=${booking.bookingId || booking.id.substring(0, 8)}`,
          },
          { transaction },
        );
      }

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: response.data,
      });
    } else {
      await transaction.rollback();
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
        data: response.data,
      });
    }
  } catch (error) {
    await transaction.rollback();
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
        : "Check Railway logs for details",
    });
  }
};
