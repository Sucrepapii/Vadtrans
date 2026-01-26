const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FAQ = sequelize.define("FAQ", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "General",
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = FAQ;
