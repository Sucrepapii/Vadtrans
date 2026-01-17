import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon missing assets
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map when coords change
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const TrackingMap = ({ lat, lng, popupText = "Current Location" }) => {
  const numericLat = Number(lat);
  const numericLng = Number(lng);

  const isValidCoord = (val) => typeof val === "number" && !isNaN(val);

  if (!isValidCoord(numericLat) || !isValidCoord(numericLng)) {
    return (
      <div className="h-64 bg-gray-100 flex items-center justify-center text-neutral-500">
        Location data unavailable
      </div>
    );
  }

  return (
    <div style={{ height: "400px", width: "100%", position: "relative" }}>
      <MapContainer
        center={[numericLat, numericLng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.5rem",
          zIndex: 0,
        }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[numericLat, numericLng]}>
          <Popup>{popupText}</Popup>
        </Marker>
        <RecenterMap lat={numericLat} lng={numericLng} />
      </MapContainer>
    </div>
  );
};

export default TrackingMap;
