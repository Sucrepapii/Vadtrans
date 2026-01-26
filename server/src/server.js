const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, testConnection, dbType } = require("./config/database");

// Load env vars
dotenv.config();

// Route files
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact.routes");

// Initialize all models
const User = require("./models/User");
const Trip = require("./models/Trip");
const Booking = require("./models/Booking");
const Fare = require("./models/Fare");

// Set up model associations
const models = { User, Trip, Booking, Fare };

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

// Serve static files from uploads directory
// Serve static files from uploads directory
// __dirname is server/src, so we serve server/src/uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path, stat) => {
      // Set correct content type for PDF and images
      if (path.endsWith(".pdf")) {
        res.set("Content-Type", "application/pdf");
      }
    },
  }),
);

// Enable CORS - Allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sucrepapii-vadtrans.vercel.app",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL,
].filter(Boolean); // Remove undefined values

console.log("🔒 Allowed CORS origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log("📡 Incoming request from origin:", origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("✅ Allowing request with no origin");
      return callback(null, true);
    }

    // Check if origin is in allowed list or if it's a Vercel deployment
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith(".vercel.app")
    ) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable pre-flight for all routes

// Test database connection and sync models
const initializeDatabase = async () => {
  try {
    await testConnection();
    // Sync all models with database (alter: true updates schema)
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized");

    // Check if any users exist, if not create default admin
    const userCount = await User.count();
    if (userCount === 0) {
      console.log("ℹ️ No users found. Creating default admin...");
      await User.create({
        name: "Vadrans Admin",
        email: "admin@vadtrans.com",
        password: "Admin@123",
        phone: "+234123456789",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Default admin created: admin@vadtrans.com / Admin@123");
    }
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
};

initializeDatabase();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/faqs", require("./routes/faqRoutes"));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    database: dbType,
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

// Only listen if run directly (not imported as a Vercel function)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`💾 Database: SQLite (file-based)`);
  });
}

module.exports = app;
