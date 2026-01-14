// This is a REFERENCE file showing the updated dropdown section for TicketsManagement.jsx
// Replace lines 381-433 in TicketsManagement.jsx with this code

{
  /* FROM LOCATION */
}
{
  formData.transportType === "intra-state" ? (
    <>
      {/* From State */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          From State
        </label>
        <select
          value={formData.fromState}
          onChange={(e) =>
            setFormData({ ...formData, fromState: e.target.value, from: "" })
          }
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={saving}>
          <option value="">Select state</option>
          {locationOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* From City - Only show after state selected */}
      {formData.fromState && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            From City
          </label>
          <select
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={saving}>
            <option value="">Select city</option>
            {fromCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  ) : (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        From
      </label>
      <select
        value={formData.from}
        onChange={(e) => setFormData({ ...formData, from: e.target.value })}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        required
        disabled={saving}>
        <option value="">
          Select departure{" "}
          {formData.transportType === "international" ? "country" : "state"}
        </option>
        {locationOptions.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
}

{
  /* TO LOCATION */
}
{
  formData.transportType === "intra-state" ? (
    <>
      {/* To State */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          To State
        </label>
        <select
          value={formData.toState}
          onChange={(e) =>
            setFormData({ ...formData, toState: e.target.value, to: "" })
          }
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          disabled={saving}>
          <option value="">Select state</option>
          {locationOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* To City - Only show after state selected */}
      {formData.toState && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            To City
          </label>
          <select
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={saving}>
            <option value="">Select city</option>
            {toCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  ) : (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        To
      </label>
      <select
        value={formData.to}
        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        required
        disabled={saving}>
        <option value="">
          Select destination{" "}
          {formData.transportType === "international" ? "country" : "state"}
        </option>
        {locationOptions.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
}
