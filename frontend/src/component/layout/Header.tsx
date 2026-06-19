'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Settings, LogOut, User, ChevronDown, Mail, Shield, Cpu } from 'lucide-react';
import NotificationPanel from '../NotificationPanel';
import { useAuth } from '../../contexts/AuthContext';
import { useOfflineSyncState } from '../../contexts/OfflineSyncContext';

interface HeaderProps {
  onOpenSidebar: () => void;
  onNavigate?: (tab: string) => void;
  title?: string;
}

export default function Header({ onOpenSidebar, onNavigate, title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isOnline, isSyncing } = useOfflineSyncState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettings = () => {
    setDropdownOpen(false);
    onNavigate?.('settings');
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : 'U';

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

      {/* Logo */}
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
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isSyncing ? 'Đang đồng bộ...' : isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
      </div>

      {/* Notifications */}
      <NotificationPanel />

      {/* User dropdown */}
      {user && (
        <div className="relative" ref={dropdownRef}>
          {/* Trigger button */}
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-2 sm:px-3 py-1.5 shadow-sm transition-all duration-200 active:scale-95 ${dropdownOpen
              ? 'border-[#00b494]/40 bg-[#00b494]/5 shadow-md'
              : 'border-slate-200/60 bg-white hover:border-[#00b494]/30 hover:shadow-md'
              }`}
            aria-label="Tài khoản"
          >
            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] text-white text-[10px] font-bold shrink-0 shadow-sm">
              {initials}
            </div>
            {/* Name + role */}
            <div className="leading-tight hidden sm:block text-left">
              <p className="text-[11px] font-bold text-slate-800 truncate max-w-[100px]">{user.name}</p>
              <p className={`text-[9px] font-bold uppercase ${user.role === 'admin' ? 'text-amber-500' : 'text-[#00b494]'}`}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

              {/* Profile header */}
              <div className="bg-gradient-to-br from-[#eef7f8] to-[#f4f3f8] px-4 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] blur-md opacity-30" />
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] text-white text-sm font-bold shadow-md">
                      {initials}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold border ${user.role === 'admin'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                      <Shield className="h-2.5 w-2.5" />
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div className="px-3 py-2 space-y-0.5">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500">
                  <Cpu className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{user.deviceIds?.length ?? 0} thiết bị được cấp phép</span>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-3 border-t border-slate-100" />

              {/* Actions */}
              <div className="px-3 py-2 space-y-0.5">
                {user.role !== 'admin' && (
                  <button
                    onClick={handleSettings}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 text-left group"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-[#00b494]/10 transition-colors">
                      <Settings className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#00b494]" />
                    </div>
                    Cài đặt tài khoản
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-150 text-left group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  Đăng xuất
                </button>
              </div>

              {/* Bottom padding */}
              <div className="pb-1" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
