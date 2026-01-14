const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Fare = sequelize.define(
  "Fare",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Route name, e.g., 'Lagos - Abuja'",
    },
    bus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Bus fare for this route",
    },
    train: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Train fare for this route",
    },
    flight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Flight fare for this route",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "fares",
    timestamps: true,
  }
);

module.exports = Fare;
