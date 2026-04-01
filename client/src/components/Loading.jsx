import React from "react";

const Loading = ({ fullPage = false, size = "md" }) => {
  const sizeClasses = {
    xs: "h-4",
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
    xl: "h-32",
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/logo_full.png"
        alt="Loading..."
        className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain animate-pulse-slow`}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center w-full ${size === 'xs' ? '' : 'p-8'}`}>
      {loaderContent}
    </div>
  );
};

export default Loading;
