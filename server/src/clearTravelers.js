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

    await User.destroy({
      where: {
        role: "traveler",
      },
    });

    console.log(`✅ Successfully deleted ${count} traveler account(s).`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing travelers:", error);
    process.exit(1);
  }
};

clearTravelers();
