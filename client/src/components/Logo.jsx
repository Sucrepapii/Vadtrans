import React from "react";

const Logo = ({ className = "h-10 md:h-12", variant = "default" }) => {
  const primaryColor = "#E11D48"; // Vibrant Red
  const secondaryColor = variant === "white" ? "#FFFFFF" : "#262626"; // Charcoal or White

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Red Left Stroke of V */}
        <path
          d="M20 20L50 80L35 80L5 20H20Z"
          fill={primaryColor}
        />
        {/* Secondary Right Stroke of V */}
        <path
          d="M80 20L50 80L65 80L95 20H80Z"
          fill={secondaryColor}
        />
      </svg>
      <div className="flex flex-col">
        <span 
          className="text-lg md:text-xl font-bold tracking-tighter"
          style={{ color: secondaryColor, fontFamily: "Raleway, sans-serif" }}
        >
          <span style={{ color: primaryColor }}>Vad</span>Trans
        </span>
      </div>
    </div>
  );
};

export default Logo;
