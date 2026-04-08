const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("payment", "cancellation", "system"),
      allowNull: false,
      defaultValue: "system",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    relatedBookingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);
// Define associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

module.exports = Notification;
