import React from "react";

const BrandLogo = ({ className = "h-10 md:h-12", variant = "default" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/logo_new.png"
        alt="VadTrans Logo"
        className="h-full w-auto object-contain"
        style={variant === "white" ? { filter: "brightness(0) invert(1)" } : undefined}
      />
    </div>
  );
};

export default BrandLogo;
