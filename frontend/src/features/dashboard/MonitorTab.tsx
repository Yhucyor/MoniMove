'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu, Route, Shield } from 'lucide-react';
import AlertsOverlay from './AlertsOverlay';
import { useAlertProcessor } from '../../hooks/useAlertProcessor';

const SmartGoogleMap = dynamic(
  () => import('../../map/SmartGoogleMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Đang tải Google Maps...</p>
        </div>
      </div>
    )
  }
);

const LeafletMap = dynamic(
  () => import('../../map/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Đang tải Leaflet Maps...</p>
        </div>
      </div>
    )
  }
);

export default function MonitorTab({ 
  isSidebarOpen, 
  onOpenSidebar 
}: { 
  isSidebarOpen: boolean; 
  onOpenSidebar: () => void; 
}) {
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('leaflet');
  const [showRoute, setShowRoute] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const deviceId = 'DEVICE_ESP32_01'; // Default device ID

  // Auto-process device data and generate alerts
  useAlertProcessor(deviceId);

  const handleAlertClick = (alert: any) => {
    // Pan map to alert location if available
    if (alert.location) {
      console.log('Navigate to alert location:', alert.location);
      // TODO: Implement map pan to location
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-50">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (hover: hover) {
          .menu-btn-hover:hover {
            color: #00b494 !important;
            border-color: rgba(0, 180, 148, 0.3) !important;
          }
          .menu-btn-hover:hover .menu-icon-hover {
            transform: rotate(180deg);
          }
        }
        .menu-btn-hover.active {
          color: #00b494 !important;
          border-color: rgba(0, 180, 148, 0.3) !important;
        }
        .menu-icon-hover.rotated {
          transform: rotate(180deg);
        }
      ` }} />
      {/* Floating Hamburger Menu Button */}
      <div className="absolute top-4 left-4 z-[2000]">
        <button
          onClick={onOpenSidebar}
          onMouseEnter={onOpenSidebar}
          onTouchStart={(e) => {
            e.preventDefault();
            onOpenSidebar();
          }}
          className={`menu-btn-hover p-2.5 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-lg text-slate-600 transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer ${isSidebarOpen ? 'active' : ''}`}
        >
          <Menu className={`menu-icon-hover w-5 h-5 transition-transform duration-500 ease-out ${isSidebarOpen ? 'rotated' : ''}`} />
        </button>
      </div>

      {/* Map Renderer */}
      {mapProvider === 'google' ? (
        <SmartGoogleMap showRoute={showRoute} showSafeZone={showSafeZone} />
      ) : (
        <LeafletMap showRoute={showRoute} showSafeZone={showSafeZone} />
      )}

      {/* Alerts Overlay - Real-time alerts with danger border */}
      <AlertsOverlay deviceId={deviceId} onAlertClick={handleAlertClick} />

      {/* Floating Toolbar (Map Provider & Map Controls) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-slate-200/50 whitespace-nowrap">
        <button
          onClick={() => setMapProvider('leaflet')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1 active:scale-95 ${
            mapProvider === 'leaflet'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          🍃 Leaflet
        </button>
        <button
          onClick={() => setMapProvider('google')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1 active:scale-95 ${
            mapProvider === 'google'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          🗺️ Google Maps
        </button>

        {/* Separator Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Toggle Route Button */}
        <button
          onClick={() => setShowRoute(!showRoute)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 active:scale-95 border ${
            showRoute
              ? 'bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-700 border-blue-200/60 shadow-sm shadow-blue-100/40 hover:from-blue-200/80 hover:to-cyan-200/80'
              : 'bg-slate-50/50 text-slate-400 border border-slate-200/40 hover:bg-slate-100/60 hover:text-slate-600'
          }`}
          title={showRoute ? 'Ẩn lộ trình di chuyển' : 'Hiện lộ trình di chuyển'}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Lộ trình</span>
        </button>

        {/* Toggle Safe Zone Button */}
        <button
          onClick={() => setShowSafeZone(!showSafeZone)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 active:scale-95 border ${
            showSafeZone
              ? 'bg-gradient-to-r from-emerald-100/80 to-teal-100/80 text-emerald-700 border-emerald-200/60 shadow-sm shadow-emerald-100/40 hover:from-emerald-200/80 hover:to-teal-200/80'
              : 'bg-slate-50/50 text-slate-400 border border-slate-200/40 hover:bg-slate-100/60 hover:text-slate-600'
          }`}
          title={showSafeZone ? 'Ẩn vùng an toàn' : 'Hiện vùng an toàn'}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Vùng an toàn</span>
        </button>
      </div>
    </div>
  );
}
