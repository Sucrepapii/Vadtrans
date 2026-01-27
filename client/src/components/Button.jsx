import React from "react";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
  disabled = false,
  fullWidth = false,
}) => {
  const baseClasses =
    "font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-white px-6 py-3 rounded-button hover:bg-primary-dark",
    secondary:
      "bg-white text-primary border-2 border-primary px-6 py-3 rounded-button hover:bg-neutral-50",
    text: "text-primary hover:text-primary-dark px-4 py-2",
    danger: "bg-red-600 text-white px-6 py-3 rounded-button hover:bg-red-700",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
