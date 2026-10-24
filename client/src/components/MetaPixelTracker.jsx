import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initMetaPixel, trackPageView } from "../utils/metaPixel";

/**
 * MetaPixelTracker
 * Watches React Router location changes and automatically triggers
 * fbq('track', 'PageView') on every route transition for single-page app compliance.
 */
const MetaPixelTracker = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Ensure Pixel is initialized
    initMetaPixel();

    // The base code in <head> already tracks the initial PageView on page load.
    // Only track PageView on subsequent SPA route transitions to prevent duplicate counts.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackPageView();
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixelTracker;
