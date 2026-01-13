const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Trip = require("./Trip");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookingId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Auto-generated in beforeCreate hook
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Trips",
        key: "id",
      },
    },
    passengers: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    selectedSeats: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("card", "bank", "mobile"),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    paymentReference: {
      type: DataTypes.STRING,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    serviceFee: {
      type: DataTypes.FLOAT,
      defaultValue: 5,
    },
    bookingStatus: {
      type: DataTypes.ENUM("confirmed", "cancelled", "completed"),
      defaultValue: "confirmed",
    },
    cancellationReason: {
      type: DataTypes.STRING,
    },
    cancelledAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: (booking) => {
        if (!booking.bookingId) {
          booking.bookingId = `BK-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;
        }
      },
    },
    indexes: [{ fields: ["userId", "createdAt"] }, { fields: ["bookingId"] }],
  }
);

// Define associations
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });
Booking.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });

module.exports = Booking;
