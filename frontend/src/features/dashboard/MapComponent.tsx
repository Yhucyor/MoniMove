'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// SỬA LỖI HIỂN THỊ ICON: Mặc định Leaflet bị lỗi không load được hình cái ghim trên Next.js
const customIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent() {
  // Tọa độ mặc định hiển thị trên bản đồ (Ví dụ này đang để ở TP.HCM)
  const position: [number, number] = [10.8494, 106.7725]; 

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Nguồn cấp hình ảnh bản đồ miễn phí từ OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Cái ghim định vị vị trí thiết bị IoT */}
        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className="text-xs font-sans">
              <p className="font-bold text-[#00b494]">Thiết bị: MoniMove - 01</p>
              <p className="text-slate-500 mt-0.5">Trạng thái: Đang kết nối</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}