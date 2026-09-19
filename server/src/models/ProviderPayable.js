const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProviderPayable = sequelize.define(
  "ProviderPayable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payableId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
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
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Trips",
        key: "id",
      },
    },
    grossAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    commissionRate: {
      type: DataTypes.FLOAT,
      defaultValue: 0.10, // 10% platform commission
    },
    commissionAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    gatewayFeeDeducted: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    netPayableAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payoutCondition: {
      type: DataTypes.ENUM("trip_completed", "instant", "manual"),
      defaultValue: "trip_completed",
    },
    status: {
      type: DataTypes.ENUM(
        "pending_trip",
        "eligible",
        "queued",
        "paid",
        "cancelled",
        "refunded"
      ),
      defaultValue: "pending_trip",
    },
    eligibleAt: {
      type: DataTypes.DATE,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    payoutId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Payouts",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["payableId"] },
      { fields: ["providerId"] },
      { fields: ["bookingId"] },
      { fields: ["privateRideId"] },
      { fields: ["status"] },
      { fields: ["payoutId"] },
    ],
  }
);

ProviderPayable.associate = (models) => {
  ProviderPayable.belongsTo(models.User, { foreignKey: "providerId", as: "provider" });
  ProviderPayable.belongsTo(models.Booking, { foreignKey: "bookingId", as: "booking" });
  ProviderPayable.belongsTo(models.PrivateRideRequest, { foreignKey: "privateRideId", as: "privateRide" });
  ProviderPayable.belongsTo(models.Trip, { foreignKey: "tripId", as: "trip" });
  ProviderPayable.belongsTo(models.Payout, { foreignKey: "payoutId", as: "payout" });
};

module.exports = ProviderPayable;
