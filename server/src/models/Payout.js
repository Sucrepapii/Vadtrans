const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payout = sequelize.define(
  "Payout",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payoutReference: {
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
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "NGN",
    },
    recipientCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transferCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("queued", "processing", "success", "failed", "reversed"),
      defaultValue: "queued",
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    initiatedAt: {
      type: DataTypes.DATE,
    },
    completedAt: {
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
      { fields: ["payoutReference"] },
      { fields: ["providerId"] },
      { fields: ["status"] },
      { fields: ["recipientCode"] },
      { fields: ["transferCode"] },
    ],
  }
);

Payout.associate = (models) => {
  Payout.belongsTo(models.User, { foreignKey: "providerId", as: "provider" });
  Payout.hasMany(models.ProviderPayable, { foreignKey: "payoutId", as: "payables" });
  Payout.hasMany(models.TransactionLedger, { foreignKey: "payoutId", as: "ledgerEntries" });
};

module.exports = Payout;
