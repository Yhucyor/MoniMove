'use client';

import { useState, useEffect } from 'react';
import { getAlertsHistory, AlertLog } from '../../services/api';
import { AlertTriangle, Clock, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';

export default function AlertsHistoryTab() {
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      // Fetch alerts history for the default device
      const data = await getAlertsHistory('DEVICE_ESP32_01');
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
  }, []);

  // Format relative time elapsed
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Nhật ký sự cố & Cảnh báo
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium font-normal">
            Lịch sử lưu trữ toàn bộ các sự kiện nghiêng đổ xe hoặc va chạm nguy hiểm do hệ thống IoT phát hiện.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(true)}
          disabled={isRefreshing || loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        // Skeleton timeline loader
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white/70 shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-3 w-3/4 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
          <p className="text-xs font-semibold text-red-600">{error}</p>
          <button 
            onClick={() => fetchLogs()}
            className="mt-2 text-[10px] font-bold text-red-700 underline uppercase cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : logs.length === 0 ? (
        // Clean/Safe Empty State
        <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Mọi thứ đều an toàn!</h3>
          <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
            Chưa ghi nhận sự cố hay va chạm nguy hại nào từ phần cứng cảm biến.
          </p>
        </div>
      ) : (
        // Scrollable logs list
        <div className="relative border-l border-slate-200/60 ml-4.5 pl-6.5 space-y-5">
          {logs.map((log) => {
            const isTilt = log.alertType.includes('ngã') || log.alertType.includes('Ngã') || log.alertType.includes('Tilt');
            
            // Extract coordinates if present in the message
            // Example message: "Cảnh báo: Thiết bị bị ngã nghiêng..."
            // We can add a map lookup if the log timestamp gives us a route coordinates block
            return (
              <div 
                key={log.id} 
                className="group relative rounded-2xl border border-slate-200/50 bg-white/75 backdrop-blur-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300/40 transition-all duration-300"
              >
                {/* Bullet point on the timeline line */}
                <div className={`absolute -left-[32px] top-6 h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-sm transition-all duration-300 group-hover:scale-110 ${
                  isTilt ? 'bg-red-500 shadow-red-200' : 'bg-amber-500 shadow-amber-200'
                }`} />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Icon container */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      isTilt 
                        ? 'bg-red-50 border-red-100 text-red-500' 
                        : 'bg-amber-50 border-amber-100 text-amber-500'
                    }`}>
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-block rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${
                          isTilt 
                            ? 'bg-red-50 text-red-500 border-red-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {log.alertType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.deviceId}</span>
                      </div>
                      
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed pr-6">{log.message}</p>
                      
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold pt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                        <span>•</span>
                        <span>{getRelativeTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
