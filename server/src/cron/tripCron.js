const cron = require("node-cron");
const { Op } = require("sequelize");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");

// Function to check and auto-complete trips that departed 3+ hours ago
const autoCompleteTrips = async () => {
  try {
    console.log("⏰ Running auto-complete trips cron job...");
    
    // Find all active trips
    const activeTrips = await Trip.findAll({
      where: { status: "active" }
    });

    const now = new Date();
    
    for (const trip of activeTrips) {
      if (!trip.departureTime) continue;

      let hasPassed3Hours = false;

      if (trip.departureDate) {
        // One-off trip: has a specific date
        // departureTime is e.g., "14:00" or "08:30 AM"
        // Let's create a Date object for the departure
        const departureDateTime = new Date(`${trip.departureDate}T${convertTo24Hour(trip.departureTime)}:00`);
        const threeHoursAfter = new Date(departureDateTime.getTime() + (3 * 60 * 60 * 1000));
        
        if (now >= threeHoursAfter) {
          hasPassed3Hours = true;
        }
      } else if (trip.operatingDays) {
        const depTime24 = convertTo24Hour(trip.departureTime);
        const depParts = depTime24.split(":");
        const depHour = parseInt(depParts[0], 10);
        const depMin = parseInt(depParts[1], 10);
        
        // Create a Date object for today's departure time
        const depDateTime = new Date();
        depDateTime.setHours(depHour, depMin, 0, 0);

        // Find the most recent departure time
        let recentDeparture;
        if (now >= depDateTime) {
          recentDeparture = depDateTime;
        } else {
          recentDeparture = new Date(depDateTime.getTime() - 24 * 60 * 60 * 1000);
        }

        const targetDateTime = new Date(recentDeparture.getTime() + 3 * 60 * 60 * 1000);
        
        if (now >= targetDateTime) {
          hasPassed3Hours = true;
          // Store recentDeparture on the trip object temporarily so we can filter bookings by createdAt
          trip._recentDeparture = recentDeparture;
        }
      }

      if (hasPassed3Hours) {
        // Find if there are any active bookings to complete
        const whereClause = {
          tripId: trip.id,
          bookingStatus: { [Op.in]: ["pending", "confirmed"] }
        };
        
        // For recurring trips, only complete bookings created before the recent departure
        if (trip._recentDeparture) {
          whereClause.createdAt = { [Op.lte]: trip._recentDeparture };
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

          trip.bookedSeats = [];
          trip.availableSeats = trip.seats;
          
          // Only change status to completed if it is a ONE-OFF trip.
          // For recurring trips, keep it active for the next day, but seats are reset!
          if (trip.departureDate) {
            trip.status = "completed";
          }
          
          await trip.save();
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
