require("dotenv").config();
const { sequelize } = require("./config/database");
const User = require("./models/User");

const verifyUser = async (email) => {
  if (!email) {
    console.error("❌ Please provide an email address.");
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log("🔌 Database connected.");

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    if (user.isVerified) {
      console.log(`✅ User ${email} is ALREADY verified.`);
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpire = null;
    await user.save();

    console.log(`✅ SUCCESS: User ${email} has been manually verified!`);
    console.log("You can now log in.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    // await sequelize.close(); // Not strictly necessary for script
  }
};

// Get email from command line argument
const targetEmail = process.argv[2];
verifyUser(targetEmail);
