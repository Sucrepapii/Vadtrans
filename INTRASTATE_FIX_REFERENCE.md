## INTRA-STATE FIX: City-to-City Within Same State

## File: TicketsManagement.jsx

### Change 1: Update State Fields (Lines 45-46)

**FIND:**

```javascript
    fromState: "", // For intra-state: selected state
    toState: "",   // For intra-state: selected state
```

**REPLACE WITH:**

```javascript
    state: "", // For intra-state: the state for city-to-city trips
```

---

### Change 2: Update Form Reset (Lines 91-93)

**FIND:**

```javascript
      fromState: "",
      toState: "",
```

**REPLACE WITH:**

```javascript
      state: "",
```

---

### Change 3: Update Transport Type onChange (Lines 362-367)

**FIND:**

```javascript
              onChange={(e) => {
                setFormData({
                  ...formData,
                  transportType: e.target.value,
                  from: "",
                  to: "",
                  fromState: "",
                  toState: "",
                });
              }}
```

**REPLACE WITH:**

```javascript
              onChange={(e) => {
                setFormData({
                  ...formData,
                  transportType: e.target.value,
                  from: "",
                  to: "",
                  state: "",
                });
              }}
```

---

### Change 4: Update Intra-State Dropdown Section (Starting around line 381)

**FIND the entire intra-state section that has "From State" and "To State" labels**

**REPLACE WITH:**

```javascript
          {/* FROM LOCATION */}
          {formData.transportType === "intra-state" ? (
            <>
              {/* State Selection - Single state for city-to-city */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  State (for city-to-city trip)
                </label>
                <select
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value, from: "", to: "" })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={saving}>
                  <option value="">Select state</option>
                  {locationOptions.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* From City - within selected state */}
              {formData.state && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    From City
                  </label>
                  <select
                    value={formData.from}
                    onChange={(e) =>
                      setFormData({ ...formData, from: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={saving}>
                    <option value="">Select departure city</option>
                    {stateCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* To City - within same state */}
              {formData.state && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    To City
                  </label>
                  <select
                    value={formData.to}
                    onChange={(e) =>
                      setFormData({ ...formData, to: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={saving}>
                    <option value="">Select destination city</option>
                    {stateCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
```

**NOTE:** The logic for `stateCities` is already correct - it uses `formData.state` to get cities from the selected state.

---

## Summary of Changes

1. Remove `fromState` and `toState` fields
2. Add single `state` field
3. Both From City and To City dropdowns use cities from the same `state`

## Result

**Intra-State Trip Flow:**

1. Select "Intra-State City-to-City Trips"
2. Select State: "Lagos"
3. From City dropdown appears: Ikeja, Victoria Island, Badagry, etc.
4. To City dropdown appears: Same cities (Ikeja, Victoria Island, Badagry, etc.)
5. Result: Trip from Ikeja to Badagry (both in Lagos)

This ensures TRUE city-to-city trips within the SAME state!
