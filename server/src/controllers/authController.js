const User = require("../models/User");
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordSuccessEmail,
} = require("../utils/emailService");
const crypto = require("crypto");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate role
    const validRoles = ["traveler", "company", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "traveler";

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      // If user exists and is verified, return error
      if (userExists.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // If user exists but NOT verified, update their info and resend email
      // Update basic info
      userExists.name = name;
      userExists.password = password; // Will be hashed by model hook
      userExists.phone = phone;
      userExists.role = userRole;

      // Auto-verify admin only
      if (userRole === "admin") {
        userExists.isVerified = true;
        userExists.verificationToken = null;
        userExists.verificationTokenExpire = null;
        await userExists.save();

        return res.status(200).json({
          success: true,
          message: "Admin account updated successfully",
          user: {
            id: userExists.id,
            name: userExists.name,
            email: userExists.email,
            phone: userExists.phone,
            role: userExists.role,
          },
        });
      }

      // Generate New Verification Token
      const verificationToken = crypto.randomBytes(20).toString("hex");
      userExists.verificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
      userExists.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

      await userExists.save();

      // Send verification email
      try {
        const result = await sendVerificationEmail(
          userExists,
          verificationToken,
        );
        if (!result.success) {
          return res.status(500).json({
            success: false,
            message: "Failed to send verification email. Check server logs.",
            error: result.error,
          });
        }
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }

      return res.status(200).json({
        success: true,
        message:
          "Account updated. Please check your email for verification link!",
        user: {
          id: userExists.id,
          name: userExists.name,
          email: userExists.email,
          phone: userExists.phone,
          role: userExists.role,
        },
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      role: userRole,
    });

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    // Token expires in 24 hours
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    // Auto-verify admin only
    if (userRole === "admin") {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpire = null;
    }

    await user.save();

    // Send verification email (skip for admin)
    if (userRole !== "admin") {
      try {
        const result = await sendVerificationEmail(user, verificationToken);
        if (!result.success) {
          return res.status(500).json({
            success: false,
            message: "Failed to send verification email. Check server logs.",
            error: result.error,
          });
        }
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    }

    // Send welcome email (moved to verification)
    // sendWelcomeEmail(user).catch((err) => {
    //   console.error("Failed to send welcome email:", err);
    // });

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: `${
        userRole === "company" ? "Company" : "User"
      } registered successfully. Check your email for verification link!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Hash token to compare with database
    const verificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      where: {
        verificationToken,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check if token expired
    if (user.verificationTokenExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired",
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpire = null;
    await user.save();

    // Send welcome email now if not sent before (optional)
    sendWelcomeEmail(user).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: error.message,
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new Verification Token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    // Token expires in 24 hours
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      const result = await sendVerificationEmail(user, verificationToken);

      if (!result.success) {
        // If email failed to send, return error
        return res.status(500).json({
          success: false,
          message: "Failed to send email",
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        message: "Verification email resent successfully",
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
      res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error resending verification email",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified (Skip for admin)
    if (!user.isVerified && user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address before logging in.",
      });
    }

    // Generate token
    const token = user.generateToken();

    // Debug: Log user role
    console.log(`🔐 User logged in: ${user.email}, Role: ${user.role}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        title: user.title,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        city: user.city,
        // Company-specific fields
        businessRegNo: user.businessRegNo,
        taxId: user.taxId,
        description: user.description,
        founded: user.founded,
        vehicles: user.vehicles,
        routes: user.routes,
        verificationStatus: user.verificationStatus,
        documents: user.documents || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        title: user.title,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        city: user.city,
        // Company-specific fields
        businessRegNo: user.businessRegNo,
        taxId: user.taxId,
        description: user.description,
        founded: user.founded,
        vehicles: user.vehicles,
        routes: user.routes,
        verificationStatus: user.verificationStatus,
        documents: user.documents || [],
      },
    });
    console.log("✅ getMe response sent. Documents field:", user.documents);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      name,
      phone,
      title,
      gender,
      dateOfBirth,
      address,
      city,
      avatar,
      // Company fields
      businessRegNo,
      taxId,
      description,
      founded,
      vehicles,
      routes,
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update common fields
    user.firstName = firstName !== undefined ? firstName : user.firstName;
    user.lastName = lastName !== undefined ? lastName : user.lastName;
    user.name = name !== undefined ? name : user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;
    user.city = city !== undefined ? city : user.city;
    user.avatar = avatar !== undefined ? avatar : user.avatar;

    // Update traveler-specific fields
    if (user.role === "traveler" || user.role === "admin") {
      user.title = title !== undefined ? title : user.title;
      user.gender = gender || user.gender;
      user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    }

    // Update company-specific fields
    if (user.role === "company") {
      user.businessRegNo = businessRegNo || user.businessRegNo;
      user.taxId = taxId || user.taxId;
      user.description = description || user.description;
      user.founded = founded || user.founded;
      user.vehicles = vehicles !== undefined ? vehicles : user.vehicles;
      user.routes = routes !== undefined ? routes : user.routes;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        state: user.state,
        // Traveler fields
        // Traveler fields
        title: user.title,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        // Company fields
        businessRegNo: user.businessRegNo,
        taxId: user.taxId,
        description: user.description,
        founded: user.founded,
        vehicles: user.vehicles,
        routes: user.routes,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get user with password
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Upload document
// @route   POST /api/auth/upload-document
// @access  Private (Company only)
exports.uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create document object
    const document = {
      type: documentType,
      name: req.file.originalname,
      url: `/uploads/documents/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    // Get existing documents or initialize empty array
    const documents = user.documents || [];

    // Remove existing document of same type (replace)
    const filteredDocs = documents.filter((doc) => doc.type !== documentType);

    // Add new document
    filteredDocs.push(document);

    // Update user
    await user.update({ documents: filteredDocs });

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      document: document,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading document",
      error: error.message,
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/auth/documents/:type
// @access  Private (Company only)
exports.deleteDocument = async (req, res) => {
  try {
    const { type } = req.params;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get existing documents
    const documents = user.documents || [];

    // Find document to delete
    const docToDelete = documents.find((doc) => doc.type === type);

    if (docToDelete) {
      // Delete file from filesystem
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(__dirname, "../../", docToDelete.url);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove from array
    const filteredDocs = documents.filter((doc) => doc.type !== type);

    // Update user
    await user.update({ documents: filteredDocs });

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with that email",
      });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Create reset url
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetUrl);

      res.status(200).json({
        success: true,
        message: "Email sent",
      });
    } catch (err) {
      console.error("Email send failed:", err);
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check expiration manually (important for SQLite/Sequelize)
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    // Send confirmation email
    try {
      await sendPasswordSuccessEmail(user);
    } catch (err) {
      console.error("Confirmation email failed:", err);
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
