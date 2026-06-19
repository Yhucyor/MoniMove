'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Menu, Route, Shield, ChevronDown } from 'lucide-react';
import AlertsOverlay from '../dashboard/AlertsOverlay';
import { useAlertProcessor } from '../../hooks/useAlertProcessor';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRealtimeDashboard } from '../../hooks/useRealtimeDashboard';
import RealtimeStatusBar from '../../component/RealtimeStatusBar';
import { listDevices, DeviceListItem } from '../../services/api';

const LeafletMap = dynamic(() => import('../../map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-semibold text-sm">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

export default function SystemMonitorTab({
  isSidebarOpen,
  onOpenSidebar,
}: {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
}) {
  const [showRoute, setShowRoute] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  useEffect(() => {
    listDevices().then((list) => {
      setDevices(list);
      if (list.length > 0) setSelectedDeviceId(list[0].id);
    }).catch(() => { });
  }, []);

  useAlertProcessor(selectedDeviceId);

  const { connectionState, lastPing, isConnected } = useWebSocket({
    deviceIds: devices.map((d) => d.id), // Admin subscribes to ALL devices
  });

  const { liveData, lastUpdateAt, metrics } = useRealtimeDashboard(selectedDeviceId);

  return (
    <div className="relative w-full h-full">
      {/* Hamburger */}
      <div className="absolute top-4 left-4 z-[2000]">
        <button
          onClick={onOpenSidebar}
          onMouseEnter={onOpenSidebar}
          className={`p-2.5 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-lg text-slate-600 transition-all active:scale-95 cursor-pointer ${isSidebarOpen ? 'text-amber-500 border-amber-300/50' : ''}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-slate-200/50 whitespace-nowrap">
        {/* Device selector */}
        <div className="relative">
          <button
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors"
          >
            {devices.find((d) => d.id === selectedDeviceId)?.name || selectedDeviceId}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showDeviceMenu && devices.length > 1 && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[160px]">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDeviceId(d.id); setShowDeviceMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 ${d.id === selectedDeviceId ? 'text-amber-600 bg-amber-50/50' : 'text-slate-700'}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200" />

        <button onClick={() => setShowRoute(!showRoute)}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border ${showRoute ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 'bg-slate-50/50 text-slate-400 border-slate-200/40'
            }`}>
          <Route className="w-3.5 h-3.5" />
          Lộ trình
        </button>

        <button onClick={() => setShowSafeZone(!showSafeZone)}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border ${showSafeZone ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-slate-50/50 text-slate-400 border-slate-200/40'
            }`}>
          <Shield className="w-3.5 h-3.5" />
          Vùng an toàn
        </button>

        {isConnected && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
            <span className="text-[9px] font-bold text-amber-600">LIVE · {devices.length} devices</span>
          </div>
        )}
      </div>

      {/* Realtime status — top right */}
      <div className="absolute top-4 right-4 z-[2000]">
        <RealtimeStatusBar
          connectionState={connectionState}
          lastPing={lastPing}
          lastUpdateAt={lastUpdateAt}
          deviceId={selectedDeviceId}
        />
      </div>

      {/* Live data strip — bottom */}
      {liveData && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-3 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/10 text-xs font-bold whitespace-nowrap">
          <span className="text-slate-400">
            {liveData.lat.toFixed(5)}, {liveData.lng.toFixed(5)}
          </span>
          <span className="text-slate-600">|</span>
          <span className={liveData.speed >= 80 ? 'text-red-400' : 'text-emerald-400'}>
            {liveData.speed.toFixed(0)} km/h
          </span>
          {liveData.isTilted && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-red-400 animate-pulse">⚠ NGÃ ĐỔ!</span>
            </>
          )}
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{metrics.updatesPerMinute} upd/min</span>
        </div>
      )}

      {/* Map */}
      <LeafletMap
        deviceId={selectedDeviceId}
        showRoute={showRoute}
        showSafeZone={showSafeZone}
      />

      {/* Alerts overlay */}
      <AlertsOverlay deviceId={selectedDeviceId} />
    </div>
  );
}
