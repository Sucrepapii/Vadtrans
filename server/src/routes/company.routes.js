import express from "express";
import Company from "../models/Company.model.js";

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { transportType, isVerified } = req.query;
    const filter = {};

    if (transportType) filter.transportType = transportType;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";

    const companies = await Company.find(filter).sort({
      rating: -1,
      totalTrips: -1,
    });

    res.json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/companies
// @desc    Register a new company
// @access  Private
router.post("/", async (req, res) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/companies/:id/documents
// @desc    Upload company documents
// @access  Private
router.post("/:id/documents", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.documents.push(req.body);
    await company.save();

    res.json({
      success: true,
      message: "Document uploaded successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
