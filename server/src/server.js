const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, testConnection, dbType } = require("./config/database");
const { Op } = require("sequelize");

// Load env vars
dotenv.config();

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

// Set up model associations
const models = { User, Trip, Booking, Fare, FAQ, Review, Notification };

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

app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

app.get("/api/fix-db-schema", async (req, res) => {
  try {
    console.log("🔄 Manually patching database schema...");
    const report = [];

    // Debug: List all tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    const tables = results.map((r) => r.table_name);
    report.push(`Found tables: ${tables.join(", ")}`);

    // Helper to safely add column
    const addCol = async (tableName, colName, colDef, defaultValue = null) => {
      // Check if table exists (case sensitive check)
      if (
        !tables.includes(tableName) &&
        !tables.includes(tableName.toLowerCase())
      ) {
        report.push(`Skipping ${tableName}: Table not found`);
        return;
      }

      // Try exact name first, then lowercase
      const targetTable = tables.includes(tableName)
        ? `"${tableName}"`
        : `"${tableName.toLowerCase()}"`;

      try {
        // First try to add the column
        await sequelize.query(`
          ALTER TABLE ${targetTable} 
          ADD COLUMN IF NOT EXISTS "${colName}" ${colDef};
        `);

        // If a default value is provided, update existing rows
        if (defaultValue !== null) {
          const formattedValue =
            typeof defaultValue === "string"
              ? `'${defaultValue}'`
              : defaultValue;
          await sequelize.query(`
            UPDATE ${targetTable} 
            SET "${colName}" = ${formattedValue} 
            WHERE "${colName}" IS NULL;
          `);
          report.push(
            `✅ Added ${colName} to ${targetTable} and set default to ${defaultValue}`,
          );
        } else {
          report.push(`✅ Added ${colName} to ${targetTable}`);
        }
      } catch (e) {
        report.push(
          `⚠️ Failed to add/update ${colName} in ${targetTable}: ${e.message}`,
        );
      }
    };

    // Patch Users
    await addCol("Users", "bookingCount", "INTEGER DEFAULT 0");
    // SQLite/Postgres compatible JSON storage (Text for SQLite, JSON for PG)
    // Using TEXT to be safe across both, Sequelize will parse it
    await addCol("Users", "documents", "TEXT");

    // Patch FAQs
    await addCol("FAQs", "category", "VARCHAR(255) DEFAULT 'General'");

    // Patch Trips
    await addCol("Trips", "vehicleType", "VARCHAR(255) DEFAULT 'Bus'");
    await addCol("Trips", "terminal", "VARCHAR(255)");
    await addCol("Trips", "city", "VARCHAR(255)");
    await addCol("Trips", "state", "VARCHAR(255)");
    await addCol("Trips", "documentPrices", "TEXT");
    await addCol("Trips", "bookedSeats", "TEXT", "[]");

    // Patch Bookings
    await addCol("Bookings", "totalAmount", "FLOAT", 0);
    await addCol("Bookings", "vat", "FLOAT", 0);
    await addCol("Bookings", "serviceFee", "FLOAT", 0);

    // Patch ENUM for Bookings (PostgreSQL only)
    try {
      if (sequelize.getDialect() === "postgres") {
        await sequelize.query(
          `ALTER TYPE "enum_Bookings_bookingStatus" ADD VALUE IF NOT EXISTS 'pending';`,
        );
        report.push(`✅ Added 'pending' to enum_Bookings_bookingStatus`);
      }
    } catch (e) {
      report.push(`⚠️ Failed to add 'pending' to enum: ${e.message}`);
    }

    // Diagnostic: Check actual columns for Bookings and Trips
    try {
      const dbStats = {
        dialect: sequelize.getDialect(),
        nodeEnv: process.env.NODE_ENV,
        dbFile: process.env.DB_FILE || "unknown",
      };

      // Get DB version
      if (dbStats.dialect === "postgres") {
        const [version] = await sequelize.query("SELECT version()");
        dbStats.version = version[0].version;
      }

      report.push(`DB Info: ${JSON.stringify(dbStats)}`);

      const [bookingCols] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Bookings' OR table_name = 'bookings'
        ORDER BY column_name;
      `);
      report.push(
        `Bookings Columns: ${bookingCols.map((c) => `${c.column_name}(${c.data_type})`).join(", ")}`,
      );

      const [tripCols] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Trips' OR table_name = 'trips'
        ORDER BY column_name;
      `);
      report.push(
        `Trips Columns: ${tripCols.map((c) => `${c.column_name}(${c.data_type})`).join(", ")}`,
      );
    } catch (e) {
      report.push(`⚠️ Diagnostic failed: ${e.message}`);
    }

    // 2. Explicitly sync all models (Sequelize's built-in schema update)
    try {
      await sequelize.sync({ alter: true });
      report.push("✅ Full database synchronization completed (alter: true)");
    } catch (e) {
      report.push(`⚠️ Sync (alter: true) failed: ${e.message}`);
    }

    // 3. Explicitly sync Reviews table fallback
    try {
      await Review.sync({ alter: true });
      report.push("✅ Synced Reviews table separately");
    } catch (e) {
      report.push(`⚠️ Failed to sync Reviews table: ${e.message}`);
    }

    // 4. Backfill calculated totalAmount for legacy bookings
    try {
      const bookingsToUpdate = await Booking.findAll({
        where: {
          [Op.or]: [{ totalAmount: 0 }, { totalAmount: null }],
        },
        include: [{ model: Trip, as: "trip" }], // Needs Trip pricing info
      });

      let updatedCount = 0;
      for (const booking of bookingsToUpdate) {
        if (booking.trip && booking.passengers) {
          let subtotal = 0;
          const passengers =
            typeof booking.passengers === "string"
              ? JSON.parse(booking.passengers)
              : booking.passengers;
          const docPrices =
            typeof booking.trip.documentPrices === "string" &&
            booking.trip.documentPrices !== "undefined"
              ? JSON.parse(booking.trip.documentPrices)
              : booking.trip.documentPrices || {};

          const isInternational =
            booking.trip.transportType === "international";

          if (Array.isArray(passengers)) {
            passengers.forEach((passenger) => {
              const docType = passenger.documentType || "No Document";
              const specificPrice = docPrices[docType];

              if (
                isInternational &&
                specificPrice &&
                Number(specificPrice) > 0
              ) {
                subtotal += Number(specificPrice);
              } else {
                subtotal += Number(booking.trip.price);
              }
            });

            const serviceFee = Math.round(subtotal * 0.05);
            const vat = Math.round(serviceFee * 0.075);
            const bookingTotalAmount = subtotal + serviceFee + vat;

            booking.totalAmount = bookingTotalAmount;
            booking.serviceFee = serviceFee;
            booking.vat = vat;
            await booking.save();
            updatedCount++;
          }
        }
      }
      report.push(
        `✅ Backfilled totalAmount for ${updatedCount} legacy bookings`,
      );
    } catch (e) {
      report.push(`⚠️ Failed to backfill legacy bookings: ${e.message}`);
    }

    res.json({
      success: true,
      message: "Database patch attempted",
      report,
      activeDialect: dbType,
    });
  } catch (err) {
    console.error("❌ Manual patch failed:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// TEMPORARY DB WIPE ROUTE
app.get("/api/wipe-db-temp", async (req, res) => {
  try {
    const report = [];

    // Delete in reverse dependency order
    try {
      const notifDeleted = await Notification.destroy({ where: {} });
      report.push(`Deleted ${notifDeleted} notifications`);
    } catch (e) {
      report.push(`Skipped notifications: ${e.message}`);
    }

    try {
      const bookingsDeleted = await Booking.destroy({ where: {} });
      report.push(`Deleted ${bookingsDeleted} bookings`);
    } catch (e) {
      report.push(`Skipped bookings: ${e.message}`);
    }

    try {
      const reviewsDeleted = await Review.destroy({ where: {} });
      report.push(`Deleted ${reviewsDeleted} reviews`);
    } catch (e) {
      report.push(`Skipped reviews: ${e.message}`);
    }

    try {
      const faresDeleted = await Fare.destroy({ where: {} });
      report.push(`Deleted ${faresDeleted} fares`);
    } catch (e) {
      report.push(`Skipped fares: ${e.message}`);
    }

    try {
      const tripsDeleted = await Trip.destroy({ where: {} });
      report.push(`Deleted ${tripsDeleted} trips`);
    } catch (e) {
      report.push(`Skipped trips: ${e.message}`);
    }

    try {
      const usersDeleted = await User.destroy({
        where: {
          role: { [Op.ne]: "admin" }, // Do not delete the admin!
        },
      });
      report.push(
        `Deleted ${usersDeleted} travelers and companies (Admin preserved)`,
      );
    } catch (e) {
      report.push(`Skipped users: ${e.message}`);
    }

    res.json({
      success: true,
      message: "Database wiped successfully",
      report,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
