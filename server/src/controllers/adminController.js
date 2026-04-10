const User = require("../models/User");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const Shipment = require("../models/Shipment");
const Fare = require("../models/Fare");
const Notification = require("../models/Notification");
const Review = require("../models/Review");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { sendAccountDeletedEmail } = require("../utils/emailService");

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts with individual try-catch to prevent complete failure
    let totalUsers = 0, totalCompanies = 0, totalTrips = 0, totalBookings = 0, totalShipments = 0;
    try { totalUsers = await User.count({ where: { role: "traveler" } }); } catch (e) { console.error("totalUsers err:", e.message); }
    try { totalCompanies = await User.count({ where: { role: "company" } }); } catch (e) { console.error("totalCompanies err:", e.message); }
    try { totalTrips = await Trip.count(); } catch (e) { console.error("totalTrips err:", e.message); }
    try { totalBookings = await Booking.count(); } catch (e) { console.error("totalBookings err:", e.message); }
    try { totalShipments = await Shipment.count(); } catch (e) { console.error("totalShipments err:", e.message); }

    // Calculate revenue (sum of paid or manually completed bookings)
    let totalRevenueNaira = 0;
    try {
      const revenueData = await Booking.findAll({
        where: {
          [Op.or]: [{ paymentStatus: "paid" }, { bookingStatus: "completed" }],
        },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
        ],
      });
      totalRevenueNaira = revenueData[0]?.dataValues?.total
        ? parseFloat(revenueData[0].dataValues.total)
        : 0;
    } catch (e) {
      console.error("Revenue sum err:", e.message);
    }

    console.log("📊 [STATS] Parsed Naira Revenue:", totalRevenueNaira);

    // Exchange rate (approximate, should ideally come from an API or config)
    const NGN_USD_RATE = 1500;
    let totalRevenueUSD = totalRevenueNaira / NGN_USD_RATE;

    // Moderator Restriction: Cannot see revenue stats
    if (req.user && req.user.role === "moderator") {
      totalRevenueNaira = 0;
      totalRevenueUSD = 0;
      console.log("🛡️ [STATS] Moderator role detected - zeroing revenue stats");
    }

    // Recent bookings
    let recentBookings = [];
    try {
      recentBookings = await Booking.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: Trip,
            as: "trip",
            attributes: ["id", "from", "to", "departureTime"],
            include: [
              {
                model: User,
                as: "company",
                attributes: ["name"],
              },
            ],
          },
        ],
      });
    } catch (e) {
      console.error("recentBookings err:", e.message);
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        totalTrips,
        totalBookings,
        totalShipments,
        totalRevenue: totalRevenueNaira,
        totalRevenueUSD: totalRevenueUSD,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
      detail:
        error.name === "SequelizeDatabaseError" ? error.parent.message : null,
    });
  }
};

// @desc    Get all trips (admin view)
// @route   GET /api/admin/trips
// @access  Private/Admin
exports.getAllTrips = async (req, res) => {
  try {
    const { status, transportType, company } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (transportType) whereClause.type = transportType;
    if (company) whereClause.company = { [Op.like]: `%${company}%` };

    const trips = await Trip.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trips",
      error: error.message,
    });
  }
};

// @desc    Update trip (admin)
// @route   PUT /api/admin/trips/:id
// @access  Private/Admin
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    await trip.update(req.body);

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });
  } catch (error) {
    console.error("Error updated trip:", error);
    res.status(500).json({
      success: false,
      message: "Error updating trip",
      error: error.message,
    });
  }
};

// @desc    Delete trip (admin)
// @route   DELETE /api/admin/trips/:id
// @access  Private/Admin
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    await trip.destroy();

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting trip",
      error: error.message,
    });
  }
};

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const whereClause = {};
    if (status) whereClause.bookingStatus = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Trip,
          as: "trip",
          attributes: ["id", "from", "to", "departureTime", "companyId"],
          include: [
            {
              model: User,
              as: "company",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
      detail:
        error.name === "SequelizeDatabaseError" ? error.parent.message : null,
    });
  }
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await booking.update({ bookingStatus: status });

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const whereClause = {};
    if (role) whereClause.role = role;

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow password updates through this endpoint
    const { password, ...updateData } = req.body;

    await user.update(updateData);

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// @desc    Get all fares
// @route   GET /api/admin/fares
// @access  Private/Admin
exports.getAllFares = async (req, res) => {
  try {
    const fares = await Fare.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: fares.length,
      data: fares,
    });
  } catch (error) {
    console.error("❌ Error fetching fares:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching fares",
      error: error.message,
    });
  }
};

