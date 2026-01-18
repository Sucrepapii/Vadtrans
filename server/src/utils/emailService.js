const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;

  // Check if email credentials are configured
  if (user && pass) {
    // Real email configuration
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });
  } else {
    // Development mode - log to console
    console.log(
      "\n⚠️  EMAIL NOT CONFIGURED: Checking .env for EMAIL_USER/SMTP_USER"
    );
    console.log(
      "   Current values -> EMAIL_USER: " +
        (process.env.EMAIL_USER ? "Set" : "Empty") +
        ", SMTP_USER: " +
        (process.env.SMTP_USER ? "Set" : "Empty")
    );
    console.log("   Emails will be logged to console only.\n");
    return null;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      // Log email to console in development
      console.log("\n📧 ===== WELCOME EMAIL =====");
      console.log("To:", user.email);
      console.log("Subject: Welcome to VadTrans! 🚀");
      console.log(`\nHi ${user.name}!\n\nThank you for joining VadTrans!\n`);
      console.log("==========================\n");
      return { success: true, mode: "console" };
    }

    const mailOptions = {
      from: `"VadTrans" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Welcome to VadTrans! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF3D3D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #FF3D3D; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to VadTrans!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name}! 👋</h2>
              <p>Thank you for joining VadTrans - Nigeria's premier transportation booking platform!</p>
              
              <p>With VadTrans, you can:</p>
              <ul>
                <li>✅ Book bus, train, and flight tickets easily</li>
                <li>✅ Compare prices from multiple transport companies</li>
                <li>✅ Track your journey in real-time</li>
                <li>✅ Manage all your bookings in one place</li>
              </ul>

              <p>Ready to start your journey?</p>
              <a href="${
                process.env.CLIENT_URL || "http://localhost:3000"
              }/search" class="button">
                Search Trips Now
              </a>

              <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@vadtrans.com">support@vadtrans.com</a></p>

              <p>Best regards,<br><strong>The VadTrans Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} VadTrans. All rights reserved.</p>
              <p>46, Amos Olagboyega Street, Ikeja, Lagos</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${user.name}!

Thank you for joining VadTrans - Nigeria's premier transportation booking platform!

With VadTrans, you can:
- Book bus, train, and flight tickets easily
- Compare prices from multiple transport companies
- Track your journey in real-time
- Manage all your bookings in one place

Ready to start your journey? Visit ${
        process.env.CLIENT_URL || "http://localhost:3000"
      }/search

If you have any questions, feel free to contact our support team at support@vadtrans.com

Best regards,
The VadTrans Team

© ${new Date().getFullYear()} VadTrans. All rights reserved.
46, Amos Olagboyega Street, Ikeja, Lagos
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully to:", user.email);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    // Don't throw error - we don't want email failures to block signup
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking, user) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log("\n📧 ===== BOOKING CONFIRMATION EMAIL =====");
      console.log("To:", user.email);
      console.log("Booking ID:", booking.bookingId);
      console.log("Total Amount: ₦" + booking.totalAmount);
      console.log("=====================================\n");
      return { success: true, mode: "console" };
    }

    const mailOptions = {
      from: `"VadTrans" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Booking Confirmation - ${booking.bookingId} 🎫`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; padding: 12px 30px; background: #FF3D3D; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name},</h2>
              <p>Your booking has been confirmed! Here are your trip details:</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <strong>Booking ID:</strong>
                  <span>${booking.bookingId}</span>
                </div>
                <div class="detail-row">
                  <strong>Total Amount:</strong>
                  <span>₦${booking.totalAmount.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <strong>Number of Passengers:</strong>
                  <span>${booking.passengers.length}</span>
                </div>
                <div class="detail-row">
                  <strong>Seats:</strong>
                  <span>${booking.selectedSeats.join(", ")}</span>
                </div>
              </div>

              <a href="${
                process.env.CLIENT_URL || "http://localhost:3000"
              }/my-bookings" class="button">
                View Booking Details
              </a>

              <p><strong>Important:</strong> Please arrive at the terminal at least 30 minutes before departure time.</p>

              <p>Have a safe journey!</p>
              <p>The VadTrans Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking confirmation email sent to:", user.email);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "❌ Error sending booking confirmation email:",
      error.message
    );
    return { success: false, error: error.message };
  }
};
module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendVerificationEmail: async (user, token) => {
    try {
      const transporter = createTransporter();
      const verificationUrl = `${
        process.env.CLIENT_URL || "http://localhost:3000"
      }/verify-email?token=${token}`;

      if (!transporter) {
        console.log("\n📧 ===== VERIFICATION EMAIL =====");
        console.log("To:", user.email);
        console.log("Verification Link:", verificationUrl);
        console.log("===============================\n");
        return { success: true, mode: "console" };
      }

      const mailOptions = {
        from: `"VadTrans" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Verify Your Email - VadTrans",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #673AB7; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #673AB7; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email</h1>
              </div>
              <div class="content">
                <h2>Hi ${user.name}!</h2>
                <p>Please click the button below to verify your email address and activate your account.</p>
                
                <a href="${verificationUrl}" class="button">Verify Email</a>

                <p>or copy and paste this link in your browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>

                <p>This link will expire in 24 hours.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Verification email sent to:", user.email);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error sending verification email:", error.message);
      return { success: false, error: error.message };
    }
  },
};
