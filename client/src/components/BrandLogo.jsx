import React from "react";

const BrandLogo = ({ className = "h-10 md:h-12", variant = "default" }) => {
  const red = "#E11D48";
  const charcoal = variant === "white" ? "#FFFFFF" : "#262626";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* V Symbol */}
      <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-3/5 w-auto mb-0.5"
      >
        <path
          d="M25 10L50 50L40 50L15 10H25Z"
          fill={red}
        />
        <path
          d="M75 10L50 50L60 50L85 10H75Z"
          fill={charcoal}
        />
      </svg>
      {/* Text */}
      <span 
        className="text-[12px] md:text-[14px] font-black tracking-tight leading-none"
        style={{ 
          color: charcoal, 
          fontFamily: "'Inter', sans-serif",
          marginTop: "-2px"
        }}
      >
        <span style={{ color: red }}>Vad</span>Trans
      </span>
    </div>
  );
};

export default BrandLogo;
