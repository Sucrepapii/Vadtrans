import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaHeart, FaRegHeart, FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { reviewAPI } from "../services/api";
import StarRating from "./StarRating";
import Button from "./Button";

const ReviewSection = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getReviews();
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Please login to post a review");
      return;
    }

    if (rating === 0) {
      toast.warning("Please select a star rating");
      return;
    }

    if (!comment.trim()) {
      toast.warning("Please write a comment");
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewAPI.createReview({ rating, comment });
      toast.success("Review posted successfully!");
      setRating(0);
      setComment("");
      // Add new review to the top of list or refetch
      fetchReviews();
    } catch (error) {
      console.error("Error posting review:", error);
      toast.error(error.response?.data?.message || "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reviewId) => {
    if (!isAuthenticated) {
      toast.info("Please login to like reviews");
      return;
    }

    try {
      const response = await reviewAPI.likeReview(reviewId);
      // Update the implementation in state to reflect the new like count instantly
      setReviews((prevReviews) =>
        prevReviews.map((review) => {
          if (review.id === reviewId) {
            // Toggle like logic locally for immediate feedback
            const isLiked = response.data.isLiked;
            let newLikedBy = review.likedBy || [];
            if (isLiked) {
              if (!newLikedBy.includes(user.id)) newLikedBy.push(user.id);
            } else {
              newLikedBy = newLikedBy.filter((id) => id !== user.id);
            }
            return {
              ...review,
              likes: response.data.likes,
              likedBy: newLikedBy,
            };
          }
          return review;
        }),
      );
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const isLikedByUser = (review) => {
    if (!isAuthenticated || !user) return false;
    return review.likedBy?.includes(user?.id);
  };

  return (
    <section className="py-16 px-4 bg-neutral-50" id="reviews">
      <div className="container-custom max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-raleway font-bold text-charcoal mb-3">
            Customer Reviews
          </h2>
          <p className="text-neutral-600">
            See what our travelers have to say about us
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <p className="text-center col-span-full">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="text-center col-span-full py-8 text-neutral-500">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  {review.user?.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-neutral-300" />
                  )}
                  <div>
                    <h4 className="font-semibold text-charcoal">
                      {review.user?.name || "Anonymous"}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <StarRating rating={review.rating} readonly size={16} />
                </div>

                <div className="relative flex-1">
                  <FaQuoteLeft className="absolute -top-2 -left-2 text-primary opacity-10 text-2xl" />
                  <p className="text-neutral-600 italic relative z-10 pl-2">
                    {review.comment}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-end">
                  <button
                    onClick={() => handleLike(review.id)}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-500 transition-colors">
                    {isLikedByUser(review) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>{review.likes}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-100">
          <h3 className="text-xl font-bold text-charcoal mb-6 text-center">
            Share Your Experience
          </h3>

          {!isAuthenticated ? (
            <div className="text-center py-6">
              <p className="text-neutral-600 mb-4">
                Please log in to submit a review.
              </p>
              {/* You might want to add a login button or link here */}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-neutral-700">
                  Rating
                </label>
                <div className="bg-neutral-50 px-4 py-2 rounded-lg border border-neutral-200">
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size={32}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your trip..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={submitting || rating === 0 || !comment.trim()}>
                {submitting ? "Posting..." : "Submit Review"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
