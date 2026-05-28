const cron = require("node-cron");
const { Op } = require("sequelize");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const { syncTripSeats } = require("../controllers/tripController");

// Function to check and auto-complete trips that departed 3+ hours ago
// Helper to get current date/time in West Africa Time (WAT / UTC+1)
// Nigeria is strictly UTC+1 all year round (no DST), so shifting UTC by 1 hour is robust and timezone-independent.
const getWATDate = () => {
  const nowUtc = new Date();
  return new Date(nowUtc.getTime() + (1 * 60 * 60 * 1000));
};

// Function to check and auto-complete trips that departed 3+ hours ago
const autoCompleteTrips = async () => {
  try {
    console.log("⏰ Running auto-complete trips cron job...");
    
    // Find all active trips
    const activeTrips = await Trip.findAll({
      where: { status: "active" }
    });

    const nowLagos = getWATDate();
    
    for (const trip of activeTrips) {
      if (!trip.departureTime) continue;

      let hasPassed3Hours = false;
      let realDepartureUtc = null;

      if (trip.departureDate) {
        // One-off trip: has a specific date
        // departureTime is e.g., "14:00" or "08:30 AM"
        // Parse the scheduled time in WAT represented as a UTC string
        const depTime24 = convertTo24Hour(trip.departureTime);
        const departureDateTime = new Date(`${trip.departureDate}T${depTime24}:00.000Z`);
        const threeHoursAfter = new Date(departureDateTime.getTime() + (3 * 60 * 60 * 1000));
        
        if (nowLagos >= threeHoursAfter) {
          hasPassed3Hours = true;
          // For one-off, real departure UTC timestamp is 1 hour before scheduled WAT
          realDepartureUtc = new Date(departureDateTime.getTime() - (1 * 60 * 60 * 1000));
        }
      } else if (trip.operatingDays) {
        const depTime24 = convertTo24Hour(trip.departureTime);
        const depParts = depTime24.split(":");
        const depHour = parseInt(depParts[0], 10);
        const depMin = parseInt(depParts[1], 10);
        
        // Create a Date object for today's departure time normalized to WAT
        const depDateTime = new Date(nowLagos.getTime());
        depDateTime.setUTCHours(depHour, depMin, 0, 0);

        // Find the most recent scheduled departure time
        let recentDeparture;
        if (nowLagos >= depDateTime) {
          recentDeparture = depDateTime;
        } else {
          recentDeparture = new Date(depDateTime.getTime() - 24 * 60 * 60 * 1000);
        }

        const targetDateTime = new Date(recentDeparture.getTime() + 3 * 60 * 60 * 1000);
        
        if (nowLagos >= targetDateTime) {
          hasPassed3Hours = true;
          // Store real UTC time of departure (WAT shifted back by 1 hour) for booking completion queries
          realDepartureUtc = new Date(recentDeparture.getTime() - (1 * 60 * 60 * 1000));
        }
      }

      if (hasPassed3Hours) {
        // Find if there are any active bookings to complete
        const whereClause = {
          tripId: trip.id,
          bookingStatus: { [Op.in]: ["pending", "confirmed"] }
        };
        
        // For recurring trips, only complete bookings created before the real UTC departure time
        if (realDepartureUtc) {
          whereClause.createdAt = { [Op.lte]: realDepartureUtc };
        }

        const pendingOrConfirmedBookings = await Booking.count({
          where: whereClause
        });

        if (pendingOrConfirmedBookings > 0 || (trip.bookedSeats && trip.bookedSeats.length > 0)) {
          console.log(`🔄 Auto-completing trip ${trip.id} (Departure: ${trip.departureTime})`);
          
          await Booking.update(
            { bookingStatus: "completed" },
            { where: whereClause }
          );

          // Only change status to completed if it is a ONE-OFF trip.
          // For recurring trips, keep it active for the next day!
          if (trip.departureDate) {
            trip.status = "completed";
            await trip.save();
          }

          // Non-destructively sync and recalculate the seats using tripController's logic.
          // This removes expired seats while preserving newly booked seats for future rides.
          await syncTripSeats(trip.id);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in auto-complete trips cron:", error);
  }
};


// Helper function to convert 12-hour AM/PM to 24-hour time
function convertTo24Hour(timeStr) {
  if (!timeStr) return "00:00";
  
  // If already 24-hour format (e.g. "14:30")
  if (!timeStr.toLowerCase().includes('m')) {
    return timeStr;
  }
  
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier && modifier.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// Run every 30 minutes
cron.schedule("*/30 * * * *", autoCompleteTrips);

console.log("📅 Trip auto-completion cron job initialized (runs every 30 mins).");

module.exports = { autoCompleteTrips };
