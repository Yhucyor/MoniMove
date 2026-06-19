"use client";

import { LayoutDashboard, Users, Cpu, Shield, Settings } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}: AdminSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "users", label: "Tài khoản", icon: Users },
    { id: "devices", label: "Thiết bị", icon: Cpu },
    { id: "settings", label: "Cấu hình", icon: Settings },
  ];

  return (
    <aside
      onMouseLeave={onClose}
      className={`fixed left-0 top-0 z-50 flex h-full w-48 flex-col border-r border-slate-200/50 bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5] pl-3 py-3 pr-0 shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden animated-gradient-bg ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-glow-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(12px, -12px) scale(1.1); }
        }
        @keyframes float-glow-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-12px, 12px) scale(1.05); }
        }
        .animated-gradient-bg {
          background-size: 240% 240%;
          animation: gradient-shift 14s ease infinite;
        }
        .admin-glow-1 { animation: float-glow-1 16s ease-in-out infinite; }
        .admin-glow-2 { animation: float-glow-2 20s ease-in-out infinite; }
        `,
        }}
      />

      {/* Decorative glow circles — same as user Sidebar */}
      <div className="absolute left-[-30%] top-[-10%] h-[150px] w-[150px] rounded-full bg-[#cceef0]/50 blur-[35px] pointer-events-none z-0 admin-glow-1" />
      <div className="absolute right-[-30%] bottom-[20%] h-[150px] w-[150px] rounded-full bg-[#f7e3ee]/60 blur-[35px] pointer-events-none z-0 admin-glow-2" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Logo */}
        <div
          className={`flex select-none items-center gap-2 px-1.5 py-1 pr-4 transition-all duration-500 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        >
          <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] shadow-sm">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-800">
              MoveMonitor
            </span>
            <p className="text-[8px] font-bold uppercase tracking-widest text-[#00b494]/80">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
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
                  transitionDelay: isOpen ? `${index * 60 + 100}ms` : "0ms",
                }}
                className={`group flex w-full items-center gap-2.5 py-2.5 text-xs font-semibold transition-all duration-500 transform relative ${
                  isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-[#12a1c0] to-[#00b494] text-white rounded-l-full pl-5 pr-3 z-10 shadow-sm shadow-[#00b494]/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-[#00b494]/10 rounded-lg px-3 mr-3"
                }`}
              >
                {/* Concave corners on active item */}
                {isActive && (
                  <>
                    <div className="absolute top-[-16px] right-0 w-4 h-4 pointer-events-none z-10">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 16V0C16 8.83656 8.83656 16 0 16H16Z"
                          fill="#00b494"
                        />
                      </svg>
                    </div>
                    <div className="absolute bottom-[-16px] right-0 w-4 h-4 pointer-events-none z-10">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 0V16C16 7.16344 8.83656 0 0 0H16Z"
                          fill="#00b494"
                        />
                      </svg>
                    </div>
                  </>
                )}
                <IconComponent
                  className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
