/**
 * Pricing utilities for the Vadtrans application
 */

// Service fee configuration
const SERVICE_FEE_PERCENTAGE = 0.05; // 5% of subtotal
const VAT_PERCENTAGE = 0.075; // 7.5% of service fee
const MIN_SERVICE_FEE = 0; // Minimum service fee in Naira (removed 500 minimum)
const MAX_SERVICE_FEE = 100000000000; // Maximum service fee in Naira

export const calculateServiceFee = (subtotal) => {
  return 0; // Removed service charge to customer (pricing is commission-based)
};

/**
 * Calculate VAT based on service fee
 * @param {number} serviceFee - The service fee amount
 * @returns {number} The calculated VAT
 */
export const calculateVAT = (serviceFee) => {
  return 0; // No VAT since service fee is 0
};

/**
 * Calculate total amount including service fee and VAT
 * @param {number} subtotal - The subtotal amount
 * @returns {object} Object containing subtotal, serviceFee, vat, and total
 */
export const calculateTotal = (subtotal) => {
  const serviceFee = calculateServiceFee(subtotal);
  const vat = calculateVAT(serviceFee);
  const total = subtotal + serviceFee + vat;

  return {
    subtotal,
    serviceFee,
    vat,
    total,
  };
};

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `₦${amount.toLocaleString()}`;
};
