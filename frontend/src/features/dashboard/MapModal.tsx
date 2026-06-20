"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { X, ExternalLink, MapPin } from "lucide-react";

const LeafletMap = dynamic(() => import("../../map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-semibold text-sm">
          Đang tải bản đồ...
        </p>
      </div>
    </div>
  ),
});

interface MapModalProps {
  deviceId: string;
  deviceName: string;
  lat: number;
  lng: number;
  onClose: () => void;
}

export default function MapModal({
  deviceId,
  deviceName,
  lat,
  lng,
  onClose,
}: MapModalProps) {
  // Đóng modal khi nhấn Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Khóa scroll nền khi modal mở
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                {deviceName}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {lat.toFixed(6)}°N, {lng.toFixed(6)}°E
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Maps
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-all duration-200 active:scale-95 cursor-pointer"
              title="Đóng bản đồ (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          <LeafletMap
            deviceId={deviceId}
            showRoute={true}
            showSafeZone={false}
          />
        </div>
      </div>
    </div>
  );
}
