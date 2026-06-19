'use client';

import {
  LayoutDashboard,
  Users,
  Cpu,
  AlertTriangle,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AdminSidebar({ isOpen, onClose, activeTab, onTabChange }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Tài khoản', icon: Users },
    { id: 'devices', label: 'Thiết bị', icon: Cpu },
    { id: 'monitor', label: 'Giám sát', icon: Shield },
    { id: 'alerts', label: 'Sự cố', icon: AlertTriangle },
  ];

  return (
    <aside
      onMouseLeave={onClose}
      className={`fixed left-0 top-0 z-50 flex h-full w-52 flex-col justify-between border-r border-slate-200/50 bg-gradient-to-tr from-[#1e293b] via-[#1a2332] to-[#0f172a] pl-3 py-3 pr-0 shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="relative z-10 flex flex-col gap-6">
        <div className={`flex items-center gap-2 px-1.5 py-1 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white">MoniMove</span>
            <p className="text-[8px] font-bold uppercase tracking-widest text-amber-400/80">Admin Panel</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center gap-2.5 py-2.5 text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-l-full pl-5 pr-3 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 rounded-lg px-3 mr-3'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`relative z-10 flex flex-col gap-2 border-t border-white/10 pt-3 pr-3 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-400">
            <User className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] font-bold text-white">{user?.name || 'Admin'}</span>
            <span className="text-[8px] font-semibold uppercase tracking-wider text-amber-400">Administrator</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
