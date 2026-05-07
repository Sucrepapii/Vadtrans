import React from "react";

const BrandLogo = ({ className = "h-10 md:h-12", variant = "default" }) => {
  const red = "#E11D48";
  const charcoal = variant === "white" ? "#FFFFFF" : "#262626";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={variant === "white" ? "/logo_traveller_white.png" : "/logo_traveller.png"}
        alt="VadTrans"
        className="h-full w-auto object-contain"
      />
    </div>
  );
};

export default BrandLogo;
