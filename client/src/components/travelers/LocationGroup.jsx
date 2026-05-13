import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useLocationsAPI } from '../../hooks/useLocationsAPI';

const LocationGroup = ({ 
  labelPrefix = "Leaving from", 
  stateValue, 
  cityValue, 
  onStateChange, 
  onCityChange 
}) => {
  const { states, getCitiesForState, loadingStates, loadingCities } = useLocationsAPI();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (stateValue) {
      getCitiesForState(stateValue).then(fetchedCities => {
        if (isMounted) {
          setCities(fetchedCities || []);
        }
      });
    } else {
      setCities([]);
    }
    return () => { isMounted = false; };
  }, [stateValue]); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3 w-full">
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">{labelPrefix} State</label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
          <select
            value={stateValue}
            onChange={(e) => {
              onStateChange(e.target.value);
              onCityChange(""); // Reset city when state changes
            }}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base bg-white"
            required
          >
            <option value="">{loadingStates ? "Loading states..." : "Select state"}</option>
            {states.map(s => (
              <option key={s.state_code || s.name} value={s.name || s}>{s.name || s}</option>
            ))}
          </select>
        </div>
      </div>

      {stateValue && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-charcoal mt-1 mb-2">{labelPrefix} City</label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
            <select
              value={cityValue}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary appearance-none sm:text-base text-base bg-white"
              required
            >
              <option value="">{loadingCities ? "Loading cities..." : "Select city"}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationGroup;
