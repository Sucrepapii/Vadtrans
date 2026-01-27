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

    const isCompany = user.role === "company";
    const subject = isCompany
      ? "Welcome to VadTrans Partner Network | Let's Drive Growth Together"
      : "Welcome to VadTrans | Your Journey Starts Here";

    const companyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #0f172a; padding: 30px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 1px; }
          .hero { background-color: #f8fafc; padding: 40px 30px; text-align: center; border-bottom: 1px solid #e2e8f0; }
          .content { padding: 40px 30px; }
          .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .feature { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 13px; }
          h1 { color: #0f172a; margin: 0 0 15px 0; font-size: 24px; }
          h2 { color: #0f172a; font-size: 18px; margin-bottom: 10px; }
          p { margin: 0 0 15px 0; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">VADTRANS PARTNER</span>
          </div>
          <div class="hero">
            <h1>Welcome to the Partner Network</h1>
            <p>Dear ${user.name},</p>
            <p>We are thrilled to welcome your transportation business to VadTrans. You have taken a significant step towards digitizing your operations and reaching thousands of new travelers.</p>
            <a href="${
              process.env.CLIENT_URL || "https://www.vadtrans.com"
            }/signin" class="button">Access Company Dashboard</a>
          </div>
          <div class="content">
            <p>As a verified partner, you now have access to powerful tools designed to scale your business:</p>
            
            <div style="margin: 30px 0;">
              <div style="margin-bottom: 20px;">
                <strong>📊 Fleet Management</strong>
                <p>Track your vehicles and manage drivers efficiently from a single dashboard.</p>
              </div>
              <div style="margin-bottom: 20px;">
                <strong>🎫 Digital Ticketing</strong>
                <p>Automate your booking process and receive instant payments securely.</p>
              </div>
              <div style="margin-bottom: 20px;">
                <strong>📈 Real-time Analytics</strong>
                <p>Gain insights into your revenue, popular routes, and customer demographics.</p>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <h3>Next Steps for Your Business:</h3>
            <ol style="color: #475569; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Login to your dashboard</li>
              <li style="margin-bottom: 10px;">Complete your company profile and fleet details</li>
              <li style="margin-bottom: 10px;">Set up your first trip route</li>
              <li style="margin-bottom: 10px;">Verify your bank details for payouts</li>
            </ol>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VadTrans Ltd. All rights reserved.</p>
            <p>46, Amos Olagboyega Street, Ikeja, Lagos</p>
            <p><a href="#" style="color: #2563eb; text-decoration: none;">Partner Support</a> | <a href="#" style="color: #2563eb; text-decoration: none;">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const travelerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 2px; }
          .content { padding: 40px 40px; }
          .button { display: inline-block; padding: 15px 35px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4); }
          .feature-row { display: flex; align-items: flex-start; margin-bottom: 25px; }
          .icon { background: #e0e7ff; color: #6366f1; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
          .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #9ca3af; font-size: 12px; }
          h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; }
          h2 { color: #111827; font-size: 22px; margin-top: 0; }
          p { margin: 0 0 15px 0; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin-bottom: 10px;">Welcome to VadTrans</h1>
            <p style="color: #e0e7ff; font-size: 16px;">Travel Made Simple</p>
          </div>
          <div class="content">
            <p>Hello ${user.name},</p>
            <p>Thank you for choosing VadTrans. Your account has been successfully created, and you are now part of Nigeria's most reliable transportation network.</p>
            
            <div style="text-align: center;">
              <a href="${
                process.env.CLIENT_URL || "https://www.vadtrans.com"
              }/search" class="button">Book Your First Trip</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;">

            <h3 style="color: #374151; margin-bottom: 20px;">Why travel with us?</h3>
            
            <div class="feature-row">
              <div style="min-width: 30px; font-size: 20px;">🛡️</div>
              <div style="margin-left: 15px;">
                <strong>Verified Operators</strong>
                <div style="font-size: 14px; color: #6b7280;">Every transport company is vetted for safety and reliability.</div>
              </div>
            </div>

            <div class="feature-row">
              <div style="min-width: 30px; font-size: 20px;">💳</div>
              <div style="margin-left: 15px;">
                <strong>Secure Payments</strong>
                <div style="font-size: 14px; color: #6b7280;">Instant booking confirmation with multiple payment options.</div>
              </div>
            </div>

            <div class="feature-row">
              <div style="min-width: 30px; font-size: 20px;">📍</div>
              <div style="margin-left: 15px;">
                <strong>Live Tracking</strong>
                <div style="font-size: 14px; color: #6b7280;">Share your journey status with loved ones in real-time.</div>
              </div>
            </div>

          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VadTrans Ltd. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@vadtrans.com" style="color: #6366f1; text-decoration: none;">Contact Support</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <onboarding@resend.dev>",
      to: [user.email],
      subject: subject,
      html: isCompany ? companyHtml : travelerHtml,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log(
      `✅ Welcome email sent successfully to ${isCompany ? "Company" : "Traveler"}:`,
      user.email,
    );
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

const sendContactFormEmail = async ({ name, email, subject, message }) => {
  try {
    if (!isConfigured()) {
      return { success: true, mode: "console" };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || "VadTrans <contact@resend.dev>",
      to: process.env.SUPPORT_EMAIL || "support@vadtrans.com", // Send to company support email
      reply_to: email, // Reply directly to user
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Contact form email sent from:", email);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Error sending contact email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordSuccessEmail,
  sendContactFormEmail,
};
