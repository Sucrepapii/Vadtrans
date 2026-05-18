const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

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
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ),
      defaultValue: "pending",
    },
    payoutStatus: {
      type: DataTypes.ENUM("pending", "settled"),
      defaultValue: "pending",
      comment: "Tracks if Vadtrans has paid the transport company for this booking",
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
    },
    vat: {
      type: DataTypes.FLOAT,
    },
    refundAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    paidAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    isDeposit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bookingStatus: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
      defaultValue: "pending",
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
          // Generate shorter unique booking ID (e.g. BK-X7Y8Z9)
          const randomStr = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          booking.bookingId = `BK-${randomStr}`;
        }
      },
    },
    indexes: [{ fields: ["userId", "createdAt"] }, { fields: ["bookingId"] }],
  },
);

// Define associations
Booking.associate = (models) => {
  Booking.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  Booking.belongsTo(models.Trip, { foreignKey: "tripId", as: "trip" });
};

module.exports = Booking;
