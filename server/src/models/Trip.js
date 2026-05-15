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
    fromCountry: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Nigeria",
    },
    toCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fromState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceCategory: {
      type: DataTypes.ENUM("passenger", "freight"),
      allowNull: false,
      defaultValue: "passenger",
      comment:
        "Distinguishes between passenger travel and freight/cargo logistics",
    },
    transportType: {
      type: DataTypes.ENUM("inter-state", "international", "carpooling"),
      allowNull: false,
      comment:
        "inter-state: Nigeria state-to-state | international: West Africa cross-border | carpooling: Shared rides with flexible windows",
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Bus",
    },
    vehicleName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Specific name/model of the vehicle (e.g. Toyota Corolla)",
    },
    freightType: {
      type: DataTypes.ENUM("Small Parcel", "Medium Cargo", "Large/Bulk Cargo"),
      allowNull: true,
      comment: "Only applicable if serviceCategory is freight",
    },
    terminal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehiclePlateNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Plate number of the vehicle (e.g. LAG-123-XY)",
    },
    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Specific pickup point or terminal address",
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "For carpooling trips: the state within which cities are located",
    },
    timeWindowStart: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Carpooling start time (e.g. 7:00 AM)",
    },
    timeWindowEnd: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Carpooling end time (e.g. 7:15 AM)",
    },
    minSeats: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    cancellationWindow: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 12,
      comment: "Hours before departure for free cancellation",
    },
    confirmationWindow: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 2,
      comment: "Hours before departure to confirm seat",
    },
    departureTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departureDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "The specific date for this trip instance",
    },
    operatingDays: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "Comma-separated days of the week the trip runs (e.g., 'Monday,Tuesday')",
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
    baseFare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Base fare for freight trips",
    },
    pricePerKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Price per kg for freight trips",
    },
    minCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: "Minimum charge for freight trips",
    },
    maxWeightCapacity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      comment: "Maximum weight capacity in kg for freight trips",
    },
    documentPrices: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Map of document types to prices",
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    bookedSeats: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of occupied seat numbers",
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: "JSON object for ride preferences (smoking, pets, music, ac, etc.)",
    },
    stops: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Array of drop-off points with prices: [{ city: 'VI', price: 2000 }]",
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
    driverContact: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Contact number for the driver/captain",
    },
  },
  {
    timestamps: true,
    indexes: [
      // Primary search filter — status + serviceCategory (most common query)
      { fields: ["status", "serviceCategory"] },
      // Date-based filtering
      { fields: ["departureDate"] },
      // Company portal: fetch own trips
      { fields: ["companyId"] },
      // Transport type filter
      { fields: ["transportType"] },
      // Compound: the exact shape of the landing page query
      { fields: ["status", "serviceCategory", "transportType"] },
      // Route search
      { fields: ["from"] },
      { fields: ["to"] },
    ],
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
