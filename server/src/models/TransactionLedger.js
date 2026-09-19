const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TransactionLedger = sequelize.define(
  "TransactionLedger",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ledgerId: {
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
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Payments",
        key: "id",
      },
    },
    payoutId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Payouts",
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
    entryType: {
      type: DataTypes.ENUM(
        "PAYMENT_INFLOW",
        "GATEWAY_FEE",
        "COMMISSION_REVENUE",
        "PROVIDER_PAYABLE_CREDIT",
        "PAYOUT_DISBURSEMENT",
        "REFUND_DISBURSEMENT"
      ),
      allowNull: false,
    },
    direction: {
      type: DataTypes.ENUM("CREDIT", "DEBIT"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "NGN",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    balanceAfter: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["ledgerId"] },
      { fields: ["bookingId"] },
      { fields: ["privateRideId"] },
      { fields: ["paymentId"] },
      { fields: ["payoutId"] },
      { fields: ["providerId"] },
      { fields: ["entryType"] },
      { fields: ["createdAt"] },
    ],
  }
);

TransactionLedger.associate = (models) => {
  TransactionLedger.belongsTo(models.Booking, { foreignKey: "bookingId", as: "booking" });
  TransactionLedger.belongsTo(models.PrivateRideRequest, { foreignKey: "privateRideId", as: "privateRide" });
  TransactionLedger.belongsTo(models.Payment, { foreignKey: "paymentId", as: "payment" });
  TransactionLedger.belongsTo(models.Payout, { foreignKey: "payoutId", as: "payout" });
  TransactionLedger.belongsTo(models.User, { foreignKey: "providerId", as: "provider" });
  TransactionLedger.belongsTo(models.User, { foreignKey: "userId", as: "user" });
};

module.exports = TransactionLedger;
