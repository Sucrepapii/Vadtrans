/**
 * Meta (Facebook) Pixel Utility for Vadtrans
 * Safely handles Pixel initialization, SPA route PageViews, and standard conversion events.
 */

// Retrieve Pixel ID from environment or global window object
export const getPixelId = () => {
  return (
    import.meta.env.VITE_META_PIXEL_ID ||
    (typeof window !== "undefined" && window.META_PIXEL_ID) ||
    ""
  );
};

/**
 * Initialize Meta Pixel dynamically if not already initialized in HTML head
 */
export const initMetaPixel = (customPixelId = null) => {
  if (typeof window === "undefined") return;

  const pixelId = customPixelId || getPixelId();
  if (!pixelId) {
    if (import.meta.env.DEV) {
      console.info("ℹ️ [Meta Pixel] No Pixel ID configured yet (VITE_META_PIXEL_ID). Events will be queued safely.");
    }
  }

  // Ensure window.fbq queue is ready
  if (!window.fbq) {
    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );
    /* eslint-enable */
  }

  if (pixelId && !window._metaPixelInitialized) {
    window.fbq("init", pixelId);
    window._metaPixelInitialized = true;
    if (import.meta.env.DEV) {
      console.log(`✅ [Meta Pixel] Initialized with ID: ${pixelId}`);
    }
  }
};

/**
 * Core event dispatcher
 */
export const trackMetaEvent = (eventName, params = {}) => {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.fbq === "function") {
      if (Object.keys(params).length > 0) {
        window.fbq("track", eventName, params);
      } else {
        window.fbq("track", eventName);
      }
      if (import.meta.env.DEV) {
        console.log(`📊 [Meta Pixel] Tracked '${eventName}':`, params);
      }
    } else {
      // If fbq isn't ready, initialize queue and retry
      initMetaPixel();
      if (typeof window.fbq === "function") {
        if (Object.keys(params).length > 0) {
          window.fbq("track", eventName, params);
        } else {
          window.fbq("track", eventName);
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ [Meta Pixel] Failed to track ${eventName}:`, err.message);
  }
};

/**
 * PageView trigger for SPA page transitions
 */
export const trackPageView = () => {
  trackMetaEvent("PageView");
};

/**
 * 1. Driver registration successfully submitted
 * Required Event: CompleteRegistration
 */
export const trackCompleteRegistration = (details = {}) => {
  trackMetaEvent("CompleteRegistration", details);
};

/**
 * 2. Passenger clicks “Search Trips”
 * Required Event: Search
 */
export const trackSearch = (params = {}) => {
  trackMetaEvent("Search", params);
};

/**
 * 3. Passenger clicks “Book Seat” or “Reserve a Seat”
 * Required Event: InitiateCheckout
 */
export const trackInitiateCheckout = (params = {}) => {
  trackMetaEvent("InitiateCheckout", params);
};

/**
 * 4. Paystack confirms payment success
 * Required Event: Purchase { value: <trip price>, currency: 'NGN' }
 * Guaranteed to fire once per booking reference and never on page reload.
 */
export const trackPurchase = (value, currency = "NGN", bookingReference = null) => {
  // Ensure value is a clean plain number (e.g. 5000, not "₦5,000")
  let cleanValue = 0;
  if (typeof value === "number" && !isNaN(value)) {
    cleanValue = value;
  } else if (typeof value === "string") {
    cleanValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  }

  // Prevent double-firing on page refreshes using sessionStorage
  if (bookingReference && typeof window !== "undefined") {
    const storageKey = `meta_pixel_purchased_${bookingReference}`;
    if (sessionStorage.getItem(storageKey)) {
      if (import.meta.env.DEV) {
        console.log(`ℹ️ [Meta Pixel] Purchase already recorded for ${bookingReference}. Skipping refresh duplicate.`);
      }
      return;
    }
    sessionStorage.setItem(storageKey, "true");
  }

  trackMetaEvent("Purchase", {
    value: cleanValue,
    currency: currency || "NGN",
  });
};
