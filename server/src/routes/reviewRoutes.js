const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviews,
  likeReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.route("/").get(getReviews).post(protect, createReview);

router.put("/:id/like", protect, likeReview);

module.exports = router;
