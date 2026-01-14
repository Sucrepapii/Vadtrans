/**
 * Pricing utilities for the Vadtrans application
 */

// Service fee configuration
const SERVICE_FEE_PERCENTAGE = 0.02; // 2% of subtotal
const MIN_SERVICE_FEE = 50; // Minimum service fee in Naira
const MAX_SERVICE_FEE = 500; // Maximum service fee in Naira

/**
 * Calculate service fee based on subtotal
 * @param {number} subtotal - The subtotal amount
 * @returns {number} The calculated service fee
 */
export const calculateServiceFee = (subtotal) => {
  if (!subtotal || subtotal <= 0) return MIN_SERVICE_FEE;

  const calculatedFee = subtotal * SERVICE_FEE_PERCENTAGE;

  // Apply min/max constraints
  if (calculatedFee < MIN_SERVICE_FEE) return MIN_SERVICE_FEE;
  if (calculatedFee > MAX_SERVICE_FEE) return MAX_SERVICE_FEE;

  return Math.round(calculatedFee);
};

/**
 * Calculate total amount including service fee
 * @param {number} subtotal - The subtotal amount
 * @returns {object} Object containing subtotal, serviceFee, and total
 */
export const calculateTotal = (subtotal) => {
  const serviceFee = calculateServiceFee(subtotal);
  const total = subtotal + serviceFee;

  return {
    subtotal,
    serviceFee,
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
