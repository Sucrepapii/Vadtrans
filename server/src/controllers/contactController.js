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

    // Use the central email service
    const { sendContactFormEmail } = require("../utils/emailService");
    const result = await sendContactFormEmail({
      name,
      email,
      subject,
      message,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send message",
        error: result.error,
      });
    }

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
