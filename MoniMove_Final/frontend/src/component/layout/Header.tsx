'use client';

import { Menu, Wifi, WifiOff } from 'lucide-react';
import NotificationPanel from '../NotificationPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useOfflineSyncState } from '../../contexts/OfflineSyncContext';

interface HeaderProps {
  onOpenSidebar: () => void;
  title?: string;
}

export default function Header({ onOpenSidebar, title }: HeaderProps) {
  const { user } = useAuth();
  const { isOnline, isSyncing } = useOfflineSyncState();

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      {/* Hamburger */}
      <button
        onClick={onOpenSidebar}
        className="p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm text-slate-600 hover:text-[#00b494] hover:border-[#00b494]/30 transition-all active:scale-95"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title or Logo */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="hidden sm:flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] shadow-sm shrink-0">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-white" fillRule="evenodd" clipRule="evenodd">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        </div>
        {title ? (
          <h1 className="text-sm font-bold text-slate-700 truncate">{title}</h1>
        ) : (
          <span className="hidden sm:block text-sm font-extrabold text-slate-800 tracking-tight">MoniMove</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Network status */}
      <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${isOnline
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
        : 'bg-amber-50 text-amber-600 border-amber-200/50'
        }`}>
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isSyncing ? 'Đang đồng bộ...' : isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
      </div>

      {/* User info */}
      {user && (
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-3 py-1.5 shadow-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] text-white text-[10px] font-bold shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-slate-800 truncate max-w-[100px]">{user.name}</p>
            <p className={`text-[9px] font-bold uppercase ${user.role === 'admin' ? 'text-amber-500' : 'text-[#00b494]'}`}>
              {user.role === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationPanel />
    </div>
  );
}