// @desc    Create fare
// @route   POST /api/admin/fares
// @access  Private/Admin
exports.createFare = async (req, res) => {
  try {
    const fare = await Fare.create(req.body);

    res.status(201).json({
      success: true,
      message: "Fare created successfully",
      data: fare,
    });
  } catch (error) {
    console.error("Error creating fare:", error);
    res.status(500).json({
      success: false,
      message: "Error creating fare",
      error: error.message,
    });
  }
};

// @desc    Update fare
// @route   PUT /api/admin/fares/:id
// @access  Private/Admin
exports.updateFare = async (req, res) => {
  try {
    const fare = await Fare.findByPk(req.params.id);

    if (!fare) {
      return res.status(404).json({
        success: false,
        message: "Fare not found",
      });
    }

    await fare.update(req.body);

    res.status(200).json({
      success: true,
      message: "Fare updated successfully",
      data: fare,
    });
  } catch (error) {
    console.error("Error updating fare:", error);
    res.status(500).json({
      success: false,
      message: "Error updating fare",
      error: error.message,
    });
  }
};

// @desc    Delete fare
// @route   DELETE /api/admin/fares/:id
// @access  Private/Admin
exports.deleteFare = async (req, res) => {
  try {
    const fare = await Fare.findByPk(req.params.id);

    if (!fare) {
      return res.status(404).json({
        success: false,
        message: "Fare not found",
      });
    }

    await fare.destroy();

    res.status(200).json({
      success: true,
      message: "Fare deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fare:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting fare",
      error: error.message,
    });
  }
};

// @desc    Get top companies by booking count
// @route   GET /api/admin/top-companies
// @access  Private/Admin
exports.getTopCompanies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get all companies with their booking counts
    const companies = await User.findAll({
      where: { role: "company" },
      attributes: [
        "id",
        "name",
        "email",
        [
          sequelize.fn("COUNT", sequelize.col("trips.bookings.id")),
          "bookingCount",
        ],
      ],
      include: [
        {
          model: Trip,
          as: "trips",
          attributes: [],
          include: [
            {
              model: Booking,
              as: "bookings",
              attributes: [],
            },
          ],
        },
      ],
      group: ["User.id", "User.name", "User.email"], // Postgres requires all non-aggregated SELECT columns in GROUP BY
      order: [[sequelize.literal('"bookingCount"'), "DESC"]],
      limit: limit,
      subQuery: false,
    });

    // Format the response
    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      email: company.email,
      bookingCount: parseInt(company.dataValues.bookingCount) || 0,
    }));

    res.status(200).json({
      success: true,
      count: formattedCompanies.length,
      data: formattedCompanies,
    });
  } catch (error) {
    console.error("❌ Error fetching top companies:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching top companies",
      error: error.message,
    });
  }
};

// @desc    Get all companies
// @route   GET /api/admin/companies
// @access  Private/Admin
exports.getAllCompanies = async (req, res) => {
  try {
    const { verificationStatus } = req.query;

    const whereClause = { role: "company" };
    if (verificationStatus) whereClause.verificationStatus = verificationStatus;

    const companies = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching companies",
      error: error.message,
    });
  }
};

// @desc    Approve a company
// @route   PUT /api/admin/companies/:id/approve
// @access  Private/Admin
exports.approveCompany = async (req, res) => {
  try {
    const company = await User.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (company.role !== "company") {
      return res.status(400).json({
        success: false,
        message: "User is not a company",
      });
    }

    const { comment } = req.body;
    await company.update({ 
      verificationStatus: "verified",
      verificationComment: comment || "Congratulations! Your company has been verified."
    });

    // Create notification for the company
    try {
      await Notification.create({
        userId: company.id,
        message: `Your company registration has been approved. ${comment ? 'Comment: ' + comment : ''}`,
        type: "system"
      });
    } catch (notifError) {
      console.error("Error creating approval notification:", notifError);
    }

    const companyData = company.toJSON();
    delete companyData.password;

    res.status(200).json({
      success: true,
      message: "Company approved successfully",
      data: companyData,
    });
  } catch (error) {
    console.error("Error approving company:", error);
    res.status(500).json({
      success: false,
      message: "Error approving company",
      error: error.message,
    });
  }
};

