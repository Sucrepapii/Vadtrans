const User = require("../models/User");
const { sendWelcomeEmail } = require("../utils/emailService");

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
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
    });

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(user).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: `${
        userRole === "company" ? "Company" : "User"
      } registered successfully. Check your email for welcome message!`,
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
        title: user.title,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        city: user.city,
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
      },
    });
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
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.avatar = avatar || user.avatar;

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
        city: user.city,
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
