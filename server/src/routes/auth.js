const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadDocument,
  deleteDocument,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Document upload routes
router.post(
  "/upload-document",
  protect,
  upload.single("document"),
  uploadDocument
);
router.delete("/documents/:type", protect, deleteDocument);

module.exports = router;
