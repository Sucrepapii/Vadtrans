const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("../models/User");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const PrivateRideRequest = require("../models/PrivateRideRequest");

// @desc    Get all companies with their unpaid balances (Admin)
// @route   GET /api/earnings/companies
// @access  Private/Admin
exports.getCompanyEarnings = async (req, res) => {
  try {
    // We want to list all companies, and for each, calculate:
    // Total unpaid earnings: Sum of (booking.totalAmount - booking.serviceFee)
    // where booking.paymentStatus = 'paid' and booking.payoutStatus = 'pending'

    const companies = await User.findAll({
      where: { role: "company" },
      attributes: ["id", "name", "email", "phone"],
    });

    const companyEarnings = await Promise.all(
      companies.map(async (company) => {
        const bookings = await Booking.findAll({
          where: {
            paymentStatus: "paid",
            payoutStatus: "pending",
          },
          include: [
            {
              model: Trip,
              as: "trip",
              where: { companyId: company.id },
              attributes: [],
            },
          ],
        });

        const pendingBalance = bookings.reduce((sum, booking) => {
          const amount = parseFloat(booking.totalAmount) || 0;
          const fee = parseFloat(booking.serviceFee) || 0;
          return sum + (amount - fee);
        }, 0);

        // Fetch pending private rides
        const privateRides = await PrivateRideRequest.findAll({
          where: {
            driverId: company.id,
            paymentStatus: "paid",
            payoutStatus: "pending",
          }
        });

        const pendingPrivateBalance = privateRides.reduce((sum, ride) => {
          const agreedPrice = parseFloat(ride.agreedPrice) || 0;
          const commission = parseFloat(ride.commissionAmount) || 0;
          return sum + (agreedPrice - commission);
        }, 0);

        return {
          ...company.toJSON(),
          pendingBalance: pendingBalance + pendingPrivateBalance,
          pendingBookingsCount: bookings.length + privateRides.length,
        };
      })
    );

    // Sort by pending balance descending
    companyEarnings.sort((a, b) => b.pendingBalance - a.pendingBalance);

    res.status(200).json({
      success: true,
      data: companyEarnings,
    });
  } catch (error) {
    console.error("Error fetching company earnings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company earnings",
      error: error.message,
    });
  }
};

// @desc    Mark a company's pending earnings as paid (Admin)
// @route   PUT /api/earnings/companies/:companyId/settle
// @access  Private/Admin
exports.markEarningsAsPaid = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { companyId } = req.params;

    // Find all pending paid bookings for this company
    const bookings = await Booking.findAll({
      where: {
        paymentStatus: "paid",
        payoutStatus: "pending",
      },
      include: [
        {
          model: Trip,
          as: "trip",
          where: { companyId: companyId },
          attributes: ["id"],
        },
      ],
      transaction,
    });

    // Find all pending paid private rides for this company
    const privateRides = await PrivateRideRequest.findAll({
      where: {
        driverId: companyId,
        paymentStatus: "paid",
        payoutStatus: "pending",
      },
      transaction,
    });

    if (bookings.length === 0 && privateRides.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "No pending earnings to settle for this company.",
      });
    }

    const bookingIds = bookings.map((b) => b.id);
    const privateRideIds = privateRides.map((r) => r.id);

    const totalSettledBookings = bookings.reduce((sum, booking) => {
      const amount = parseFloat(booking.totalAmount) || 0;
      const fee = parseFloat(booking.serviceFee) || 0;
      return sum + (amount - fee);
    }, 0);

    const totalSettledPrivate = privateRides.reduce((sum, ride) => {
      const agreedPrice = parseFloat(ride.agreedPrice) || 0;
      const commission = parseFloat(ride.commissionAmount) || 0;
      return sum + (agreedPrice - commission);
    }, 0);

    const totalSettled = totalSettledBookings + totalSettledPrivate;

    // Update payoutStatus to settled for bookings
    if (bookingIds.length > 0) {
      await Booking.update(
        { payoutStatus: "settled" },
        {
          where: { id: { [Op.in]: bookingIds } },
          transaction,
        }
      );
    }

    // Update payoutStatus to settled for private rides
    if (privateRideIds.length > 0) {
      await PrivateRideRequest.update(
        { payoutStatus: "settled" },
        {
          where: { id: { [Op.in]: privateRideIds } },
          transaction,
        }
      );
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Successfully settled ₦${totalSettled.toLocaleString()} for company.`,
      settledAmount: totalSettled,
      bookingsSettled: bookingIds.length + privateRideIds.length,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error settling earnings:", error);
    res.status(500).json({
      success: false,
      message: "Error settling earnings",
      error: error.message,
    });
  }
};

// @desc    Get current company's earnings (Company)
// @route   GET /api/earnings/my-earnings
// @access  Private/Company
exports.getMyEarnings = async (req, res) => {
  try {
    const companyId = req.user.id;

    // Pending Earnings
    const pendingBookings = await Booking.findAll({
      where: {
        paymentStatus: "paid",
        payoutStatus: "pending",
      },
      include: [
        {
          model: Trip,
          as: "trip",
          where: { companyId: companyId },
          attributes: [],
        },
      ],
    });

    const pendingBalance = pendingBookings.reduce((sum, booking) => {
      const amount = parseFloat(booking.totalAmount) || 0;
      const fee = parseFloat(booking.serviceFee) || 0;
      return sum + (amount - fee);
    }, 0);

    // Pending Private Rides
    const pendingPrivateRides = await PrivateRideRequest.findAll({
      where: {
        driverId: companyId,
        paymentStatus: "paid",
        payoutStatus: "pending",
      }
    });

    const pendingPrivateBalance = pendingPrivateRides.reduce((sum, ride) => {
      const agreedPrice = parseFloat(ride.agreedPrice) || 0;
      const commission = parseFloat(ride.commissionAmount) || 0;
      return sum + (agreedPrice - commission);
    }, 0);

    // Total Historical Earnings (Settled + Pending)
    const allPaidBookings = await Booking.findAll({
      where: {
        paymentStatus: "paid",
      },
      include: [
        {
          model: Trip,
          as: "trip",
          where: { companyId: companyId },
          attributes: [],
        },
      ],
    });

    const totalEarnings = allPaidBookings.reduce((sum, booking) => {
      const amount = parseFloat(booking.totalAmount) || 0;
      const fee = parseFloat(booking.serviceFee) || 0;
      return sum + (amount - fee);
    }, 0);

    // Total Historical Private Rides
    const allPaidPrivateRides = await PrivateRideRequest.findAll({
      where: {
        driverId: companyId,
        paymentStatus: "paid",
      }
    });

    const totalPrivateEarnings = allPaidPrivateRides.reduce((sum, ride) => {
      const agreedPrice = parseFloat(ride.agreedPrice) || 0;
      const commission = parseFloat(ride.commissionAmount) || 0;
      return sum + (agreedPrice - commission);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        pendingBalance: pendingBalance + pendingPrivateBalance,
        totalEarnings: totalEarnings + totalPrivateEarnings,
        pendingBookingsCount: pendingBookings.length + pendingPrivateRides.length,
        totalBookingsCount: allPaidBookings.length + allPaidPrivateRides.length,
      },
    });
  } catch (error) {
    console.error("Error fetching my earnings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching earnings",
      error: error.message,
    });
  }
};
