import { LayoutDashboard, Cpu, Settings, Info, LogOut, User, AlertTriangle, Activity, History, Shield, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const userName = user?.name || 'Người dùng';
  const userRole = user?.role === 'admin' ? 'Admin' : 'User';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'monitor', label: 'Giám sát', icon: LayoutDashboard },
    { id: 'list_devices', label: 'Thiết bị', icon: Cpu },
    { id: 'activity_history', label: 'Lịch sử', icon: History },
    { id: 'alerts_history', label: 'Sự cố', icon: AlertTriangle },
    { id: 'geofencing', label: 'Vùng an toàn', icon: Shield },
    { id: 'analytics', label: 'Phân tích', icon: BarChart2 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'about', label: 'Giới thiệu', icon: Info },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <aside
      onMouseLeave={onClose}
      onMouseMove={handleMouseMove}
      className={`fixed left-0 top-0 z-50 flex h-full w-48 flex-col justify-between border-r border-slate-200/50 bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5] pl-3 py-3 pr-0 shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden animated-gradient-bg ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-glow-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(12px, -12px) scale(1.1); }
        }
        @keyframes float-glow-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, 12px) scale(1.05); }
        }
        .animated-gradient-bg {
          background-size: 240% 240%;
          animation: gradient-shift 14s ease infinite;
        }
        .glow-float-1 {
          animation: float-glow-1 16s ease-in-out infinite;
        }
        .glow-float-2 {
          animation: float-glow-2 20s ease-in-out infinite;
        }
      ` }} />

      {/* Decorative Glow Circles to match the Login/Landing Page theme */}
      <div className="absolute left-[-30%] top-[-10%] h-[150px] w-[150px] rounded-full bg-[#cceef0]/50 blur-[35px] pointer-events-none z-0 glow-float-1" />
      <div className="absolute right-[-30%] bottom-[20%] h-[150px] w-[150px] rounded-full bg-[#f7e3ee]/60 blur-[35px] pointer-events-none z-0 glow-float-2" />

      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(110px circle at var(--mouse-x, -200px) var(--mouse-y, -200px), rgba(0, 180, 148, 0.12), rgba(18, 161, 192, 0.05), transparent 70%)`
        }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div
          className={`flex select-none items-center justify-start px-1.5 py-1 pr-4 transition-all duration-500 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] shadow-sm">
              <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] fill-current text-white" fillRule="evenodd" clipRule="evenodd">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-800">MoniMove</span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 pr-0">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                style={{
                  transitionDelay: isOpen ? `${index * 60 + 100}ms` : '0ms',
                }}
                className={`group flex w-full items-center gap-2.5 py-2.5 text-xs font-semibold transition-all duration-500 transform relative ${isOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none'
                  } ${isActive
                    ? 'bg-gradient-to-r from-[#12a1c0] to-[#00b494] text-white rounded-l-full pl-5 pr-3 z-10 shadow-sm shadow-[#00b494]/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-[#00b494]/10 rounded-lg px-3 mr-3'
                  }`}
              >
                {isActive && (
                  <>
                    {/* Precise inline SVGs for seamless concave rounded corners */}
                    <div className="absolute top-[-16px] right-0 w-4 h-4 pointer-events-none z-10">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 16V0C16 8.83656 8.83656 16 0 16H16Z" fill="#00b494" />
                      </svg>
                    </div>
                    <div className="absolute bottom-[-16px] right-0 w-4 h-4 pointer-events-none z-10">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 0V16C16 7.16344 8.83656 0 0 0H16Z" fill="#00b494" />
                      </svg>
                    </div>
                  </>
                )}
                <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        style={{
          transitionDelay: isOpen ? '340ms' : '0ms',
        }}
        className={`relative z-10 flex flex-col gap-2 border-t border-slate-200/80 pt-3 pr-3 transition-all duration-500 transform ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-2 py-1.5 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 shadow-inner border border-slate-200/40">
            <User className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] font-bold text-slate-800">{userName}</span>
            <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">{userRole}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-200/80 px-3 py-2 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
