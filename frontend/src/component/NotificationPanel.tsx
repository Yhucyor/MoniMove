'use client';

import { Bell, X, WifiOff, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useState } from 'react';

export default function NotificationPanel() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

  const iconFor = (type: string) => {
    switch (type) {
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm text-slate-600 hover:text-[#00b494] hover:border-[#00b494]/30 transition-all active:scale-95"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button onClick={markAllRead} className="text-[10px] font-semibold text-[#00b494] hover:underline">
                      Đọc hết
                    </button>
                    <button onClick={clearAll} className="text-[10px] font-semibold text-slate-400 hover:underline">
                      Xóa
                    </button>
                  </>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-slate-400">Chưa có thông báo</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-[#00b494]/5' : ''
                      }`}
                  >
                    <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {new Date(n.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
