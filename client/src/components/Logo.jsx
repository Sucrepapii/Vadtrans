import React from "react";

const Logo = ({ className = "h-16", variant = "default" }) => {
  const primaryColor = "#E11D48"; // Vibrant Red from logo
  const secondaryColor = variant === "white" ? "#FFFFFF" : "#262626"; // Charcoal or White

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* V Symbol */}
      <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-1/2 w-auto mb-1"
      >
        <path
          d="M30 10L50 50L40 50L20 10H30Z"
          fill={primaryColor}
        />
        <path
          d="M70 10L50 50L60 50L80 10H70Z"
          fill={secondaryColor}
        />
      </svg>
      {/* Text */}
      <div className="flex items-center">
        <span 
          className="text-lg md:text-xl font-bold tracking-tight"
          style={{ color: secondaryColor, fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          <span style={{ color: primaryColor }}>Vad</span>Trans
        </span>
      </div>
    </div>
  );
};

export default Logo;
