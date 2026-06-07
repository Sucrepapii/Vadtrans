const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const { sequelize } = require("./config/database");
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

const getWATDate = () => {
  const nowUtc = new Date();
  return new Date(nowUtc.getTime() + (1 * 60 * 60 * 1000));
};

function convertTo24Hour(timeStr) {
  if (!timeStr) return "00:00";
  if (!timeStr.toLowerCase().includes('m')) return timeStr;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier && modifier.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    const activeTrips = await Trip.findAll({
      where: { status: "active" }
    });
    console.log(`Active trips found: ${activeTrips.length}`);

    const nowLagos = getWATDate();
    console.log(`Current WAT Time: ${nowLagos.toISOString()} (${nowLagos.toUTCString()})`);

    for (const trip of activeTrips) {
      console.log(`\n--- Trip ID: ${trip.id} | Status: ${trip.status} | Departure: ${trip.departureDate} ${trip.departureTime} ---`);
      if (!trip.departureTime) {
        console.log("Skipping: no departure time");
        continue;
      }

      let hasPassed3Hours = false;
      let realDepartureUtc = null;

      if (trip.departureDate) {
        const depTime24 = convertTo24Hour(trip.departureTime);
        const departureDateTime = new Date(`${trip.departureDate}T${depTime24}:00.000Z`);
        const threeHoursAfter = new Date(departureDateTime.getTime() + (3 * 60 * 60 * 1000));
        
        console.log(`[ONE-OFF] depDateTime (parsed UTC): ${departureDateTime.toISOString()}`);
        console.log(`[ONE-OFF] threeHoursAfter (parsed UTC): ${threeHoursAfter.toISOString()}`);
        console.log(`[ONE-OFF] nowLagos >= threeHoursAfter? ${nowLagos >= threeHoursAfter}`);
        
        if (nowLagos >= threeHoursAfter) {
          hasPassed3Hours = true;
          realDepartureUtc = new Date(departureDateTime.getTime() - (1 * 60 * 60 * 1000));
        }
      } else if (trip.operatingDays) {
        const depTime24 = convertTo24Hour(trip.departureTime);
        const depParts = depTime24.split(":");
        const depHour = parseInt(depParts[0], 10);
        const depMin = parseInt(depParts[1], 10);
        
        const depDateTime = new Date(nowLagos.getTime());
        depDateTime.setUTCHours(depHour, depMin, 0, 0);

        let recentDeparture;
        if (nowLagos >= depDateTime) {
          recentDeparture = depDateTime;
        } else {
          recentDeparture = new Date(depDateTime.getTime() - 24 * 60 * 60 * 1000);
        }

        const targetDateTime = new Date(recentDeparture.getTime() + 3 * 60 * 60 * 1000);
        
        console.log(`[RECURRING] depDateTime: ${depDateTime.toISOString()}`);
        console.log(`[RECURRING] recentDeparture: ${recentDeparture.toISOString()}`);
        console.log(`[RECURRING] targetDateTime: ${targetDateTime.toISOString()}`);
        console.log(`[RECURRING] nowLagos >= targetDateTime? ${nowLagos >= targetDateTime}`);

        if (nowLagos >= targetDateTime) {
          hasPassed3Hours = true;
          realDepartureUtc = new Date(recentDeparture.getTime() - (1 * 60 * 60 * 1000));
        }
      }

      console.log(`Result: hasPassed3Hours = ${hasPassed3Hours}`);
      if (hasPassed3Hours) {
        const whereClause = {
          tripId: trip.id,
          bookingStatus: { [Op.in]: ["pending", "confirmed"] }
        };
        if (realDepartureUtc) {
          whereClause.createdAt = { [Op.lte]: realDepartureUtc };
          console.log(`realDepartureUtc: ${realDepartureUtc.toISOString()}`);
        }
        
        const pendingOrConfirmedBookings = await Booking.count({ where: whereClause });
        console.log(`Pending/confirmed bookings matching completion: ${pendingOrConfirmedBookings}`);
        console.log(`Booked seats: ${JSON.stringify(trip.bookedSeats)}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
