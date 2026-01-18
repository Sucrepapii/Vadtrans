const dotenv = require("dotenv");
const { sequelize } = require("./config/database");
const User = require("./models/User");

// Load env vars
dotenv.config();

const clearTravelers = async () => {
  try {
    console.log("🧹 Clearing traveler accounts...");

    const count = await User.count({ where: { role: "traveler" } });

    if (count === 0) {
      console.log("✅ No traveler accounts found to delete.");
      process.exit(0);
    }

    // Find all traveler IDs first
    const travelers = await User.findAll({
      where: { role: "traveler" },
      attributes: ["id"],
    });

    const travelerIds = travelers.map((t) => t.id);

    if (travelerIds.length > 0) {
      const Booking = require("./models/Booking");
      console.log(
        `🗑️  Deleting bookings for ${travelerIds.length} travelers...`
      );
      await Booking.destroy({
        where: {
          userId: travelerIds,
        },
      });

      await User.destroy({
        where: {
          id: travelerIds,
        },
      });
    }

    console.log(`✅ Successfully deleted ${count} traveler account(s).`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing travelers:", error);
    process.exit(1);
  }
};

clearTravelers();
