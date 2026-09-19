const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Bookings",
        key: "id",
      },
    },
    privateRideId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "PrivateRideRequests",
        key: "id",
      },
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    grossAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    gatewayFee: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    netAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "NGN",
    },
    channel: {
      type: DataTypes.STRING,
      defaultValue: "card",
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending",
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["reference"] },
      { fields: ["bookingId"] },
      { fields: ["privateRideId"] },
      { fields: ["providerId"] },
      { fields: ["userId"] },
      { fields: ["status"] },
    ],
  }
);

Payment.associate = (models) => {
  Payment.belongsTo(models.Booking, { foreignKey: "bookingId", as: "booking" });
  Payment.belongsTo(models.PrivateRideRequest, { foreignKey: "privateRideId", as: "privateRide" });
  Payment.belongsTo(models.User, { foreignKey: "providerId", as: "provider" });
  Payment.belongsTo(models.User, { foreignKey: "userId", as: "passenger" });
  Payment.hasMany(models.TransactionLedger, { foreignKey: "paymentId", as: "ledgerEntries" });
};

module.exports = Payment;
