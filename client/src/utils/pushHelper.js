// Base64 to Uint8Array helper
export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Hardcoded safe public key generated for this app
const PUBLIC_VAPID_KEY = "BAyFaRbp8t8JF7yh2QnThH2Jd9TKOj0_cm3m6axlUvbK7I5LKbhKpDhRLkbc6PIPLBcfoWOk6IERQP5whM7N2A8";

/**
 * Registers service worker and subscribes to push notifications
 */
export const subscribeUserToPush = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn("Service workers are not supported by this browser.");
    return null;
  }
  if (!('PushManager' in window)) {
    console.warn("Push notifications are not supported by this browser.");
    return null;
  }

  try {
    // 1. Request Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("Push notification permission denied.");
      return null;
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log("Service Worker registered successfully!");

    // Wait until it's ready
    await navigator.serviceWorker.ready;

    // 3. Subscribe to push
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      console.log("New push subscription created!");
    } else {
      console.log("Existing push subscription found.");
    }

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return null;
  }
};
