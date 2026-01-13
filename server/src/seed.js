const dotenv = require("dotenv");
const { sequelize, testConnection } = require("./config/database");

// Import models to ensure they're registered
const User = require("./models/User");
const Trip = require("./models/Trip");
const Booking = require("./models/Booking");

// Set up model associations
const models = { User, Trip, Booking };
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Load env vars
dotenv.config();

// Seed database
const seedDatabase = async () => {
  try {
    await testConnection();

    // Sync database - force recreate
    await sequelize.sync({ force: true });
    console.log("✅ Database synchronized\n");

    console.log("✅ Database is ready!");
    console.log(
      "ℹ️  Trips table is empty - companies can add trips via TicketsManagement page"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
