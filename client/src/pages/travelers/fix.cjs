const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'SearchResults.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

const badCode = \`
      if (searchParams.from) params.from = searchParams.from;
      if (searchParams.to) params.to = searchParams.to;
      if (searchParams.date) params.date = searchParams.date;
      if (searchParams.serviceCategory)
        params.serviceCategory = searchParams.serviceCategory;
      if (searchParams.freightType)
        params.freightType = searchParams.freightType;

      // Handle transport type filter
      if (searchParams.transportType !== "all") {
        // If specific type selected (bus, car, domestic, international)
        // We need to match partial transport type strings
        params.transportType = searchParams.transportType;
      }

      const response = await tripAPI.getAllTrips(params);

      // Filter trips based on transportType if not "all"
      let filteredTrips = response.data.trips;

      if (searchParams.transportType && searchParams.transportType !== "all") {
        filteredTrips = filteredTrips.filter((trip) =>
          trip.transportType.includes(searchParams.transportType),
        );
      }

      setTrips(filteredTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error(error.response?.data?.message || "Failed to load trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };\`;

if (content.includes(badCode)) {
   content = content.replace(badCode, '');
   fs.writeFileSync(targetPath, content);
   console.log('Successfully fixed SearchResults.jsx');
} else {
   console.error('Could not find exact block to replace! Reading exact lines:');
   const lines = content.split('\\n');
   console.log(lines.slice(100, 145).join('\\n'));
}
