'use client';

import { useState, useEffect } from 'react';
import { getAlertsHistory, AlertLog } from '../../services/api';
import { AlertTriangle, Clock, RefreshCw, ShieldCheck, Zap, Activity } from 'lucide-react';

interface AlertsHistoryTabProps {
  showAllDevices?: boolean;
}

export default function AlertsHistoryTab({ showAllDevices = false }: AlertsHistoryTabProps) {
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await getAlertsHistory();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching alerts logs:', err);
      setError('Không thể kết nối với máy chủ để lấy nhật ký sự cố.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [showAllDevices]);

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const criticalCount = logs.filter(l => (l.alertType ?? '').toLowerCase().includes('ngã') || (l.alertType ?? '').toLowerCase().includes('tilt')).length;
  const warningCount = logs.length - criticalCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
            </div>
            Nhật ký Sự cố & Cảnh báo
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            {showAllDevices
              ? 'Toàn bộ sự cố từ mọi thiết bị trong hệ thống.'
              : 'Sự cố từ các thiết bị bạn được phép truy cập.'}
          </p>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={isRefreshing || loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Summary stats - chỉ hiện khi có data */}
      {!loading && logs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tổng sự cố</p>
              <p className="text-xl font-black text-slate-900">{logs.length}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">Ngã / Va chạm</p>
              <p className="text-xl font-black text-red-600">{criticalCount}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Cảnh báo khác</p>
              <p className="text-xl font-black text-amber-600">{warningCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 bg-slate-200 rounded-md" />
                <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
                <div className="h-3 w-1/3 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            onClick={() => fetchLogs()}
            className="mt-3 text-xs font-bold text-red-700 underline uppercase cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Mọi thứ đều an toàn!</h3>
          <p className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
            Chưa ghi nhận sự cố hay va chạm nguy hại nào từ phần cứng cảm biến.
          </p>
        </div>
      ) : (
        /* Timeline */
        <div className="relative">
          {/* Đường timeline */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

          <div className="space-y-3 pl-14">
            {logs.map((log, idx) => {
              const alertType = log.alertType ?? '';
              const isCritical = alertType.includes('ngã') || alertType.includes('Ngã') || alertType.includes('Tilt');

              return (
                <div
                  key={log.id}
                  className={`group relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${isCritical ? 'border-red-100 hover:border-red-200' : 'border-amber-100 hover:border-amber-200'}`}
                >
                  {/* Bullet trên đường timeline */}
                  <div className={`absolute -left-[38px] top-5 h-4 w-4 rounded-full border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-125 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />

                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isCritical
                      ? 'bg-red-50 border-red-100 text-red-500'
                      : 'bg-amber-50 border-amber-100 text-amber-500'
                      }`}>
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${isCritical
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {isCritical ? '🔴' : '🟡'} {alertType || '—'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                          {log.deviceId}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">{log.message}</p>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-2">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>{getRelativeTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
