const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

// Load env vars
dotenv.config();

const testEmail = async () => {
  console.log("📧 Testing Email Configuration...");
  console.log("--------------------------------");

  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
  const service = process.env.EMAIL_SERVICE || "gmail";

  console.log(`Service: ${service}`);
  console.log(`User: ${user ? user : "MISSING ❌"}`);
  console.log(`Pass: ${pass ? "Set (Hidden) ✅" : "MISSING ❌"}`);

  if (!user || !pass) {
    console.error("\n❌ Error: Missing email credentials in .env file.");
    process.exit(1);
  }

  try {
    const transporter = nodemailer.createTransporter({
      service: service,
      auth: {
        user: user,
        pass: pass,
      },
    });

    console.log("\n🔄 Attempting to connect to SMTP server...");
    await transporter.verify();
    console.log("✅ Connection Successful! SMTP settings are correct.");

    console.log("\n🔄 Attempting to send test email...");
    await transporter.sendMail({
      from: `"VadTrans Test" <${user}>`,
      to: user, // Send to self
      subject: "VadTrans SMTP Test",
      text: "If you receive this, your email configuration is working perfectly!",
    });
    console.log("✅ Test email sent successfully! Check your inbox.");
  } catch (error) {
    console.error("\n❌ Email Test Failed:");
    console.error(error.message);
    if (error.code === "EAUTH") {
      console.log(
        "\n💡 Hint: Check your password. If using Gmail, you might need an App Password."
      );
    }
  }
};

testEmail();
