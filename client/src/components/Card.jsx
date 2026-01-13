import React from "react";

const Card = ({ children, className = "", hover = false }) => {
  const hoverClass = hover
    ? "hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    : "";

  return <div className={`card ${hoverClass} ${className}`}>{children}</div>;
};

export default Card;
