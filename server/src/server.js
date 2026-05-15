const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const { sequelize, testConnection, dbType } = require("./config/database");
const { Op } = require("sequelize");

// Load env vars
dotenv.config();

// Bypass self-signed certs in development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Route files
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const contactRoutes = require("./routes/contact.routes");
const paymentRoutes = require("./routes/payment");

// Initialize all models
const User = require("./models/User");
const Trip = require("./models/Trip");
const Booking = require("./models/Booking");
const Fare = require("./models/Fare");
const FAQ = require("./models/FAQ");
const Review = require("./models/Review");
const Notification = require("./models/Notification");
const Shipment = require("./models/Shipment");

// Set up model associations
const models = {
  User,
  Trip,
  Booking,
  Fare,
  FAQ,
  Review,
  Notification,
  Shipment,
};

// Call associate methods if they exist
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Initialize express
const app = express();

// Trust proxy for express-rate-limit behind proxies (like Railway)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }),
);

// Gzip compression — reduces JSON responses by ~70-85%
app.use(compression());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// Body parser middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

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
  "https://www.vadtrans.com",
  "https://vadtrans.com",
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

    // Allow any origin ending in .vadtrans.com or vadtrans.com
    const isVadtrans = origin.endsWith("vadtrans.com");
    // Allow Vercel preview deployments
    const isVercel = origin.includes(".vercel.app");
    
    // Check if origin is in allowed list or is a valid subdomain
    if (allowedOrigins.indexOf(origin) !== -1 || isVadtrans || isVercel) {
      console.log("✅ CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      // In production, we might want to be strict, but for debugging we provide info
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};


app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable pre-flight for all routes

// Test database connection and sync models
const initializeDatabase = async () => {
  try {
    await testConnection();
    // Sync all models with database (alter: false for production speed, manual migration handles columns)
    await sequelize.sync({ alter: false });
    // Explicitly sync Shipment and Notification to ensure they exist
    await Shipment.sync({ alter: true });
    await Notification.sync({ alter: true });
    await Booking.sync({ alter: true });
    // We do NOT use Trip.sync({ alter: true }) here because it causes syntax errors in Postgres ENUM updates.
    // Instead, we use manual migration logic below.

    // Force add missing columns for Bookings (for production environments where alter:true might fail)
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable("Bookings");

    if (!tableInfo.paidAmount) {
      console.log("ℹ️ Adding missing column 'paidAmount' to Bookings...");
      await queryInterface.addColumn("Bookings", "paidAmount", {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      });
    }
    if (!tableInfo.isDeposit) {
      console.log("ℹ️ Adding missing column 'isDeposit' to Bookings...");
      await queryInterface.addColumn("Bookings", "isDeposit", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      });
    }
    if (!tableInfo.serviceFee) {
      console.log("ℹ️ Adding missing column 'serviceFee' to Bookings...");
      await queryInterface.addColumn("Bookings", "serviceFee", {
        type: DataTypes.FLOAT,
      });
    }
    if (!tableInfo.vat) {
      console.log("ℹ️ Adding missing column 'vat' to Bookings...");
      await queryInterface.addColumn("Bookings", "vat", {
        type: DataTypes.FLOAT,
      });
    }
    if (!tableInfo.refundAmount) {
      console.log("ℹ️ Adding missing column 'refundAmount' to Bookings...");
      await queryInterface.addColumn("Bookings", "refundAmount", {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      });
    }

    // Force add missing columns for Trips
    const tripTableInfo = await queryInterface.describeTable("Trips");

    // Direct PostgreSQL Schema Fixes (Reliable for Production)
    if (dbType === "Postgres") {
      try {
        console.log("ℹ️ Ensuring critical columns exist in Trips table...");
        await sequelize.query('ALTER TABLE "Trips" ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT \'{}\';');
        await sequelize.query('ALTER TABLE "Trips" ADD COLUMN IF NOT EXISTS "stops" JSONB DEFAULT \'[]\';');
        await sequelize.query('ALTER TABLE "Trips" ADD COLUMN IF NOT EXISTS "terminal" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "Trips" ADD COLUMN IF NOT EXISTS "vehicleName" VARCHAR(255);');
        console.log("✅ Critical columns verified/added");
      } catch (err) {
        console.log("ℹ️ Postgres migration note:", err.message);
      }

      try {
        await sequelize.query(`
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_Trips_transportType' AND e.enumlabel = 'carpooling') THEN
              ALTER TYPE "enum_Trips_transportType" ADD VALUE 'carpooling';
            END IF;
          END $$;
        `);
      } catch (err) {
        console.log("ℹ️ Note: Could not update transportType ENUM (might already be up to date)");
      }

      try {
        await sequelize.query(`
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_Trips_serviceCategory' AND e.enumlabel = 'freight') THEN
              ALTER TYPE "enum_Trips_serviceCategory" ADD VALUE 'freight';
            END IF;
          END $$;
        `);
      } catch (err) {
        console.log("ℹ️ Note: Could not update serviceCategory ENUM (might already be up to date)");
      }
    }
    if (!tripTableInfo.vehiclePlateNumber) {
      console.log("ℹ️ Adding missing column 'vehiclePlateNumber' to Trips...");
      await queryInterface.addColumn("Trips", "vehiclePlateNumber", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tripTableInfo.pickupAddress) {
      console.log("ℹ️ Adding missing column 'pickupAddress' to Trips...");
      await queryInterface.addColumn("Trips", "pickupAddress", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tripTableInfo.state) {
      console.log("ℹ️ Adding missing column 'state' to Trips...");
      await queryInterface.addColumn("Trips", "state", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tripTableInfo.preferences) {
      console.log("ℹ️ Adding missing column 'preferences' to Trips...");
      await queryInterface.addColumn("Trips", "preferences", {
        type: DataTypes.JSONB, // Using JSONB for Postgres performance
        allowNull: true,
        defaultValue: {},
      });
    }
    if (!tripTableInfo.stops) {
      console.log("ℹ️ Adding missing column 'stops' to Trips...");
      await queryInterface.addColumn("Trips", "stops", {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      });
    }
    if (!tripTableInfo.terminal) {
      console.log("ℹ️ Adding missing column 'terminal' to Trips...");
      await queryInterface.addColumn("Trips", "terminal", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tripTableInfo.vehicleName) {
      console.log("ℹ️ Adding missing column 'vehicleName' to Trips...");
      await queryInterface.addColumn("Trips", "vehicleName", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tripTableInfo.bookedSeats) {
      console.log("ℹ️ Adding missing column 'bookedSeats' to Trips...");
      await queryInterface.addColumn("Trips", "bookedSeats", {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      });
    }
    if (!tripTableInfo.currentLat) {
      console.log("ℹ️ Adding missing column 'currentLat' to Trips...");
      await queryInterface.addColumn("Trips", "currentLat", {
        type: DataTypes.FLOAT,
        allowNull: true,
      });
    }
    if (!tripTableInfo.currentLng) {
      console.log("ℹ️ Adding missing column 'currentLng' to Trips...");
      await queryInterface.addColumn("Trips", "currentLng", {
        type: DataTypes.FLOAT,
        allowNull: true,
      });
    }
    if (!tripTableInfo.currentLocation) {
      console.log("ℹ️ Adding missing column 'currentLocation' to Trips...");
      await queryInterface.addColumn("Trips", "currentLocation", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
    if (!tripTableInfo.lastUpdated) {
      console.log("ℹ️ Adding missing column 'lastUpdated' to Trips...");
      await queryInterface.addColumn("Trips", "lastUpdated", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }

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

    // Check if FAQs exist, if not seed default FAQs
    const faqCount = await FAQ.count();
    if (faqCount === 0) {
      console.log("ℹ️ No FAQs found. Seeding default FAQs...");
      const defaultFAQs = [
        {
          question: "How do I book a ticket on VadTrans?",
          answer:
            "Booking is simple! Just enter your departure and destination cities, select your travel date, choose your preferred transport option, and complete the payment.",
          category: "Booking",
          order: 1,
        },
        {
          question: "Can I cancel or modify my booking?",
          answer:
            "Yes, you can cancel or modify your booking up to 24 hours before departure for a full refund via the 'My Bookings' section.",
          category: "Cancellation",
          order: 2,
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept various payment methods including debit cards, credit cards, bank transfers, and mobile money.",
          category: "Payment",
          order: 3,
        },
        {
          question: "How do I receive my ticket?",
          answer:
            "After successful payment, your e-ticket will be sent to your registered email address. You can also download it from the 'My Bookings' section.",
          category: "Booking",
          order: 4,
        },
        {
          question: "Are the transport companies verified?",
          answer:
            "Absolutely! All transport companies on our platform undergo a rigorous verification process checking licenses, insurance, and safety records.",
          category: "General",
          order: 5,
        },
      ];
      await FAQ.bulkCreate(defaultFAQs);
      console.log("✅ Default FAQs seeded");
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
app.use("/api/payment", paymentRoutes);
app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/shipments", require("./routes/shipmentRoutes"));

// Routes mounted below...

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

    // ── Keep-Alive Ping (production only) ────────────────────────────────────
    // Prevents Railway from spinning down the server due to inactivity.
    // Pings the health endpoint every 10 minutes.
    if (process.env.NODE_ENV === "production") {
      const https = require("https");
      const SERVER_URL =
        process.env.SERVER_URL ||
        "https://vadtrans-production.up.railway.app";

      setInterval(() => {
        const url = `${SERVER_URL}/api/health`;
        https
          .get(url, (res) => {
            console.log(`💓 Keep-alive ping: ${res.statusCode}`);
          })
          .on("error", (err) => {
            console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
          });
      }, 10 * 60 * 1000); // every 10 minutes

      console.log("💓 Keep-alive cron started (pings every 10 min)");
    }
    // ─────────────────────────────────────────────────────────────────────────
  });
}

module.exports = app;

// Manual migration to add driverContact to Trips table
const addDriverContactColumn = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable(" Trips\);
 if (!tableInfo.driverContact) {
 console.log(\?? Adding missing column \\driverContact\\ to Trips...\);
 await queryInterface.addColumn(\Trips\, \driverContact\, {
 type: DataTypes.STRING,
 allowNull: true,
 });
 console.log(\? Column \\driverContact\\ added successfully\);
 }
 } catch (err) {
 console.log(\?? driverContact migration note:\, err.message);
 }
};
addDriverContactColumn();
