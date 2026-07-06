const webpush = require("web-push");
require("dotenv").config();

// Configure web-push with VAPID keys
// Note: These must be in your .env file
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

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
