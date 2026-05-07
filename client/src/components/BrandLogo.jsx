import React from "react";

const BrandLogo = ({ className = "h-10 md:h-12", variant = "default" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span 
        className={`font-raleway font-black tracking-tighter leading-none text-3xl md:text-4xl ${variant === "white" ? "text-white" : "text-primary"}`}
        style={{ letterSpacing: "-0.04em" }}
      >
        vadtrans
      </span>
    </div>
  );
};

export default BrandLogo;
