const User = require("../models/User");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const Fare = require("../models/Fare");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.count({ where: { role: "traveler" } });
    const totalCompanies = await User.count({ where: { role: "company" } });
    const totalTrips = await Trip.count();
    const totalBookings = await Booking.count();

    // Calculate revenue (sum of completed bookings)
    const revenueData = await Booking.findAll({
      where: { bookingStatus: "completed" },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
      ],
    });
    const totalRevenue = revenueData[0]?.dataValues?.total || 0;

    // Recent bookings
    const recentBookings = await Booking.findAll({
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

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        totalTrips,
        totalBookings,
        totalRevenue: parseFloat(totalRevenue) || 0,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
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
      group: ["User.id"],
      order: [[sequelize.literal("bookingCount"), "DESC"]],
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
