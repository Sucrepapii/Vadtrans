const { Resend } = require("resend");

// Initialize Resend
// Use RESEND_API_KEY if available, otherwise fallback to SMTP_PASS
const resendApiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Helper to check if email service is configured
const isConfigured = () => {
  if (!resend) {
    console.log(
      "\n⚠️  RESEND API KEY NOT FOUND: Please set RESEND_API_KEY in .env",
    );
    console.log("   Emails will be logged to console only.\n");
    return false;
  }
  return true;
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    if (!isConfigured()) {
      return { success: true, mode: "console" };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <onboarding@resend.dev>", // Fallback for testing
      to: [user.email],
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
                process.env.CLIENT_URL || "https://www.vadtrans.com"
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
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Welcome email sent successfully to:", user.email);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking, user) => {
  try {
    if (!isConfigured()) {
      return { success: true, mode: "console" };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <bookings@resend.dev>",
      to: [user.email],
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
                process.env.CLIENT_URL || "https://www.vadtrans.com/"
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
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Booking confirmation email sent to:", user.email);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(
      "❌ Error sending booking confirmation email:",
      error.message,
    );
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (user, token) => {
  try {
    if (!isConfigured()) {
      return { success: true, mode: "console" };
    }

    const verificationUrl = `${
      process.env.CLIENT_URL || "https://www.vadtrans.com/"
    }/verify-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <verify@resend.dev>",
      to: [user.email],
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
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
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
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Verification email sent to:", user.email);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Error sending verification email:", error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    if (!isConfigured()) {
      return { success: true, mode: "console" };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <auth@resend.dev>",
      to: [user.email],
      subject: "Reset Your Password - VadTrans",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6C5DD3;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Please click the button below to set a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6C5DD3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} VadTrans. All rights reserved.</p>
      </div>
    `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Password reset email sent to:", user.email);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordSuccessEmail = async (user) => {
  try {
    if (!isConfigured()) {
      return { success: true, mode: "console" };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <auth@resend.dev>",
      to: [user.email],
      subject: "Password Changed Successfully - VadTrans",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6C5DD3;">Password Changed</h2>
        <p>Hello ${user.name},</p>
        <p>Your password has been successfully updated.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/signin" style="background-color: #6C5DD3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} VadTrans. All rights reserved.</p>
      </div>
    `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Password changed success email sent to:", user.email);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(
      "❌ Error sending password changed success email:",
      error.message,
    );
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordSuccessEmail,
};
