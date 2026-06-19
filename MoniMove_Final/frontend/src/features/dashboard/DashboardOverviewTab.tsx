'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Activity, MapPin, Wifi, WifiOff, RefreshCw, ChevronRight, Radio,
  Gauge, Battery, Navigation, AlertTriangle,
} from 'lucide-react';
import { useMyDevices } from '../../hooks/useMyDevices';
import { useOfflineSyncState } from '../../contexts/OfflineSyncContext';
import { useRealtimeDashboard } from '../../hooks/useRealtimeDashboard';
import { getConnectionStatus, formatLastSeen } from '../../utils/deviceStatus';
import DeviceCard from './DeviceCard';
import MotionStatusCard from './MotionStatusCard';
import RealtimeStatusBar from '../../component/RealtimeStatusBar';
import LiveTrackWidget from './LiveTrackWidget';

const MiniMap = dynamic(() => import('../../map/MiniMap'), { ssr: false });

interface DashboardOverviewTabProps {
  onNavigate?: (tab: string, deviceId?: string) => void;
}

export default function DashboardOverviewTab({ onNavigate }: DashboardOverviewTabProps) {
  const { devices, loading, refresh } = useMyDevices();
  const { isOnline, isSyncing, lastSyncAt, syncData } = useOfflineSyncState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (devices.length > 0 && !selectedId) setSelectedId(devices[0].id);
  }, [devices, selectedId]);

  // Realtime data via WebSocket + Firebase
  const {
    liveData,
    motionState,
    lastUpdateAt,
    alerts: wsAlerts,
    metrics,
    wsConnectionState,
    isWsConnected,
    lastPing,
  } = useRealtimeDashboard(selectedId);

  const onlineCount = devices.filter((d) => {
    const conn = getConnectionStatus(undefined, undefined, d.connectionStatus || d.status);
    return conn === 'online';
  }).length;

  if (!loading && devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center max-w-lg mx-auto mt-8">
        <Radio className="h-10 w-10 text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-700">Chưa có thiết bị</h3>
        <p className="mt-2 text-xs text-slate-500">Liên hệ Admin để được cấp quyền truy cập thiết bị.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#00b494]" />
            Dashboard giám sát
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Vị trí, trạng thái và dữ liệu cảm biến theo thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RealtimeStatusBar
            connectionState={wsConnectionState}
            lastPing={lastPing}
            lastUpdateAt={lastUpdateAt}
            deviceId={selectedId ?? undefined}
          />
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold border ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 'bg-amber-50 text-amber-600 border-amber-200/50'
            }`}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <button onClick={() => { refresh(); syncData(); }} disabled={isSyncing || loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Tổng thiết bị', value: devices.length, color: 'text-slate-900', sub: '' },
          { label: 'Trực tuyến', value: onlineCount, color: 'text-emerald-600', sub: `${devices.length > 0 ? Math.round((onlineCount / devices.length) * 100) : 0}%` },
          {
            label: 'Tốc độ hiện tại',
            value: liveData ? `${liveData.speed.toFixed(0)} km/h` : '—',
            color: liveData && liveData.speed >= 80 ? 'text-red-500' : 'text-blue-600',
            sub: 'live'
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className={`mt-1 text-xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
            {s.sub && <p className={`text-[9px] font-semibold mt-0.5 ${s.color} opacity-60`}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Connection quality signal bars */}
      {isWsConnected && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2.5">
          <div className="flex items-end gap-0.5">
            {(['offline', 'poor', 'good', 'excellent'] as const).map((level, i) => {
              const qualityIndex = { offline: 0, poor: 1, good: 2, excellent: 3 }[metrics.connectionQuality];
              const active = i <= qualityIndex;
              return (
                <div key={level} className={`w-1.5 rounded-sm transition-all ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  style={{ height: `${6 + i * 4}px` }} />
              );
            })}
          </div>
          <span className="text-xs font-bold text-emerald-700 capitalize">{metrics.connectionQuality}</span>
          <span className="text-[10px] text-emerald-600">{metrics.updatesPerMinute} updates/min</span>
          <span className="text-[10px] text-slate-400 ml-auto">{metrics.updateCount} tổng điểm dữ liệu</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Device list */}
        <div className="lg:col-span-2 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Thiết bị</h3>
          {loading ? (
            <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            devices.map((d) => {
              const isSelected = selectedId === d.id;
              const isLive = isSelected && isWsConnected;
              return (
                <button key={d.id} onClick={() => setSelectedId(d.id)}
                  className={`w-full flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${isSelected ? 'border-[#00b494]/40 bg-[#00b494]/5 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{d.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isLive && <span className="text-[9px] font-bold text-emerald-600">LIVE</span>}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Map + live panel */}
        <div className="lg:col-span-3 space-y-3">
          {selectedId && (
            <>
              {/* Map */}
              <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#00b494]" />
                    <span className="text-xs font-bold text-slate-700">Vị trí GPS thời gian thực</span>
                    {isWsConnected && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">LIVE</span>}
                  </div>
                  {lastUpdateAt && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(lastUpdateAt).toLocaleTimeString('vi-VN')}
                    </span>
                  )}
                </div>
                <div className="h-[200px] w-full">
                  <MiniMap
                    deviceId={selectedId}
                    lat={liveData?.lat}
                    lng={liveData?.lng}
                  />
                </div>
              </div>

              {/* Live sensor strip */}
              {liveData && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center">
                    <Navigation className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-black text-blue-700">{liveData.speed.toFixed(0)}</p>
                    <p className="text-[9px] text-blue-500 font-bold">km/h</p>
                  </div>
                  <div className={`rounded-xl border p-3 text-center ${liveData.isTilted ? 'border-red-200 bg-red-50 animate-pulse' : 'border-slate-100 bg-slate-50'}`}>
                    <Gauge className={`h-4 w-4 mx-auto mb-1 ${liveData.isTilted ? 'text-red-500' : 'text-slate-400'}`} />
                    <p className={`text-xs font-black ${liveData.isTilted ? 'text-red-600' : 'text-slate-600'}`}>
                      {liveData.isTilted ? 'NGÃ!' : 'AN TOÀN'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold">IMU</p>
                  </div>
                </div>
              )}

              {/* Recent WS alerts */}
              {wsAlerts.length > 0 && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Cảnh báo gần đây (realtime)
                  </p>
                  {wsAlerts.slice(0, 3).map((a) => (
                    <div key={a.id} className={`flex items-start gap-2 rounded-xl p-2.5 border text-xs ${a.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{a.alertType}</p>
                        <p className="text-[10px] opacity-80 truncate">{a.message}</p>
                      </div>
                      <span className="text-[9px] shrink-0 opacity-60">
                        {new Date(a.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={() => onNavigate?.('monitor')}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#12a1c0] to-[#00b494] py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-[0.98]">
                  Mở bản đồ đầy đủ
                </button>
                <button onClick={() => onNavigate?.('activity_history', selectedId)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">
                  Lịch sử hoạt động
                </button>
              </div>

              {/* Motion status */}
              <MotionStatusCard deviceId={selectedId} />

              {/* Live track stats */}
              <LiveTrackWidget deviceId={selectedId} />
            </>
          )}
        </div>
      </div>

      {lastSyncAt && (
        <p className="text-[10px] text-slate-400">
          REST sync lần cuối: {new Date(lastSyncAt).toLocaleTimeString('vi-VN')}
          {!isOnline && ' · Cache mode'}
        </p>
      )}
    </div>
  );
}
