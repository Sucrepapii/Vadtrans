require("dotenv").config();
const { sequelize } = require("./src/config/database");
const Booking = require("./src/models/Booking");
const Trip = require("./src/models/Trip");
const Notification = require("./src/models/Notification");

async function testCancel() {
  try {
    await sequelize.authenticate();
    console.log("Connected");

    // MOCK BOOKING FOR TEST
    const booking = {
      id: 36,
      bookingId: null,
      tripId: 1,
      selectedSeats: ["1A", "1B"],
      bookingStatus: "confirmed",
      save: async () => {
        console.log("Booking saved");
      },
    };

    const diffHours = 10;

    // THE SUSPECTED CANCEL LOGIC
    booking.bookingStatus = "cancelled";
    booking.cancellationReason = "User cancelled";
    booking.cancelledAt = new Date();

    if (diffHours <= 48) {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    console.log("Releasing seats...");
    const trip = await Trip.findByPk(booking.tripId);
    if (trip) {
      const bookedSeats = trip.bookedSeats ? JSON.parse(trip.bookedSeats) : [];
      trip.bookedSeats = JSON.stringify(
        bookedSeats.filter((seat) => !booking.selectedSeats.includes(seat)),
      );
      trip.availableSeats = trip.availableSeats + booking.selectedSeats.length;
      await trip.save();
    }

    console.log("Creating notification...");
    const displayId = booking.bookingId || String(booking.id).padStart(5, "0");

    // Simulate Notification create
    console.log({
      message: `Booking #${displayId} was cancelled by the user.`,
      type: "cancellation",
      relatedBookingId: booking.id,
      actionUrl: `/admin/bookings?search=${displayId}`,
    });

    console.log("Cancel logic executed successfully");
  } catch (e) {
    console.error("CRASH in cancel logic:", e);
  } finally {
    process.exit(0);
  }
}

testCancel();
