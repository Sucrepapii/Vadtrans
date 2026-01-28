import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 24,
}) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex">
      {[...Array(5)].map((star, i) => {
        const ratingValue = i + 1;

        return (
          <label key={i} className="cursor-pointer">
            {!readonly && (
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => onRatingChange(ratingValue)}
                className="hidden"
              />
            )}
            <FaStar
              size={size}
              className={`transition-colors duration-200 ${
                ratingValue <= (hover || rating)
                  ? "text-yellow-400"
                  : "text-neutral-300"
              }`}
              onMouseEnter={() => !readonly && setHover(ratingValue)}
              onMouseLeave={() => !readonly && setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
