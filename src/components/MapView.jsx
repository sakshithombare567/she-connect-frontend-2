import React from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

const MapView = ({ startCoords, endCoords }) => {
  // Default center: midpoint or fallback
  const center = startCoords && endCoords
    ? [
        (startCoords[0] + endCoords[0]) / 2,
        (startCoords[1] + endCoords[1]) / 2,
      ]
    : startCoords || endCoords || [20.5937, 78.9629]; // India center fallback

  return (
    <MapContainer center={center} zoom={6} style={{ height: "400px", width: "100%" }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {startCoords && <Marker position={startCoords} />}
      {endCoords && <Marker position={endCoords} />}
      {startCoords && endCoords && (
        <Polyline positions={[startCoords, endCoords]} color="blue" />
      )}
    </MapContainer>
  );
};

export default MapView;
