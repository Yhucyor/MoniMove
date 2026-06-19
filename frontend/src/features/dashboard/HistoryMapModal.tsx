'use client';

import { useEffect, useRef } from 'react';
import { X, Navigation, Clock, MapPin } from 'lucide-react';

interface GpsPoint {
  timestamp: number;
  lat: number;
  lng: number;
  speed?: number;
}

interface HistoryMapModalProps {
  points: GpsPoint[];
  focusIndex: number;
  onClose: () => void;
}

export default function HistoryMapModal({ points, focusIndex, onClose }: HistoryMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const focusPoint = points[focusIndex];

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Lazy-load Leaflet
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any).catch(() => {}),
    ]).then(([L]) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, {
        center: [focusPoint.lat, focusPoint.lng],
        zoom: 15,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Vẽ toàn bộ lộ trình
      if (points.length > 1) {
        const latlngs = points.map(p => [p.lat, p.lng] as [number, number]);
        L.polyline(latlngs, {
          color: '#00b494',
          weight: 4,
          opacity: 0.8,
        }).addTo(map);
      }

      // Icon xuất phát (xanh lá)
      const startIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #22c55e40"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      });

      // Icon điểm cuối (đỏ)
      const endIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #ef444440"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      });

      // Icon điểm đang focus (xanh dương, lớn hơn)
      const focusIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px #3b82f640;display:flex;align-items:center;justify-content:center">
          <div style="width:6px;height:6px;background:white;border-radius:50%"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: '',
      });

      // Icon điểm thường (xám nhỏ)
      const dotIcon = L.divIcon({
        html: `<div style="width:8px;height:8px;background:#94a3b8;border-radius:50%;border:1.5px solid white"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
        className: '',
      });

      points.forEach((pt, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === points.length - 1;
        const isFocus = idx === focusIndex;

        const icon = isFocus ? focusIcon : isFirst ? startIcon : isLast ? endIcon : dotIcon;

        const time = new Date(pt.timestamp).toLocaleTimeString('vi-VN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        L.marker([pt.lat, pt.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;font-size:12px;min-width:140px">
              <b style="color:${isFocus ? '#3b82f6' : isFirst ? '#22c55e' : isLast ? '#ef4444' : '#475569'}">
                ${isFirst ? '🟢 Xuất phát' : isLast ? '🔴 Điểm cuối' : isFocus ? '🔵 Điểm này' : `Điểm ${idx + 1}`}
              </b><br/>
              🕐 ${time}<br/>
              ${pt.speed !== undefined ? `🚀 ${pt.speed.toFixed(1)} km/h` : ''}
            </div>
          `, { maxWidth: 180 });

        if (isFocus) {
          setTimeout(() => {
            L.marker([pt.lat, pt.lng], { icon }).addTo(map).openPopup();
          }, 300);
        }
      });

      // Fit bounds để thấy toàn bộ lộ trình
      if (points.length > 1) {
        const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points, focusIndex]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-[#00b494]/10 flex items-center justify-center">
                <Navigation className="h-4 w-4 text-[#00b494]" />
              </div>
              Lộ trình di chuyển
            </h3>
            <p className="text-[12px] text-slate-400 mt-0.5 ml-9">
              {points.length} điểm GPS •{' '}
              {new Date(points[0]?.timestamp).toLocaleDateString('vi-VN')}
            </p>
          </div>

          {/* Focus point info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1 justify-end">
                <MapPin className="h-3 w-3" />
                {focusIndex === 0 ? 'Xuất phát' : focusIndex === points.length - 1 ? 'Điểm cuối' : `Điểm ${focusIndex + 1}`}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                {new Date(focusPoint.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} className="flex-1 min-h-[420px] w-full" />

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-[11px] text-slate-500 font-medium">Xuất phát</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-[11px] text-slate-500 font-medium">Điểm đang xem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-[11px] text-slate-500 font-medium">Điểm cuối</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-6 bg-[#00b494] rounded" />
            <span className="text-[11px] text-slate-500 font-medium">Lộ trình</span>
          </div>
        </div>
      </div>
    </div>
  );
}
