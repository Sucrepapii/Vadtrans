import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const useLocationsAPI = () => {
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [citiesCache, setCitiesCache] = useState({});
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch all Nigeria states on mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await axios.post("https://countriesnow.space/api/v0.1/countries/states", {
          country: "Nigeria"
        });
        if (!response.data.error) {
          setStates(response.data.data.states);
        }
      } catch (error) {
        console.error("Error fetching states from API:", error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Function to fetch cities for a specific state
  const getCitiesForState = useCallback(async (stateName) => {
    if (!stateName) return [];
    
    // FCT hardcoded fallback because CountriesNow API lacks FCT cities
    if (stateName === "Federal Capital Territory") {
      return ["Abuja", "Gwagwalada", "Bwari", "Kuje", "Abaji", "Kwali"];
    }

    // Return from cache if already fetched
    if (citiesCache[stateName]) {
      return citiesCache[stateName];
    }

    setLoadingCities(true);
    try {
      const response = await axios.post("https://countriesnow.space/api/v0.1/countries/state/cities", {
        country: "Nigeria",
        state: stateName
      });
      
      if (!response.data.error) {
        const cities = response.data.data;
        // Update cache
        setCitiesCache(prev => ({ ...prev, [stateName]: cities }));
        return cities;
      }
    } catch (error) {
      console.error(`Error fetching cities for ${stateName}:`, error);
      return [];
    } finally {
      setLoadingCities(false);
    }
    return [];
  }, [citiesCache]);

  return useMemo(() => ({
    states,
    loadingStates,
    getCitiesForState,
    loadingCities
  }), [states, loadingStates, getCitiesForState, loadingCities]);
};
