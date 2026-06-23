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

      const isRecurring = trip.transportType === "carpooling" || (trip.operatingDays && trip.operatingDays.length > 0);
      const isOneOff = !isRecurring;

      let hasPassed3Hours = false;
      let actualDepartureUtc = null;

      if (isOneOff && trip.departureDate) {
        // One-off trip: has a specific date
        const depTime24 = convertTo24Hour(trip.departureTime);
        const departureDateTime = new Date(`${trip.departureDate}T${depTime24}:00.000Z`);
        const threeHoursAfter = new Date(departureDateTime.getTime() + (3 * 60 * 60 * 1000));
        
        if (nowLagos >= threeHoursAfter) {
          hasPassed3Hours = true;
        }
      } else if (isRecurring) {
        // Recurring trip (carpooling or has operating days)
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
        
        if (nowLagos >= targetDateTime) {
          hasPassed3Hours = true;
          // Calculate the actual UTC time of departure for the past occurrence.
          // recentDeparture is based on nowLagos (which is UTC+1), so subtract 1 hour to get true UTC.
          actualDepartureUtc = new Date(recentDeparture.getTime() - (1 * 60 * 60 * 1000));
        }
      }

      if (hasPassed3Hours) {
        console.log(`🔄 Auto-completing trip ${trip.id} (Departure: ${trip.departureTime})`);
        
        // Find if there are any active bookings to complete
        const whereClause = {
          tripId: trip.id,
          bookingStatus: { [Op.in]: ["pending", "confirmed"] }
        };
        
        // For recurring trips, only complete bookings created before or exactly at the actual UTC departure time.
        // For one-off trips, we complete ALL bookings because the trip is over forever.
        if (isRecurring && actualDepartureUtc) {
          whereClause.createdAt = { [Op.lte]: actualDepartureUtc };
        }

        const pendingOrConfirmedBookings = await Booking.count({
          where: whereClause
        });

        // If there are bookings to complete, update them
        if (pendingOrConfirmedBookings > 0) {
          await Booking.update(
            { bookingStatus: "completed" },
            { where: whereClause }
          );
        }

        // Only change status to completed if it is a ONE-OFF trip.
        // For recurring trips, keep it active for the next day!
        if (isOneOff) {
          trip.status = "completed";
          await trip.save();
        }

        // Non-destructively sync and recalculate the seats using tripController's logic.
        // For one-off trips, this clears the seats since all bookings are now "completed".
        // For recurring trips, this releases seats from the completed occurrence, while preserving bookings made for the next occurrence.
        await syncTripSeats(trip.id);
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

// Function to run at midnight WAT (Africa/Lagos) to clean up forgot-to-end trips
const autoMidnightComplete = async () => {
  try {
    console.log("⏰ Running auto-midnight complete trips cron job...");
    
    // Find all active trips
    const activeTrips = await Trip.findAll({
      where: { status: "active" }
    });

    const nowLagos = getWATDate();
    const todayStr = nowLagos.toISOString().slice(0, 10);
    
    for (const trip of activeTrips) {
      const isRecurring = trip.transportType === "carpooling" || (trip.operatingDays && trip.operatingDays.length > 0);
      
      if (!isRecurring) {
        // One-off trip: complete it if departureDate is in the past
        if (trip.departureDate && trip.departureDate < todayStr) {
          console.log(`🔄 Auto-completing past one-off trip ${trip.id} (Departure Date: ${trip.departureDate})`);
          
          await Booking.update(
            { bookingStatus: "completed" },
            { 
              where: { 
                tripId: trip.id, 
                bookingStatus: { [Op.in]: ["pending", "confirmed"] } 
              } 
            }
          );
          
          trip.status = "completed";
          await trip.save();
          await syncTripSeats(trip.id);
        }
      } else if (trip.transportType === "carpooling") {
        // Carpooling trip: since it's midnight, the daily journey has ended.
        // We deactivate the trip and reset the seats.
        console.log(`🔄 Auto-deactivating and resetting carpool trip ${trip.id} at midnight`);

        await Booking.update(
          { bookingStatus: "completed" },
          { 
            where: { 
              tripId: trip.id, 
              bookingStatus: { [Op.in]: ["pending", "confirmed"] } 
            } 
          }
        );

        trip.bookedSeats = [];
        trip.availableSeats = trip.seats;
        trip.status = "inactive";
        await trip.save();
        await syncTripSeats(trip.id);
      }
    }
  } catch (error) {
    console.error("❌ Error in auto-midnight complete trips cron:", error);
  }
};

// Run at 12:00 AM (midnight) every day in Africa/Lagos (Nigeria) timezone
cron.schedule("0 0 * * *", autoMidnightComplete, {
  timezone: "Africa/Lagos"
});

console.log("📅 Midnight trip auto-completion cron job initialized (runs daily at 12:00 AM WAT).");

// Function to cancel pending bookings that have expired (older than 15 minutes) and free their seats
const cancelExpiredBookings = async () => {
  try {
    console.log("⏰ Running cancel expired bookings cron job...");
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Find all bookings that are pending and older than 15 minutes
    const expiredBookings = await Booking.findAll({
      where: {
        bookingStatus: "pending",
        createdAt: { [Op.lt]: fifteenMinutesAgo }
      }
    });

    if (expiredBookings.length > 0) {
      console.log(`Found ${expiredBookings.length} expired pending bookings. Cancelling...`);
      
      // Get unique trip IDs to sync
      const tripIdsToSync = [...new Set(expiredBookings.map(b => b.tripId))];

      // Update booking status to cancelled and payment status to failed
      await Booking.update(
        {
          bookingStatus: "cancelled",
          paymentStatus: "failed",
          cancellationReason: "Payment reservation timeout (15 mins)"
        },
        {
          where: {
            id: expiredBookings.map(b => b.id)
          }
        }
      );

      // Sync seats for each unique trip
      for (const tripId of tripIdsToSync) {
        await syncTripSeats(tripId);
      }
      console.log(`Successfully cancelled expired bookings and synced seats for trips: ${tripIdsToSync.join(", ")}`);
    }
  } catch (error) {
    console.error("❌ Error in cancel expired bookings cron:", error);
  }
};

// Run every 1 minute
cron.schedule("* * * * *", cancelExpiredBookings);

console.log("📅 Booking expiration cron job initialized (runs every 1 min).");

module.exports = { autoCompleteTrips, autoMidnightComplete, cancelExpiredBookings };
