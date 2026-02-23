/**
 * Pricing utilities for the Vadtrans application
 */

// Service fee configuration
const SERVICE_FEE_PERCENTAGE = 0.05; // 5% of subtotal
const MIN_SERVICE_FEE = 0; // Minimum service fee in Naira (removed 500 minimum)
const MAX_SERVICE_FEE = 100000000000; // Maximum service fee in Naira

/**
 * Calculate service fee based on subtotal
 * @param {number} subtotal - The subtotal amount
 * @returns {number} The calculated service fee
 */
export const calculateServiceFee = (subtotal) => {
  if (!subtotal || subtotal <= 0) return 0;

  const calculatedFee = subtotal * SERVICE_FEE_PERCENTAGE;

  // Apply max constraints (min constraint removed)
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
