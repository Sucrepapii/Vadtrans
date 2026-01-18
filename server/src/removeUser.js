const dotenv = require("dotenv");
const { sequelize } = require("./config/database");
const User = require("./models/User");
const Booking = require("./models/Booking");

// Load env vars
dotenv.config();

const removeUser = async () => {
  try {
    const email = "akinboroo@gmail.com";
    console.log(`🔍 Finding user with email: ${email}...`);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("⚠️  User not found.");
      process.exit(0);
    }

    console.log(`👤 Found user: ${user.name} (ID: ${user.id})`);

    // Delete associated bookings first
    const bookingsCount = await Booking.count({ where: { userId: user.id } });
    if (bookingsCount > 0) {
      console.log(`🗑️  Deleting ${bookingsCount} associated bookings...`);
      await Booking.destroy({ where: { userId: user.id } });
    }

    // Delete user
    console.log("🗑️  Deleting user...");
    await user.destroy();

    console.log("✅ User removed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error removing user:", error);
    process.exit(1);
  }
};

removeUser();
