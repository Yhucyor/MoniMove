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
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300">
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

      {/* Stats row — 3 cols */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng thiết bị', value: devices.length, color: 'text-slate-900', sub: '', icon: '📡' },
          { label: 'Trực tuyến', value: onlineCount, color: 'text-emerald-600', sub: `${devices.length > 0 ? Math.round((onlineCount / devices.length) * 100) : 0}%`, icon: '🟢' },
          {
            label: 'Tốc độ',
            value: liveData ? `${liveData.speed.toFixed(0)} km/h` : '—',
            color: liveData && liveData.speed >= 80 ? 'text-red-500' : 'text-blue-600',
            sub: 'live',
            icon: '⚡'
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm flex items-center gap-3">
            <span className="text-2xl leading-none shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={`mt-0.5 text-lg font-black truncate ${s.color}`}>{loading ? '—' : s.value}</p>
              {s.sub && <p className={`text-[9px] font-semibold ${s.color} opacity-60`}>{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Connection quality */}
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

      {/* Main grid: 2 cột bằng nhau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cột trái: Device list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Thiết bị</h3>
          {loading ? (
            <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <div className="space-y-2">
              {devices.map((d) => {
                const isSelected = selectedId === d.id;
                const isLive = isSelected && isWsConnected;
                return (
                  <button key={d.id} onClick={() => setSelectedId(d.id)}
                    className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${isSelected ? 'border-[#00b494]/40 bg-gradient-to-r from-[#00b494]/5 to-[#12a1c0]/5 shadow-sm' : 'border-slate-100 bg-white hover:border-[#00b494]/20 hover:shadow-sm'
                      }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isLive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{d.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{d.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLive && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">LIVE</span>}
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Motion status + Live track */}
          {selectedId && (
            <div className="space-y-3 pt-1">
              <MotionStatusCard deviceId={selectedId} />
              <LiveTrackWidget deviceId={selectedId} />
            </div>
          )}
        </div>

        {/* Cột phải: Map + sensor + actions */}
        <div className="space-y-3">
          {selectedId ? (
            <>
              {/* Map — chiều cao lớn hơn */}
              <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
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
                <div className="h-[260px] w-full">
                  <MiniMap
                    deviceId={selectedId}
                    lat={liveData?.lat}
                    lng={liveData?.lng}
                  />
                </div>
              </div>

              {/* Live sensor strip — 2 cột rõ ràng */}
              {liveData && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-50/30 p-3.5 text-center">
                    <Navigation className="h-4 w-4 text-blue-500 mx-auto mb-1.5" />
                    <p className="text-2xl font-black text-blue-700">{liveData.speed.toFixed(0)}</p>
                    <p className="text-[9px] text-blue-500 font-bold mt-0.5">km/h · Tốc độ</p>
                  </div>
                  <div className={`rounded-xl border p-3.5 text-center ${liveData.isTilted ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-50/30 animate-pulse' : 'border-slate-100 bg-gradient-to-br from-slate-50 to-slate-50/30'}`}>
                    <Gauge className={`h-4 w-4 mx-auto mb-1.5 ${liveData.isTilted ? 'text-red-500' : 'text-slate-400'}`} />
                    <p className={`text-sm font-black ${liveData.isTilted ? 'text-red-600' : 'text-slate-600'}`}>
                      {liveData.isTilted ? '⚠ NGÃ!' : '✓ AN TOÀN'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">IMU Sensor</p>
                  </div>
                </div>
              )}

              {/* Recent alerts */}
              {wsAlerts.length > 0 && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-3.5 space-y-2">
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

              {/* Action buttons — full width */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onNavigate?.('monitor')}
                  className="rounded-xl bg-gradient-to-r from-[#12a1c0] to-[#00b494] py-3 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-[0.98] transition-all">
                  🗺 Mở bản đồ đầy đủ
                </button>
                <button onClick={() => onNavigate?.('alerts_history')}
                  className="rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all">
                  ⚠ Lịch sử cảnh báo
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] rounded-2xl border border-dashed border-slate-200 bg-white/50 text-center">
              <MapPin className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-500">Chọn thiết bị để xem bản đồ</p>
            </div>
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
