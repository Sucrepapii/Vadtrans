const dotenv = require("dotenv");
// Load env vars
dotenv.config();

const { sequelize } = require("./config/database");
const User = require("./models/User");
const { sendVerificationEmail } = require("./utils/emailService");

const debugEmail = async () => {
  try {
    console.log("🔍 Debugging Application Email Service...");

    // Find the most recent user
    const user = await User.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!user) {
      console.log("❌ No users found in database to test with.");
      process.exit(1);
    }

    console.log(`👤 Found most recent user: ${user.email}`);

    if (!user.verificationToken) {
      console.log("⚠️  User has no verification token. Generating one...");
      const crypto = require("crypto");
      const token = crypto.randomBytes(20).toString("hex");
      // We won't save it hashed for this test, just want to test sending
      console.log(`   Generated test token: ${token}`);

      console.log("📨 Attempting to send verification email...");
      const result = await sendVerificationEmail(user, token);
      console.log("Result:", result);
    } else {
      console.log(
        `   Detailed Verification Token (Hash): ${user.verificationToken}`
      );
      // We can't use the hashed token for the link, but we can test sending *something*
      // The email service expects the RAW token for the URL.
      // If we don't have the raw token, the link will be broken, but the EMAIL SHOULD STILL SEND.

      const dummyToken = "debug-token-12345";
      console.log(
        "📨 Attempting to send verification email with dummy token..."
      );
      const result = await sendVerificationEmail(user, dummyToken);
      console.log("Result:", result);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error debugging email:", error);
    process.exit(1);
  }
};

debugEmail();
