"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoZone } from "../../services/geofencing";

const deviceIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:linear-gradient(135deg,#00b494,#12a1c0);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,180,148,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface Props {
  zones: GeoZone[];
  currentPos: { lat: number; lng: number } | null;
  pickingCenter: boolean;
  onPickCenter: (lat: number, lng: number) => void;
}

function ClickHandler({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const DEFAULT_CENTER: [number, number] = [16.0, 108.0]; // trung tâm VN, không có GPS thực

export default function GeofenceMap({
  zones,
  currentPos,
  pickingCenter,
  onPickCenter,
}: Props) {
  const center: [number, number] = currentPos
    ? [currentPos.lat, currentPos.lng]
    : DEFAULT_CENTER;

  return (
    // Wrapper relative để đặt hint overlay bên ngoài MapContainer
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        className={pickingCenter ? "cursor-crosshair" : ""}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <ClickHandler active={pickingCenter} onPick={onPickCenter} />

        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.centerLat, zone.centerLng]}
            radius={zone.radiusMeters}
            pathOptions={{
              color: "#00b494",
              fillColor: "#00b494",
              fillOpacity: 0.12,
              weight: 2,
              dashArray: "6,8",
            }}
          >
            <Popup>
              <p className="text-xs font-bold text-[#00b494]">{zone.name}</p>
              <p className="text-[10px] text-slate-500">
                Bán kính {zone.radiusMeters}m
              </p>
            </Popup>
          </Circle>
        ))}

        {currentPos && (
          <Marker position={[currentPos.lat, currentPos.lng]} icon={deviceIcon}>
            <Popup>
              <p className="text-xs font-semibold">Vị trí thiết bị</p>
              <p className="font-mono text-[10px] text-slate-500">
                {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}
              </p>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Hint overlay — ngoài MapContainer để render đúng */}
      {pickingCenter && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm text-xs font-bold text-[#00b494] px-3 py-1.5 rounded-full shadow-lg border border-[#00b494]/30 animate-pulse">
            📍 Nhấp vào bản đồ để chọn tâm vùng
          </div>
        </div>
      )}
    </div>
  );
}
