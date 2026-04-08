import { useCallback, useMemo } from 'react';
import nigeriaLocations from '../data/nigeria-locations.json';

/**
 * useLocationsAPI Hook
 * Now using a static local dataset for 100% reliable Nigerian States and Cities (LGAs).
 * This eliminates the "missing cities" issues from the previous third-party API.
 */
export const useLocationsAPI = () => {
  // Extract states list from static data
  const states = useMemo(() => nigeriaLocations.map(item => ({
    name: item.state,
    alias: item.alias || item.state.toLowerCase().replace(/ /g, '_')
  })).sort((a, b) => a.name.localeCompare(b.name)), []);

  // Function to fetch cities (LGAs) for a specific state
  // Kept as async to maintain backward compatibility with existing components
  const getCitiesForState = useCallback(async (stateName) => {
    if (!stateName) return [];
    
    // Find the state in our static data
    const stateData = nigeriaLocations.find(
      s => s.state.toLowerCase() === stateName.toLowerCase() || 
           s.alias === stateName.toLowerCase() ||
           s.state === stateName
    );

    if (stateData) {
      // Sort cities alphabetically for better UX
      return [...stateData.lgas].sort();
    }

    return [];
  }, []);

  // Return values - memoized to prevent infinite re-render loops in components
  return useMemo(() => ({
    states,
    loadingStates: false, // Static data is always ready
    getCitiesForState,
    loadingCities: false  // Static data is instant
  }), [states, getCitiesForState]);
};
