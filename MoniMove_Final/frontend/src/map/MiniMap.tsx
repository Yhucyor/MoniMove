'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Tự động pan map khi tọa độ thay đổi
function MapPanner({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.5 });
  }, [lat, lng, map]);
  return null;
}

interface MiniMapProps {
  deviceId: string;
  lat?: number;
  lng?: number;
}

const DEFAULT_LAT = 10.8045;
const DEFAULT_LNG = 106.738;

export default function MiniMap({ deviceId, lat = DEFAULT_LAT, lng = DEFAULT_LNG }: MiniMapProps) {
  const center: [number, number] = [lat, lng];

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      dragging={true}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Pan map khi lat/lng thay đổi */}
      <MapPanner lat={lat} lng={lng} />
      <Marker position={center} icon={markerIcon}>
        <Popup>
          <div className="text-xs font-sans">
            <p className="font-bold text-[#00b494] mb-1">{deviceId}</p>
            <p className="font-mono text-[10px] text-slate-600">{lat.toFixed(6)}°N</p>
            <p className="font-mono text-[10px] text-slate-600">{lng.toFixed(6)}°E</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
