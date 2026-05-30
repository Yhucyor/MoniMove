import { useRouter } from 'next/navigation';
import { LayoutDashboard, Cpu, Settings, Info, LogOut, User, X } from 'lucide-react';

// Khai báo type cho props
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: 'monitor', label: 'Monitor', icon: LayoutDashboard },
    { id: 'list_devices', label: 'List Devices', icon: Cpu },
    { id: 'settings', label: 'Setting', icon: Settings },
    { id: 'about', label: 'About Us', icon: Info },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] rounded-[10px] flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-white fill-current" fillRule="evenodd" clipRule="evenodd">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              MoniMove
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#12a1c0]/10 to-[#00b494]/10 text-[#00b494] border-l-4 border-[#00b494]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#00b494]' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">Nguyễn Trọng Thức</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Administrator</span>
          </div>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150 active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất hệ thống
        </button>
      </div>
    </aside>
  );
}