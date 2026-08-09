const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PrivateRideRequest = sequelize.define(
  "PrivateRideRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    requestId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    passengerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    pickupState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destinationState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stops: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    pickupDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pickupTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rideType: {
      type: DataTypes.ENUM("one-way", "round-trip", "full-day"),
      allowNull: false,
    },
    passengersCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    luggageInfo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    needsAC: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM("searching", "awaiting_payment", "driver_assigned", "en_route", "arrived", "started", "completed", "cancelled"),
      defaultValue: "searching",
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    agreedPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    commissionAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    payoutStatus: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    cancellationReason: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: (request) => {
        if (!request.requestId) {
          const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
          request.requestId = `PR-${randomStr}`;
        }
      },
    },
    indexes: [
      { fields: ["status"] },
      { fields: ["passengerId"] },
      { fields: ["driverId"] },
    ],
  }
);

PrivateRideRequest.associate = (models) => {
  PrivateRideRequest.belongsTo(models.User, { foreignKey: "passengerId", as: "passenger" });
  PrivateRideRequest.belongsTo(models.User, { foreignKey: "driverId", as: "driver" });
  if (models.RideBid) {
    PrivateRideRequest.hasMany(models.RideBid, { foreignKey: "requestId", as: "bids" });
  }
};

module.exports = PrivateRideRequest;
