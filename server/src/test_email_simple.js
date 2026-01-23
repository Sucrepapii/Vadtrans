require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("--- Email Connection Test ---");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log(
    "SMTP_PASS:",
    process.env.SMTP_PASS ? "****** (Set)" : "(Not Set)",
  );

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ Missing SMTP_USER or SMTP_PASS in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("1. Verifying connection...");
    await transporter.verify();
    console.log("✅ Connection verified successfully!");

    console.log("2. Sending test email...");
    const info = await transporter.sendMail({
      from: `"Test Script" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: "VadTrans SMTP Test",
      text: "If you are reading this, your email configuration is correct!",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error(error.message);
    if (error.code === "EAUTH") {
      console.error("\nPOSSIBLE CAUSES:");
      console.error("- Invalid email or password");
      console.error(
        "- 2-Factor Authentication is enabled but you are using your login password instead of an App Password.",
      );
      console.error(
        '- "Less Secure Apps" access is disabled (unlikely for App Passwords).',
      );
    }
  }
}

testEmail();
