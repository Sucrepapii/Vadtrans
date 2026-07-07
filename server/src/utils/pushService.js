const webpush = require("web-push");
require("dotenv").config();

// Configure web-push with VAPID keys
// Using hardcoded keys as a fallback because Railway might not have the .env vars injected
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || "BAyFaRbp8t8JF7yh2QnThH2Jd9TKOj0_cm3m6axlUvbK7I5LKbhKpDhRLkbc6PIPLBcfoWOk6IERQP5whM7N2A8";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "fY6JQ6dzOo14qRb00SJ6RKfcn4hm75luDtCmcw9PLc0";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:support@vadtrans.com", // You should replace this with a real contact email
    publicVapidKey,
    privateVapidKey
  );
} else {
  console.warn("⚠️ VAPID keys not configured in .env. Web push notifications will not work.");
}

/**
 * Send a push notification to a user's subscription
 * @param {Object} subscription - The push subscription object from the DB
 * @param {Object} payload - The data to send (usually stringified JSON)
 */
const sendPushNotification = async (subscription, payload) => {
  if (!publicVapidKey || !privateVapidKey) {
    console.warn("Cannot send push notification: VAPID keys missing.");
    return false;
  }

  if (!subscription) {
    return false;
  }

  try {
    const stringifiedPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
    await webpush.sendNotification(subscription, stringifiedPayload);
    return true;
  } catch (error) {
    console.error("❌ Error sending push notification:", error.message);
    // If the subscription is no longer valid (e.g. user revoked permission)
    if (error.statusCode === 410 || error.statusCode === 404) {
      return "invalid_subscription";
    }
    return false;
  }
};

module.exports = {
  sendPushNotification
};
