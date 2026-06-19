'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu, Route, Shield } from 'lucide-react';
import AlertsOverlay from './AlertsOverlay';
import { useAlertProcessor } from '../../hooks/useAlertProcessor';
import { useMyDevices } from '../../hooks/useMyDevices';
import { useWebSocket } from '../../hooks/useWebSocket';
import RealtimeStatusBar from '../../component/RealtimeStatusBar';

const LeafletMap = dynamic(
  () => import('../../map/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  },
);

export default function MonitorTab({
  isSidebarOpen,
  onOpenSidebar,
}: {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
}) {
  const [showRoute, setShowRoute] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const { primaryDeviceId, devices, loading: devicesLoading } = useMyDevices();
  const deviceId = primaryDeviceId || 'DEVICE_ESP32_01';

  useAlertProcessor(deviceId);

  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);

  // Cập nhật lastUpdateAt khi nhận device:update qua WebSocket
  const { connectionState, lastPing, isConnected } = useWebSocket({
    deviceIds: [deviceId],
    onDeviceUpdate: () => setLastUpdateAt(Date.now()),
  });

  if (!devicesLoading && devices.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <Shield className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Chưa có thiết bị được cấp quyền</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Tài khoản của bạn chưa được Admin cấp quyền. Vui lòng liên hệ quản trị viên.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-50">
      {/* Floating menu button */}
      <div className="absolute top-4 left-4 z-[2000]">
        <button
          onClick={onOpenSidebar}
          onMouseEnter={onOpenSidebar}
          className={`p-2.5 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-lg text-slate-600 transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer ${isSidebarOpen ? 'border-[#00b494]/30 text-[#00b494]' : ''}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Realtime status — top right */}
      <div className="absolute top-4 right-4 z-[2000]">
        <RealtimeStatusBar
          connectionState={connectionState}
          lastPing={lastPing}
          lastUpdateAt={lastUpdateAt}
          deviceId={deviceId}
        />
      </div>

      {/* Map */}
      <LeafletMap deviceId={deviceId} showRoute={showRoute} showSafeZone={showSafeZone} />

      {/* Alerts overlay */}
      <AlertsOverlay deviceId={deviceId} />

      {/* Map controls toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-slate-200/50 whitespace-nowrap">
        <button
          onClick={() => setShowRoute(!showRoute)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 active:scale-95 border ${showRoute
            ? 'bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-700 border-blue-200/60'
            : 'bg-slate-50/50 text-slate-400 border border-slate-200/40'
            }`}
        >
          <Route className="w-3.5 h-3.5" />
          Lộ trình
        </button>
        <button
          onClick={() => setShowSafeZone(!showSafeZone)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 active:scale-95 border ${showSafeZone
            ? 'bg-gradient-to-r from-emerald-100/80 to-teal-100/80 text-emerald-700 border-emerald-200/60'
            : 'bg-slate-50/50 text-slate-400 border border-slate-200/40'
            }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Vùng an toàn
        </button>

        {/* Live indicator */}
        {isConnected && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] font-bold text-emerald-600">LIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
