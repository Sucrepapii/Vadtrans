const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Trip = sequelize.define(
  "Trip",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transportType: {
      type: DataTypes.ENUM(
        "bus-domestic",
        "bus-international",
        "car-domestic",
        "car-international"
      ),
      allowNull: false,
    },
    departureTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Journey duration in hours (e.g., '12', '6.5')",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "cancelled"),
      defaultValue: "active",
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Define association
Trip.associate = (models) => {
  Trip.belongsTo(models.User, {
    foreignKey: "companyId",
    as: "company",
  });
  Trip.hasMany(models.Booking, {
    foreignKey: "tripId",
    as: "bookings",
  });
};

module.exports = Trip;
