import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  className = "",
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-charcoal mb-2">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            <Icon size={20} />
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input-field ${Icon ? "pl-10" : ""} ${
            isPassword ? "pr-10" : ""
          } ${error ? "border-red-500 focus:ring-red-500" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-charcoal focus:outline-none">
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
