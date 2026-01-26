const FAQ = require("../models/FAQ");

// @desc    Get all FAQs (public)
// @route   GET /api/faqs
// @access  Public
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      where: { isVisible: true },
      order: [
        ["order", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQs",
      error: error.message,
    });
  }
};

// @desc    Get all FAQs (admin)
// @route   GET /api/admin/faqs
// @access  Private/Admin
exports.getAllFAQsAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      order: [
        ["order", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQs",
      error: error.message,
    });
  }
};

// @desc    Create FAQ
// @route   POST /api/admin/faqs
// @access  Private/Admin
exports.createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error creating FAQ",
      error: error.message,
    });
  }
};

// @desc    Update FAQ
// @route   PUT /api/admin/faqs/:id
// @access  Private/Admin
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    await faq.update(req.body);

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error updating FAQ",
      error: error.message,
    });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/admin/faqs/:id
// @access  Private/Admin
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    await faq.destroy();

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting FAQ",
      error: error.message,
    });
  }
};
