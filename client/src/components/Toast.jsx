import React, { createContext, useContext, useState, useCallback } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  const config = {
    success: {
      icon: FaCheckCircle,
      className: "bg-green-50 text-green-800 border-green-200",
      iconColor: "text-green-500",
    },
    error: {
      icon: FaExclamationCircle,
      className: "bg-red-50 text-red-800 border-red-200",
      iconColor: "text-red-500",
    },
    warning: {
      icon: FaExclamationTriangle,
      className: "bg-yellow-50 text-yellow-800 border-yellow-200",
      iconColor: "text-yellow-500",
    },
    info: {
      icon: FaInfoCircle,
      className: "bg-blue-50 text-blue-800 border-blue-200",
      iconColor: "text-blue-500",
    },
  };

  const { icon: Icon, className, iconColor } = config[type] || config.info;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in ${className}`}>
      <Icon className={`text-xl flex-shrink-0 ${iconColor}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity">
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
