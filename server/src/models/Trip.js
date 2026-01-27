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
      type: DataTypes.ENUM("inter-state", "international", "intra-state"),
      allowNull: false,
      comment:
        "inter-state: Nigeria state-to-state | international: West Africa cross-border | intra-state: City-to-city within same state",
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Bus",
    },
    terminal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.ENUM("active", "inactive", "cancelled", "completed"),
      defaultValue: "active",
    },
    // Tracking fields
    currentLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    currentLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    currentLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Human readable location description",
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
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
  },
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
