const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likedBy: {
      type: DataTypes.JSON, // Array of user IDs who liked this review
      defaultValue: [],
    },
  },
  {
    timestamps: true,
  },
);

Review.associate = (models) => {
  Review.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

module.exports = Review;
