const { Sequelize } = require('sequelize');
const path = require('path');

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
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
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "database.sqlite"),
    logging: false,
  });
}

const Trip = sequelize.define("Trip", {
  id: { type: Sequelize.DataTypes.INTEGER, primaryKey: true },
  from: Sequelize.DataTypes.STRING,
  to: Sequelize.DataTypes.STRING,
  transportType: Sequelize.DataTypes.STRING,
  status: Sequelize.DataTypes.STRING,
  departureDate: Sequelize.DataTypes.DATEONLY,
  operatingDays: Sequelize.DataTypes.STRING,
}, { timestamps: true });

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB successfully");
    const trips = await Trip.findAll();
    console.log(`Total trips in database: ${trips.length}`);
    for (const trip of trips) {
      console.log(`Trip ID: ${trip.id} | Route: ${trip.from} -> ${trip.to} | Type: ${trip.transportType} | Status: ${trip.status} | Date: ${trip.departureDate} | Days: ${trip.operatingDays}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

main();
