'use client';

import dynamic from 'next/dynamic';

// Import MapComponent với dynamic để tránh lỗi SSR (Leaflet - bản cũ hoạt động tốt)
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold text-lg">Đang tải bản đồ...</p>
          <p className="text-slate-400 text-sm mt-1">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }
);

export default function MonitorTab() {
  return (
    <div className="fixed inset-0 top-0 left-0 w-full h-full">
      {/* Bản đồ toàn màn hình */}
      <div className="absolute inset-0 z-0">
        <MapComponent />
      </div>
    </div>
  );
}