// @desc    Reject a company
// @route   PUT /api/admin/companies/:id/reject
// @access  Private/Admin
exports.rejectCompany = async (req, res) => {
  try {
    const company = await User.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (company.role !== "company") {
      return res.status(400).json({
        success: false,
        message: "User is not a company",
      });
    }

    const { comment } = req.body;
    await company.update({ 
      verificationStatus: "rejected",
      verificationComment: comment || "Unfortunately, your registration was not approved at this time."
    });

    // Create notification for the company
    try {
      await Notification.create({
        userId: company.id,
        message: `Your company registration was rejected. Reason: ${comment || 'No specific reason provided.'}`,
        type: "system"
      });
    } catch (notifError) {
      console.error("Error creating rejection notification:", notifError);
    }

    const companyData = company.toJSON();
    delete companyData.password;

    res.status(200).json({
      success: true,
      message: "Company rejected successfully",
      data: companyData,
    });
  } catch (error) {
    console.error("Error rejecting company:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting company",
      error: error.message,
    });
  }
};

// @desc    Delete user/company (hard delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Finance Restriction: Cannot delete users
    if (req.user && req.user.role === "finance") {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Finance role is not authorized to delete users/companies",
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log(`🗑️ Deleting ${user.role}: ${user.name} (ID: ${user.id})`);

    // 1. Delete associated data based on role
    if (user.role === "company") {
      // Find all trips owned by this company
      const companyTrips = await Trip.findAll({
        where: { companyId: user.id },
        transaction,
      });
      const tripIds = companyTrips.map((t) => t.id);

      if (tripIds.length > 0) {
        console.log(`   - Deleting ${tripIds.length} trips and their associations...`);
        
        // Delete bookings associated with these trips
        await Booking.destroy({
          where: { tripId: { [Op.in]: tripIds } },
          transaction,
        });

        // Delete shipments associated with these trips
        await Shipment.destroy({
          where: { tripId: { [Op.in]: tripIds } },
          transaction,
        });

        // Delete the trips
        await Trip.destroy({
          where: { id: { [Op.in]: tripIds } },
          transaction,
        });
      }
    }

    // 2. Delete data common to all users
    // Delete bookings made by this user
    await Booking.destroy({
      where: { userId: user.id },
      transaction,
    });

    // Delete shipments sent by this user
    await Shipment.destroy({
      where: { userId: user.id },
      transaction,
    });

    // Delete notifications for this user
    await Notification.destroy({
      where: { userId: user.id },
      transaction,
    });

    // Delete reviews by this user
    await Review.destroy({
      where: { userId: user.id },
      transaction,
    });

    // 3. Delete the user record
    await user.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    // 4. Send deletion notification email (outside transaction)
    try {
      await sendAccountDeletedEmail(userData);
    } catch (emailError) {
      console.error("⚠️ Failed to send deletion email:", emailError.message);
      // We don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: `${user.role === "company" ? "Company" : "User"} and all associated data deleted successfully. Notification email sent.`,
    });
  } catch (error) {
    // If we've already committed, we don't rollback
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: `Error deleting user: ${error.message}`,
      details: error.parent?.detail || error.original?.message || error.message,
      error: error.message,
    });
  }
};

// @desc    Get all staff (admin, finance, moderator)
// @route   GET /api/admin/staff
// @access  Private/Admin
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: {
        role: { [Op.in]: ["admin", "finance", "moderator"] },
      },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching staff members",
      error: error.message,
    });
  }
};

// @desc    Create new staff member
// @route   POST /api/admin/staff
// @access  Private/Admin
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password and role",
      });
    }

    // Check if role is a staff role
    if (!["admin", "finance", "moderator"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role provided",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create staff user
    const staff = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || "",
      isVerified: true, // Staff accounts are auto-verified
    });

    // Remove password from response
    const staffData = staff.toJSON();
    delete staffData.password;

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: staffData,
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({
      success: false,
      message: "Error creating staff member",
      error: error.message,
    });
  }
};
