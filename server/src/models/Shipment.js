const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Shipment = sequelize.define(
  "Shipment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trackingId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Auto-generated in beforeCreate hook
    },
    userId: {
      type: DataTypes.INTEGER, // The sender
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    tripId: {
      type: DataTypes.INTEGER, // The cargo truck schedule
      allowNull: false,
      references: {
        model: "Trips",
        key: "id",
      },
    },
    senderDetails: {
      type: DataTypes.JSON, // name, phone, email, address
      allowNull: false,
    },
    receiverDetails: {
      type: DataTypes.JSON, // name, phone, email, address
      allowNull: false,
    },
    cargoDetails: {
      type: DataTypes.JSON, // description, weight, dimensions, value
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        "card",
        "bank",
        "mobile",
        "paystack",
        "pay_on_delivery",
      ),
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
    trackingStatus: {
      type: DataTypes.ENUM(
        "pending_approval",
        "pickup",
        "in_transit",
        "arrived",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending_approval",
    },
    statusMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Optional message for the tracking timeline",
    },
    trackingHistory: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Array of tracking status updates with timestamps",
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
      beforeCreate: (shipment) => {
        if (!shipment.trackingId) {
          // Generate unique tracking ID (e.g. FR-X7Y8Z9)
          const randomStr = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          shipment.trackingId = `FR-${randomStr}`;
        }

        // Initialize tracking history
        shipment.trackingHistory = [
          {
            status: "pending_approval",
            message: "Shipment booked and awaiting approval",
            timestamp: new Date().toISOString(),
          },
        ];
      },
      beforeUpdate: (shipment) => {
        if (shipment.changed("trackingStatus")) {
          let history = shipment.trackingHistory || [];
          // Parse if it happens to be a string
          if (typeof history === "string") {
            try {
              history = JSON.parse(history);
            } catch (e) {}
          }
          if (Array.isArray(history)) {
            history.push({
              status: shipment.trackingStatus,
              message:
                shipment.statusMessage ||
                `Status updated to ${shipment.trackingStatus}`,
              timestamp: new Date().toISOString(),
            });
            shipment.trackingHistory = history;
          }
        }
      },
    },
    indexes: [{ fields: ["userId", "createdAt"] }, { fields: ["trackingId"] }],
  },
);

// Define associations
Shipment.associate = (models) => {
  Shipment.belongsTo(models.User, { foreignKey: "userId", as: "sender" });
  Shipment.belongsTo(models.Trip, { foreignKey: "tripId", as: "trip" });
};

module.exports = Shipment;
