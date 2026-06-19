'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, RefreshCw, Route } from 'lucide-react';
import { getPositionHistory, DevicePosition } from '../../services/api';
import { getCachedPositions, cachePositions } from '../../services/offlineStorage';
import { useMyDevices } from '../../hooks/useMyDevices';
import { useOfflineSyncState } from '../../contexts/OfflineSyncContext';

interface ActivityHistoryTabProps {
  initialDeviceId?: string;
}

export default function ActivityHistoryTab({ initialDeviceId }: ActivityHistoryTabProps) {
  const { devices, primaryDeviceId } = useMyDevices();
  const { isOnline, syncData } = useOfflineSyncState();
  const [deviceId, setDeviceId] = useState(initialDeviceId || primaryDeviceId || '');
  const [logs, setLogs] = useState<DevicePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (initialDeviceId) setDeviceId(initialDeviceId);
    else if (primaryDeviceId && !deviceId) setDeviceId(primaryDeviceId);
  }, [initialDeviceId, primaryDeviceId, deviceId]);

  const fetchHistory = async () => {
    if (!deviceId) return;
    setLoading(true);

    const now = Date.now();
    const ranges = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
    const start = now - ranges[range];
    const end = now;

    try {
      const data = await getPositionHistory(deviceId, start, end);
      if (data.length > 0) {
        await cachePositions(deviceId, data);
        setLogs(data);
        setFromCache(false);
      } else {
        throw new Error('empty');
      }
    } catch {
      const cached = await getCachedPositions(deviceId);
      const filtered = cached.filter((p) => p.timestamp >= start && p.timestamp <= end);
      setLogs(filtered);
      setFromCache(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, range]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Route className="h-6 w-6 text-[#00b494]" />
            Lịch sử hoạt động
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            Hành trình GPS theo thời gian · {fromCache ? 'Dữ liệu cache (offline)' : 'Dữ liệu server'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {devices.length > 1 && (
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as typeof range)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="24h">24 giờ</option>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
          </select>
          <button
            onClick={() => { syncData(); fetchHistory(); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-2.5 text-xs font-semibold text-amber-700">
          Đang offline — hiển thị lịch sử đã lưu cache. Sẽ đồng bộ khi có mạng.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white/50 text-center">
          <MapPin className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Không có dữ liệu hành trình trong khoảng thời gian này.</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200/60 ml-4 pl-6 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            {logs.length} điểm GPS · Tốc độ TB:{' '}
            {(logs.reduce((s, l) => s + (l.speed || 0), 0) / logs.length).toFixed(1)} km/h
            {logs.length > 1 && (() => {
              let dist = 0;
              for (let i = 1; i < logs.length; i++) {
                const p1 = logs[i - 1], p2 = logs[i];
                const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
                const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
                const a = Math.sin(dLat / 2) ** 2 + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
                dist += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              }
              return ` · ${dist.toFixed(2)} km`;
            })()}
          </p>
          {[...logs].reverse().slice(0, 50).map((log, idx) => (
            <div
              key={`${log.timestamp}-${idx}`}
              className="relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="absolute -left-[29px] top-5 h-3 w-3 rounded-full border-2 border-white bg-[#00b494] shadow-sm" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-800 font-mono">
                    {log.lat.toFixed(5)}, {log.lng.toFixed(5)}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {(log.speed || 0).toFixed(1)} km/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
