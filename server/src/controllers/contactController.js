const nodemailer = require("nodemailer");

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, subject, and message",
      });
    }

    console.log("📨 Sending Contact Email...");
    console.log("From:", email);
    console.log("Subject:", subject);

    // Check for SMTP config
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.error("❌ SMTP Configuration missing in .env");
      // In development, you might want to mock success or return specific error
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact admin.",
        debug: "SMTP_HOST/USER/PASS missing",
      });
    }

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`, // sender address
      to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER, // list of receivers (admin)
      replyTo: email, // reply to the user's email
      subject: `Contact Form: ${subject}`, // Subject line
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // plain text body
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `, // html body
    });

    console.log("✅ Message sent: %s", info.messageId);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact email error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};
