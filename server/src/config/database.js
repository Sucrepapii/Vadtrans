const { Sequelize } = require("sequelize");
const path = require("path");

// Determine database configuration based on environment
const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (isProduction && databaseUrl) {
  // Production: Use PostgreSQL from Railway
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
  console.log("🐘 Using PostgreSQL database (Production)");
} else {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "..", "database.sqlite"),
    logging: false,
  });
  console.log("💾 Using SQLite database (Development)");
}

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

module.exports = { sequelize, testConnection };
