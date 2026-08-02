const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// POST /api/leads - Create a new email lead
router.post("/", async (req, res) => {
  try {
    const { email, name, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Try to create the lead
    const lead = await Lead.create({
      email: email.trim().toLowerCase(),
      name: name ? name.trim() : null,
      source: source || "chatbot",
    });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully.",
      data: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        source: lead.source,
      },
    });
  } catch (error) {
    // Handle Sequelize validation or unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "This email address is already subscribed.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || "Invalid input data.",
      });
    }

    console.error("Error creating email lead:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// GET /api/leads (Optional - For admin verification)
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("Error fetching email leads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

module.exports = router;
