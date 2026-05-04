const { Sequelize } = require("sequelize");
const path = require("path");

// Determine database configuration based on environment
const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  // Use explicit connection string (e.g., Railway, Neon, Render)
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: isProduction, // Strict in production, permissive in dev if needed
      },
    },
    logging: false,
  });
  console.log("🐘 Using PostgreSQL database (via DATABASE_URL)");
} else {
  // Fallback: Use SQLite (Development only)
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "..", "database.sqlite"),
    logging: false,
  });
  console.log("💾 Using SQLite database (Development)");
  console.log("💾 Using SQLite database (Development)");
}

const dbType = databaseUrl ? "Postgres" : "SQLite";

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    throw error;
  }
};

module.exports = { sequelize, testConnection, dbType };
