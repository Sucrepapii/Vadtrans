require("dotenv").config();
const { sendVerificationEmail } = require("./utils/emailService");

const testFullService = async () => {
  console.log("--- Testing Full Email Service Module ---");

  // Mock user object
  const mockUser = {
    name: "Test User",
    email: process.env.SMTP_USER || process.env.EMAIL_USER,
  };

  const mockToken = "test-token-12345";

  console.log("Target Email:", mockUser.email);

  try {
    console.log("Calling sendVerificationEmail...");
    const result = await sendVerificationEmail(mockUser, mockToken);

    console.log("Result:", result);

    if (result.success) {
      console.log("✅ Email Service reported success!");
    } else {
      console.error("❌ Email Service reported failure.");
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Unexpected Error calling service:", error);
  }
};

testFullService();
