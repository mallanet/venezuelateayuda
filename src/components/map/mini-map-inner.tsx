"use client";

import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/** Mapa estático de solo lectura que muestra un área aproximada, no un punto exacto. */
export default function MiniMapInner({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[lat, lng]}
        radius={800}
        pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.25 }}
      />
    </MapContainer>
  );
}
