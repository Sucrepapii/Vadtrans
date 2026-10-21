import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initMetaPixel, trackPageView } from "../utils/metaPixel";

/**
 * MetaPixelTracker
 * Watches React Router location changes and automatically triggers
 * fbq('track', 'PageView') on every route transition for single-page app compliance.
 */
const MetaPixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure Pixel is initialized
    initMetaPixel();
    // Fire PageView on every route change
    trackPageView();
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixelTracker;
