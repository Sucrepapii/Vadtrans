const { Op, fn, col } = require("sequelize");
const Payment = require("../models/Payment");
const TransactionLedger = require("../models/TransactionLedger");
const ProviderPayable = require("../models/ProviderPayable");
const Payout = require("../models/Payout");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const PrivateRideRequest = require("../models/PrivateRideRequest");
const {
  resolveBankAccount,
  getOrCreateTransferRecipient,
  executeProviderPayout,
} = require("../utils/payoutService");

/**
 * @desc    Get Financial KPI Overview (Admin)
 * @route   GET /api/finance/overview
 * @access  Private (Admin / Finance)
 */
exports.getFinancialOverview = async (req, res) => {
  try {
    // 1. Total Gross Volume (Successful Payments)
    const totalPayments = await Payment.findAll({
      where: { status: "success" },
      attributes: [[fn("SUM", col("grossAmount")), "totalGross"], [fn("COUNT", col("id")), "count"]],
      raw: true,
    });
    const totalGrossVolume = parseFloat(totalPayments[0]?.totalGross) || 0;
    const totalTransactionsCount = parseInt(totalPayments[0]?.count) || 0;

    // 2. Vadtrans Platform Revenue (Commission entries)
    const totalCommission = await TransactionLedger.findAll({
      where: { entryType: "COMMISSION_REVENUE" },
      attributes: [[fn("SUM", col("amount")), "totalCommission"]],
      raw: true,
    });
    const totalVadtransRevenue = parseFloat(totalCommission[0]?.totalCommission) || 0;

    // 3. Total Gateway Processing Fees
    const totalFees = await TransactionLedger.findAll({
      where: { entryType: "GATEWAY_FEE" },
      attributes: [[fn("SUM", col("amount")), "totalFee"]],
      raw: true,
    });
    const totalGatewayFees = parseFloat(totalFees[0]?.totalFee) || 0;

    // 4. Total Payouts Disbursed
    const payoutsDisbursed = await Payout.findAll({
      where: { status: "success" },
      attributes: [[fn("SUM", col("amount")), "totalDisbursed"], [fn("COUNT", col("id")), "count"]],
      raw: true,
    });
    const totalDisbursedAmount = parseFloat(payoutsDisbursed[0]?.totalDisbursed) || 0;
    const totalPayoutsCount = parseInt(payoutsDisbursed[0]?.count) || 0;

    // 5. Escrow Balance / Pending Provider Payables
    const pendingPayables = await ProviderPayable.findAll({
      where: { status: { [Op.in]: ["pending_trip", "eligible", "queued"] } },
      attributes: [[fn("SUM", col("netPayableAmount")), "totalEscrow"], [fn("COUNT", col("id")), "count"]],
      raw: true,
    });
    const totalEscrowBalance = parseFloat(pendingPayables[0]?.totalEscrow) || 0;
    const pendingPayablesCount = parseInt(pendingPayables[0]?.count) || 0;

    // 6. Failed Payouts requiring attention
    const failedPayoutsCount = await Payout.count({ where: { status: "failed" } });

    res.status(200).json({
      success: true,
      data: {
        totalGrossVolume,
        totalTransactionsCount,
        totalVadtransRevenue,
        totalGatewayFees,
        totalDisbursedAmount,
        totalPayoutsCount,
        totalEscrowBalance,
        pendingPayablesCount,
        failedPayoutsCount,
      },
    });
  } catch (err) {
    console.error("Financial overview error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get Searchable Transaction Ledger (Admin)
 * @route   GET /api/finance/ledger
 * @access  Private (Admin / Finance)
 */
exports.getTransactionLedger = async (req, res) => {
  try {
    const { entryType, direction, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (entryType) where.entryType = entryType;
    if (direction) where.direction = direction;
    if (search) {
      where[Op.or] = [
        { ledgerId: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: ledgerEntries } = await TransactionLedger.findAndCountAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email", "phone"] },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Payment, as: "payment", attributes: ["reference", "channel", "paidAt"] },
        { model: Payout, as: "payout", attributes: ["payoutReference", "status", "bankName", "accountNumber"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        ledgerEntries,
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Ledger query error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get Provider Payables & Escrow List (Admin)
 * @route   GET /api/finance/payables
 * @access  Private (Admin / Finance)
 */
exports.getProviderPayables = async (req, res) => {
  try {
    const { status, providerId, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (providerId) where.providerId = providerId;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: payables } = await ProviderPayable.findAndCountAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email", "phone", "bankDetails"] },
        { model: Booking, as: "booking", attributes: ["id", "bookingId", "bookingStatus", "paymentStatus"] },
        { model: PrivateRideRequest, as: "privateRide", attributes: ["id", "requestId", "status", "pickupLocation", "destination"] },
        { model: Payout, as: "payout", attributes: ["id", "payoutReference", "status", "bankName", "accountNumber"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        payables,
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Payables query error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * @desc    Get Payouts History (Admin)
 * @route   GET /api/finance/payouts
 * @access  Private (Admin / Finance)
 */
exports.getPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: payouts } = await Payout.findAndCountAll({
      where,
      include: [
        { model: User, as: "provider", attributes: ["id", "name", "email", "phone"] },
        { model: ProviderPayable, as: "payables", attributes: ["id", "payableId", "grossAmount", "netPayableAmount"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        payouts,
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Payouts query error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * @desc    Manually Trigger Payout for a Payable (Admin)
 * @route   POST /api/finance/payables/:id/execute
 * @access  Private (Admin)
 */
exports.triggerManualPayout = async (req, res) => {
  try {
    const payableId = req.params.id;
    const result = await executeProviderPayout(payableId);

    if (result.success) {
      res.status(200).json({ success: true, message: result.message, data: result });
    } else {
      res.status(400).json({ success: false, message: result.message, data: result });
    }
  } catch (err) {
    console.error("Manual payout error:", err);
    res.status(500).json({ success: false, message: "Failed to execute payout", error: err.message });
  }
};

/**
 * @desc    Verify Bank Account & Save Paystack Recipient
 * @route   POST /api/finance/verify-bank
 * @access  Private (Company / Admin)
 */
exports.verifyAndSaveBank = async (req, res) => {
  try {
    const { accountNumber, bankCode, bankName, userId } = req.body;
    const targetUserId = req.user.role === "admin" && userId ? userId : req.user.id;

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Resolve bank account on Paystack
    const resolveRes = await resolveBankAccount(accountNumber, bankCode);
    if (!resolveRes.success) {
      return res.status(400).json({
        success: false,
        message: resolveRes.message || "Invalid bank account details. Could not resolve account name.",
      });
    }

    const resolvedName = resolveRes.accountName;

    // Update user bankDetails
    user.bankDetails = {
      bankName: bankName || resolveRes.bankCode,
      bankCode,
      accountNumber,
      accountName: resolvedName,
      isBankVerified: true,
      verifiedAt: new Date(),
    };
    await user.save();

    // Create Paystack transfer recipient
    const recipientRes = await getOrCreateTransferRecipient(user.id);

    res.status(200).json({
      success: true,
      message: `Bank account verified for ${resolvedName}`,
      data: {
        accountName: resolvedName,
        accountNumber,
        bankCode,
        bankName: bankName || resolveRes.bankCode,
        isVerified: true,
        recipientCode: recipientRes.recipientCode,
      },
    });
  } catch (err) {
    console.error("Bank verification error:", err);
    res.status(500).json({ success: false, message: "Failed to verify bank account", error: err.message });
  }
};

/**
 * @desc    Get List of Supported Nigerian Banks with CBN Codes
 * @route   GET /api/finance/banks
 * @access  Public / Authenticated
 */
exports.getNigerianBanks = async (req, res) => {
  // Curated list of primary Nigerian commercial banks and fintechs with CBN codes
  const banks = [
    { name: "Access Bank", code: "044" },
    { name: "Citibank Nigeria", code: "023" },
    { name: "Ecobank Nigeria", code: "050" },
    { name: "Fidelity Bank", code: "070" },
    { name: "First Bank of Nigeria", code: "011" },
    { name: "First City Monument Bank (FCMB)", code: "214" },
    { name: "Globus Bank", code: "00103" },
    { name: "Guaranty Trust Bank (GTBank)", code: "058" },
    { name: "Heritage Bank", code: "030" },
    { name: "Jaiz Bank", code: "301" },
    { name: "Keystone Bank", code: "082" },
    { name: "Kuda Bank", code: "50211" },
    { name: "Lotus Bank", code: "303" },
    { name: "Moniepoint Microfinance Bank", code: "50515" },
    { name: "Opay (PayCom)", code: "999992" },
    { name: "Optimus Bank", code: "107" },
    { name: "PalmPay", code: "999991" },
    { name: "Parallex Bank", code: "104" },
    { name: "Polaris Bank", code: "076" },
    { name: "Premium Trust Bank", code: "105" },
    { name: "Providus Bank", code: "101" },
    { name: "Signature Bank", code: "106" },
    { name: "Stanbic IBTC Bank", code: "221" },
    { name: "Standard Chartered Bank", code: "068" },
    { name: "Sterling Bank", code: "232" },
    { name: "Suntrust Bank", code: "100" },
    { name: "TAJ Bank", code: "302" },
    { name: "Titan Trust Bank", code: "102" },
    { name: "Union Bank of Nigeria", code: "032" },
    { name: "United Bank for Africa (UBA)", code: "033" },
    { name: "Unity Bank", code: "215" },
    { name: "Wema Bank", code: "035" },
    { name: "Zenith Bank", code: "057" },
  ];

  res.status(200).json({
    success: true,
    data: banks,
  });
};
