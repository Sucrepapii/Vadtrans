const Review = require("../models/Review");
const User = require("../models/User");

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide both rating and comment",
      });
    }

    const review = await Review.create({
      userId: req.user.id,
      rating,
      comment,
    });

    // Fetch review with user details
    const populatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "avatar"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Review posted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Error posting review",
      error: error.message,
    });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "avatar"],
        },
      ],
      limit: 20, // Limit to 20 most recent reviews
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// @desc    Like a review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user already liked
    const likedBy = review.likedBy || [];
    const userIndex = likedBy.indexOf(req.user.id);

    if (userIndex === -1) {
      // Like
      likedBy.push(req.user.id);
      review.likes += 1;
    } else {
      // Unlike
      likedBy.splice(userIndex, 1);
      review.likes = Math.max(0, review.likes - 1);
    }

    // Update with new array and count
    // NOTE: Sequelize JSON updates sometimes need explicit reassignment
    review.likedBy = [...likedBy];
    await review.save();

    res.status(200).json({
      success: true,
      likes: review.likes,
      isLiked: userIndex === -1, // True if we just liked it
    });
  } catch (error) {
    console.error("Like review error:", error);
    res.status(500).json({
      success: false,
      message: "Error liking review",
      error: error.message,
    });
  }
};
