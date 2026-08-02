const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Lead = sequelize.define("Lead", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: "Email address is already subscribed.",
    },
    validate: {
      isEmail: {
        msg: "Please provide a valid email address.",
      },
    },
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: "chatbot",
  },
});

module.exports = Lead;
