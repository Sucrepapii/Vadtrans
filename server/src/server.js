const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, testConnection } = require("./config/database");

// Load env vars
dotenv.config();

// Route files
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const bookingRoutes = require("./routes/bookings");

// Initialize all models
const User = require("./models/User");
const Trip = require("./models/Trip");
const Booking = require("./models/Booking");

// Set up model associations
const models = { User, Trip, Booking };

// Call associate methods if they exist
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Initialize express
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS - Allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.VERCEL_URL,
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list or if it's a Vercel deployment
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Test database connection and sync models
const initializeDatabase = async () => {
  try {
    await testConnection();
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
};

initializeDatabase();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    database: "SQLite",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Database: SQLite (file-based)`);
});

module.exports = app;
