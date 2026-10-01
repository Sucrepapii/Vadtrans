const https = require("https");
const { sequelize } = require("../config/database");
const Payment = require("../models/Payment");
const TransactionLedger = require("../models/TransactionLedger");
const ProviderPayable = require("../models/ProviderPayable");
const Payout = require("../models/Payout");
const User = require("../models/User");
const Booking = require("../models/Booking");
const PrivateRideRequest = require("../models/PrivateRideRequest");
const Trip = require("../models/Trip");
const Notification = require("../models/Notification");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

/**
 * Make an HTTP request to Paystack API
 */
const paystackRequest = (endpoint, method = "GET", data = null) => {
  return new Promise((resolve, reject) => {
    if (!PAYSTACK_SECRET) {
      return resolve({ status: false, message: "PAYSTACK_SECRET_KEY is not configured" });
    }

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ status: false, message: "Invalid JSON response from Paystack", raw: body });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data && method !== "GET") {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

/**
 * Calculate marketplace split:
 * Gross Amount - Vadtrans Commission (10%) - Payment Processing Charge = Provider Payable
 */
const calculateMarketplaceSplit = (grossAmount, commissionRate = 0.10, gatewayFeeOverride = null) => {
  const gross = parseFloat(grossAmount) || 0;
  
  // Paystack Standard Nigeria Fee: 1.5% + NGN 100 (waived under NGN 2,500), capped at NGN 2,000
  let gatewayFee = 0;
  if (gatewayFeeOverride !== null) {
    gatewayFee = parseFloat(gatewayFeeOverride) || 0;
  } else {
    if (gross < 2500) {
      gatewayFee = Math.round(gross * 0.015);
    } else {
      gatewayFee = Math.min(Math.round(gross * 0.015 + 100), 2000);
    }
  }

  const commissionAmount = Math.round(gross * commissionRate);
  
  // Provider payable (Gross minus Commission minus Gateway Fee)
  // Ensures provider receives the net amount, platform earns commission
  let netPayable = gross - commissionAmount - gatewayFee;
  if (netPayable < 0) netPayable = 0;

  return {
    grossAmount: gross,
    commissionRate,
    commissionAmount,
    gatewayFee,
    netPayableAmount: netPayable,
    netAmount: netPayable,
  };
};

/**
 * Record a successful payment into Payment and Transaction Ledger
 * Creates ProviderPayable in escrow pending trip completion
 */
const recordBookingPayment = async ({
  bookingId = null,
  privateRideId = null,
  providerId = null,
  userId = null,
  reference,
  grossAmount,
  gatewayFee = 0,
  channel = "card",
  metadata = {},
  transaction = null,
}) => {
  const t = transaction || (await sequelize.transaction());
  const managedTransaction = !transaction;

  try {
    const commissionRate = privateRideId ? 0.20 : 0.05;
    const split = calculateMarketplaceSplit(grossAmount, commissionRate, gatewayFee);

    // 1. Create or update Payment record
    const [paymentRecord, created] = await Payment.findOrCreate({
      where: { reference },
      defaults: {
        reference,
        bookingId,
        privateRideId,
        providerId,
        userId,
        grossAmount: split.grossAmount,
        gatewayFee: split.gatewayFee,
        netAmount: split.netPayableAmount,
        currency: "NGN",
        channel,
        status: "success",
        paidAt: new Date(),
        metadata,
      },
      transaction: t,
    });

    if (!created) {
      paymentRecord.status = "success";
      paymentRecord.paidAt = new Date();
      paymentRecord.grossAmount = split.grossAmount;
      paymentRecord.gatewayFee = split.gatewayFee;
      paymentRecord.netAmount = split.netPayableAmount;
      await paymentRecord.save({ transaction: t });
    }

    const timestamp = Date.now();
    const prefix = bookingId ? `BK-${bookingId}` : `PR-${privateRideId}`;

    // 2. Write 4 Double-Entry Ledger Records
    // Entry 1: Platform Inflow
    await TransactionLedger.create(
      {
        ledgerId: `LED-${timestamp}-INFLOW`,
        bookingId,
        privateRideId,
        paymentId: paymentRecord.id,
        providerId,
        userId,
        entryType: "PAYMENT_INFLOW",
        direction: "CREDIT",
        amount: split.grossAmount,
        currency: "NGN",
        description: `Gross passenger payment received via ${channel.toUpperCase()} (${reference}) for ${prefix}`,
        metadata: { reference, channel, split },
      },
      { transaction: t }
    );

    // Entry 2: Gateway Processing Fee
    if (split.gatewayFee > 0) {
      await TransactionLedger.create(
        {
          ledgerId: `LED-${timestamp}-FEE`,
          bookingId,
          privateRideId,
          paymentId: paymentRecord.id,
          providerId,
          userId,
          entryType: "GATEWAY_FEE",
          direction: "DEBIT",
          amount: split.gatewayFee,
          currency: "NGN",
          description: `Paystack payment processing fee for ${reference}`,
          metadata: { fee: split.gatewayFee },
        },
        { transaction: t }
      );
    }

    // Entry 3: Vadtrans Commission Revenue
    await TransactionLedger.create(
      {
        ledgerId: `LED-${timestamp}-COMM`,
        bookingId,
        privateRideId,
        paymentId: paymentRecord.id,
        providerId,
        userId,
        entryType: "COMMISSION_REVENUE",
        direction: "CREDIT",
        amount: split.commissionAmount,
        currency: "NGN",
        description: `Vadtrans ${split.commissionRate * 100}% marketplace commission for ${prefix}`,
        metadata: { commissionRate: split.commissionRate, commissionAmount: split.commissionAmount },
      },
      { transaction: t }
    );

    // Entry 4: Provider Payable Credit (Held in Escrow)
    await TransactionLedger.create(
      {
        ledgerId: `LED-${timestamp}-PAYABLE`,
        bookingId,
        privateRideId,
        paymentId: paymentRecord.id,
        providerId,
        userId,
        entryType: "PROVIDER_PAYABLE_CREDIT",
        direction: "CREDIT",
        amount: split.netPayableAmount,
        currency: "NGN",
        description: `Accrued net earnings credited to escrow for Provider #${providerId} for ${prefix}`,
        metadata: { netPayable: split.netPayableAmount },
      },
      { transaction: t }
    );

    // 3. Create or update ProviderPayable record
    let resolvedTripId = null;
    if (bookingId) {
      const b = await Booking.findByPk(bookingId, { attributes: ["tripId"], transaction: t });
      if (b) resolvedTripId = b.tripId;
    }

    const payableId = `PAY-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [payableRecord] = await ProviderPayable.findOrCreate({
      where: bookingId ? { bookingId } : { privateRideId },
      defaults: {
        payableId,
        providerId,
        bookingId,
        privateRideId,
        tripId: resolvedTripId,
        grossAmount: split.grossAmount,
        commissionRate: split.commissionRate,
        commissionAmount: split.commissionAmount,
        gatewayFeeDeducted: split.gatewayFee,
        netPayableAmount: split.netPayableAmount,
        payoutCondition: "trip_completed",
        status: "pending_trip",
      },
      transaction: t,
    });

    if (managedTransaction) {
      await t.commit();
    }

    return {
      success: true,
      payment: paymentRecord,
      payable: payableRecord,
      split,
    };
  } catch (error) {
    if (managedTransaction) {
      await t.rollback();
    }
    console.error("❌ Error recording booking payment in ledger:", error);
    throw error;
  }
};

/**
 * Resolve NUBAN bank account with Paystack
 */
const resolveBankAccount = async (accountNumber, bankCode) => {
  try {
    if (!accountNumber || !bankCode) {
      return { success: false, message: "Account number and bank code are required" };
    }

    const res = await paystackRequest(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
    if (res.status && res.data) {
      return {
        success: true,
        accountName: res.data.account_name,
        accountNumber: res.data.account_number,
        bankCode,
      };
    }

    return {
      success: false,
      message: res.message || "Could not resolve bank account details",
    };
  } catch (err) {
    console.error("Bank resolution error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * Create or retrieve Paystack Transfer Recipient for a provider
 */
const getOrCreateTransferRecipient = async (providerId) => {
  try {
    const provider = await User.findByPk(providerId);
    if (!provider) {
      return { success: false, message: "Provider not found" };
    }

    const bankDetails = provider.bankDetails || {};
    if (!bankDetails.accountNumber || !bankDetails.bankCode) {
      return { success: false, message: "Provider has no registered bank details" };
    }

    // Check if recipient code already exists
    if (bankDetails.paystackRecipientCode) {
      return {
        success: true,
        recipientCode: bankDetails.paystackRecipientCode,
        bankDetails,
      };
    }

    // Create recipient on Paystack
    const recipientRes = await paystackRequest("/transferrecipient", "POST", {
      type: "nuban",
      name: bankDetails.accountName || provider.name,
      account_number: bankDetails.accountNumber,
      bank_code: bankDetails.bankCode,
      currency: "NGN",
    });

    if (recipientRes.status && recipientRes.data?.recipient_code) {
      const recipientCode = recipientRes.data.recipient_code;
      
      // Update provider bankDetails with recipient code
      provider.bankDetails = {
        ...bankDetails,
        paystackRecipientCode: recipientCode,
        isBankVerified: true,
      };
      await provider.save();

      return {
        success: true,
        recipientCode,
        bankDetails: provider.bankDetails,
      };
    }

    return {
      success: false,
      message: recipientRes.message || "Failed to create Paystack transfer recipient",
    };
  } catch (err) {
    console.error("Recipient creation error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * Execute automated bank payout for an eligible ProviderPayable
 */
const executeProviderPayout = async (payableId) => {
  const transaction = await sequelize.transaction();

  try {
    const payable = await ProviderPayable.findByPk(payableId, { transaction });
    if (!payable) {
      await transaction.rollback();
      return { success: false, message: "Payable not found" };
    }

    if (payable.status === "paid") {
      await transaction.rollback();
      return { success: true, message: "Payable is already paid" };
    }

    const provider = await User.findByPk(payable.providerId, { transaction });
    if (!provider) {
      await transaction.rollback();
      return { success: false, message: "Provider not found" };
    }

    // Get or create recipient
    const recipientRes = await getOrCreateTransferRecipient(provider.id);
    if (!recipientRes.success) {
      payable.status = "eligible"; // remains eligible until bank details are added
      await payable.save({ transaction });
      await transaction.commit();
      return {
        success: false,
        message: `Payout delayed: ${recipientRes.message}. Funds remain secure in escrow.`,
      };
    }

    const recipientCode = recipientRes.recipientCode;
    const payoutRef = `POT-${Date.now()}-${payable.id}`;
    const amountInKobo = Math.round(payable.netPayableAmount * 100);

    // Create Payout record in queued state
    const payout = await Payout.create(
      {
        payoutReference: payoutRef,
        providerId: provider.id,
        amount: payable.netPayableAmount,
        currency: "NGN",
        recipientCode,
        bankName: provider.bankDetails?.bankName || "Verified Bank",
        bankCode: provider.bankDetails?.bankCode,
        accountNumber: provider.bankDetails?.accountNumber,
        accountName: provider.bankDetails?.accountName || provider.name,
        status: "processing",
        initiatedAt: new Date(),
        metadata: { payableId: payable.id, bookingId: payable.bookingId, privateRideId: payable.privateRideId },
      },
      { transaction }
    );

    // Call Paystack Transfer API
    let transferSuccess = false;
    let transferRes = null;

    if (PAYSTACK_SECRET && !PAYSTACK_SECRET.includes("pk_test") && amountInKobo > 0) {
      transferRes = await paystackRequest("/transfer", "POST", {
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reason: `Vadtrans payout for ${payable.bookingId ? 'Booking #' + payable.bookingId : 'Private Ride #' + payable.privateRideId}`,
        reference: payoutRef,
      });

      if (transferRes.status && transferRes.data) {
        transferSuccess = true;
        payout.transferCode = transferRes.data.transfer_code;
        payout.status = transferRes.data.status === "success" ? "success" : "processing";
        if (transferRes.data.status === "success") {
          payout.completedAt = new Date();
        }
      } else {
        payout.status = "failed";
        payout.failureReason = transferRes.message || "Paystack transfer rejected";
      }
    } else {
      // In development/test mode without active live Paystack balance, simulate successful transfer
      transferSuccess = true;
      payout.status = "success";
      payout.transferCode = `TRF_SIM_${Date.now()}`;
      payout.completedAt = new Date();
    }

    await payout.save({ transaction });

    // Link payable to payout
    payable.payoutId = payout.id;
    payable.status = payout.status === "failed" ? "eligible" : "paid";
    if (payable.status === "paid") {
      payable.paidAt = new Date();
    }
    await payable.save({ transaction });

    // Record Payout Outflow in Transaction Ledger
    await TransactionLedger.create(
      {
        ledgerId: `LED-${Date.now()}-DISBURSE`,
        bookingId: payable.bookingId,
        privateRideId: payable.privateRideId,
        payoutId: payout.id,
        providerId: provider.id,
        entryType: "PAYOUT_DISBURSEMENT",
        direction: "DEBIT",
        amount: payable.netPayableAmount,
        currency: "NGN",
        description: `Automated bank transfer payout to ${payout.accountName} (${payout.bankName} - ${payout.accountNumber}) for Ref: ${payoutRef}`,
        metadata: { payoutRef, transferCode: payout.transferCode, status: payout.status },
      },
      { transaction }
    );

    await transaction.commit();

    return {
      success: transferSuccess,
      payout,
      payable,
      message: transferSuccess
        ? `Successfully transferred ₦${payable.netPayableAmount.toLocaleString()} to ${provider.name}.`
        : `Transfer pending/failed: ${payout.failureReason}`,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Payout execution error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Trigger automated payouts when a trip or private ride is marked completed
 */
const triggerPayoutsForCompletedTrip = async (tripIdOrOptions, isPrivateRide = false) => {
  try {
    let where = {};
    if (typeof tripIdOrOptions === "object" && tripIdOrOptions !== null) {
      if (tripIdOrOptions.bookingId) where.bookingId = tripIdOrOptions.bookingId;
      if (tripIdOrOptions.tripId) where.tripId = tripIdOrOptions.tripId;
      if (tripIdOrOptions.privateRideId) where.privateRideId = tripIdOrOptions.privateRideId;
    } else {
      where = isPrivateRide ? { privateRideId: tripIdOrOptions } : { tripId: tripIdOrOptions };
    }
    where.status = "pending_trip";

    const payables = await ProviderPayable.findAll({ where });
    const targetLabel = typeof tripIdOrOptions === "object" ? JSON.stringify(tripIdOrOptions) : (isPrivateRide ? `Private Ride #${tripIdOrOptions}` : `Trip #${tripIdOrOptions}`);
    console.log(`🚀 Found ${payables.length} payables eligible for automated payout for ${targetLabel}`);

    const results = [];
    for (const payable of payables) {
      payable.status = "eligible";
      payable.eligibleAt = new Date();
      await payable.save();

      // Automatically execute payout immediately
      const result = await executeProviderPayout(payable.id);
      results.push(result);
    }

    return results;
  } catch (err) {
    console.error("Error triggering payouts for completed trip:", err);
    return [];
  }
};

/**
 * Handle incoming Paystack Webhooks
 */
const handlePaystackWebhook = async (event, data) => {
  try {
    console.log(`🔔 Paystack Webhook Event: ${event}`);

    switch (event) {
      case "charge.success": {
        const reference = data.reference;
        const bookingId = data.metadata?.bookingId || data.metadata?.custom_fields?.find(f => f.variable_name === 'bookingId')?.value;
        const privateRideId = data.metadata?.privateRideId || data.metadata?.custom_fields?.find(f => f.variable_name === 'privateRideId')?.value;

        console.log(`💳 Processing webhook charge.success for ref: ${reference}, bookingId: ${bookingId}, privateRideId: ${privateRideId}`);

        // 1. Check if shared booking
        let booking = null;
        if (bookingId) {
          const isNumeric = !isNaN(bookingId) && /^\d+$/.test(String(bookingId));
          booking = isNumeric
            ? await Booking.findByPk(bookingId)
            : await Booking.findOne({ where: { bookingId } });
        }
        if (!booking && reference) {
          booking = await Booking.findOne({ where: { paymentReference: reference } });
        }

        if (booking) {
          const wasPaid = booking.paymentStatus === "paid";
          booking.paymentStatus = "paid";
          booking.bookingStatus = "confirmed";
          booking.paymentReference = reference;
          booking.paidAmount = data.amount ? data.amount / 100 : booking.totalAmount;
          booking.isConfirmed = true;
          await booking.save();

          if (!wasPaid) {
            // Create notification for admin
            const displayId = booking.bookingId || String(booking.id).padStart(5, "0");
            await Notification.create({
              message: `Booking #${displayId} has been confirmed & paid via webhook (₦${parseFloat(booking.paidAmount || booking.totalAmount).toLocaleString()}).`,
              type: "payment",
              actionUrl: `/admin/bookings?search=${displayId}`,
            }).catch(e => console.warn("Admin notification note:", e.message));

            // Record payment ledger and payable
            try {
              const trip = await Trip.findByPk(booking.tripId);
              await recordBookingPayment({
                bookingId: booking.id,
                providerId: trip ? trip.companyId : null,
                userId: booking.userId,
                reference,
                grossAmount: booking.paidAmount || booking.totalAmount,
                gatewayFee: data.fees ? data.fees / 100 : null,
                channel: data.channel || "card",
                metadata: {
                  bookingRef: booking.bookingId,
                  customer: data.customer,
                  tripId: booking.tripId,
                  webhookProcessedAt: new Date(),
                },
              });
            } catch (err) {
              console.error("Webhook ledger recording note:", err.message);
            }

            // Sync trip seats
            try {
              const { syncTripSeats } = require("../controllers/tripController");
              await syncTripSeats(booking.tripId);
            } catch (syncErr) {
              console.error("Webhook seat sync note:", syncErr.message);
            }
          }
        }

        // 2. Check if private ride
        if (privateRideId) {
          const isNumeric = !isNaN(privateRideId) && /^\d+$/.test(String(privateRideId));
          const ride = isNumeric
            ? await PrivateRideRequest.findByPk(privateRideId)
            : await PrivateRideRequest.findOne({ where: { requestId: privateRideId } });

          if (ride) {
            ride.paymentStatus = "paid";
            ride.status = "driver_assigned";
            ride.paymentReference = reference;
            await ride.save();

            // Record private ride payment
            try {
              await recordBookingPayment({
                privateRideId: ride.id,
                providerId: ride.driverId,
                userId: ride.passengerId,
                reference,
                grossAmount: ride.agreedPrice,
                gatewayFee: data.fees ? data.fees / 100 : null,
                channel: data.channel || "card",
                metadata: {
                  requestId: ride.requestId,
                  customer: data.customer,
                  webhookProcessedAt: new Date(),
                },
              });
            } catch (err) {
              console.error("Private ride webhook ledger note:", err.message);
            }
          }
        }
        break;
      }

      case "transfer.success": {
        const payout = await Payout.findOne({ where: { payoutReference: data.reference } });
        if (payout) {
          payout.status = "success";
          payout.completedAt = new Date();
          await payout.save();

          await ProviderPayable.update(
            { status: "paid", paidAt: new Date() },
            { where: { payoutId: payout.id } }
          );
        }
        break;
      }

      case "transfer.failed":
      case "transfer.reversed": {
        const payout = await Payout.findOne({ where: { payoutReference: data.reference } });
        if (payout) {
          payout.status = "failed";
          payout.failureReason = data.reason || "Transfer failed or was reversed by destination bank";
          payout.retryCount = (payout.retryCount || 0) + 1;
          await payout.save();

          // Return payable to eligible so it can be retried
          await ProviderPayable.update(
            { status: "eligible" },
            { where: { payoutId: payout.id } }
          );
        }
        break;
      }

      default:
        break;
    }

    return { success: true };
  } catch (err) {
    console.error("Webhook processing error:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  calculateMarketplaceSplit,
  recordBookingPayment,
  resolveBankAccount,
  getOrCreateTransferRecipient,
  executeProviderPayout,
  triggerPayoutsForCompletedTrip,
  handlePaystackWebhook,
};
