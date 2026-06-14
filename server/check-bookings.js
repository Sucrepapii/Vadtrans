const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Trip = require('./src/models/Trip');
const Booking = require('./src/models/Booking');
const Fare = require('./src/models/Fare');
const FAQ = require('./src/models/FAQ');
const Review = require('./src/models/Review');
const Notification = require('./src/models/Notification');
const Shipment = require('./src/models/Shipment');

// Set up model associations exactly like server.js
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

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database successfully.");

    const bookingsCount = await Booking.count();
    console.log(`Total Bookings in database: ${bookingsCount}`);

    if (bookingsCount > 0) {
      const bookings = await Booking.findAll({
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Trip, as: 'trip', attributes: ['id', 'from', 'to', 'price'] }
        ]
      });

      console.log("\n--- List of Bookings ---");
      bookings.forEach(b => {
        console.log(`ID: ${b.id} | BookingID: ${b.bookingId} | User: ${b.user?.name || 'Unknown'} (${b.user?.email || 'N/A'}) | Amount: ₦${b.totalAmount} | PaidAmount: ₦${b.paidAmount} | PaymentStatus: ${b.paymentStatus} | BookingStatus: ${b.bookingStatus}`);
      });

      // Show revenue sum criteria
      const revenueBookings = bookings.filter(b => b.paymentStatus === 'paid' || b.bookingStatus === 'completed');
      console.log(`\nBookings counted in revenue: ${revenueBookings.length}`);
      const totalRevenue = revenueBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
      console.log(`Calculated Revenue Sum: ₦${totalRevenue}`);
    } else {
      console.log("No bookings found in the database.");
    }
  } catch (error) {
    console.error("Error inspecting bookings:", error);
  } finally {
    process.exit(0);
  }
}

main();
