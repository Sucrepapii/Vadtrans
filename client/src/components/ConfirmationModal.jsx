import React from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, success
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: FaExclamationTriangle,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      confirmBtnClass: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    danger: {
      icon: FaTimesCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      confirmBtnClass: "bg-red-500 hover:bg-red-600 text-white",
    },
    success: {
      icon: FaCheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      confirmBtnClass: "bg-green-500 hover:bg-green-600 text-white",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div
          className={`${config.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`${config.iconColor} text-3xl`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-charcoal text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-neutral-600 text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmBtnClass}`}>
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
