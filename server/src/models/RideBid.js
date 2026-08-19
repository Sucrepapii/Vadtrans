const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RideBid = sequelize.define(
  "RideBid",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "PrivateRideRequests",
        key: "id",
      },
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    bidAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected", "negotiating", "counter_offered"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["requestId"] },
      { fields: ["driverId"] },
    ],
  }
);

RideBid.associate = (models) => {
  RideBid.belongsTo(models.PrivateRideRequest, { foreignKey: "requestId", as: "request" });
  RideBid.belongsTo(models.User, { foreignKey: "driverId", as: "driver" });
};

module.exports = RideBid;
