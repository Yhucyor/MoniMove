'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // Công cụ nạp component động dưới trình duyệt
import { 
  LayoutDashboard, 
  Cpu, 
  Settings, 
  Info, 
  LogOut, 
  User, 
  MapPin, 
  ShieldAlert, 
  Radio 
} from 'lucide-react';

// 1. Nhập linh kiện DeviceCard có sẵn của bạn
import DeviceCard from '../../src/features/dashboard/DeviceCard';

// 2. Nạp Bản đồ động và tắt cơ chế SSR để tránh lỗi sập trang Next.js
const MapComponent = dynamic(
  () => import('../../src/features/dashboard/MapComponent'),
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  
  // Quản lý trạng thái tab đang chọn (Mặc định ban đầu là 'monitor')
  const [activeTab, setActiveTab] = useState('monitor');

  // Danh sách các mục trên MenuBar bên trái
  const menuItems = [
    { id: 'monitor', label: 'Monitor', icon: LayoutDashboard },
    { id: 'list_devices', label: 'List Devices', icon: Cpu },
    { id: 'settings', label: 'Setting', icon: Settings },
    { id: 'about', label: 'About Us', icon: Info },
  ];

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* =========================================================================
          1. MENU BAR (SIDEBAR BÊN TRÁI)
          ========================================================================= */}
      <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 z-20 shadow-sm">
        
        {/* Khối Trên cùng: Logo Dự án */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-2 py-1 select-none">
            <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] rounded-[10px] flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-white fill-current" fillRule="evenodd" clipRule="evenodd">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              MoniMove
            </span>
          </div>

          {/* Danh sách các nút lựa chọn điều hướng */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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

        {/* Khối Dưới cùng: Thông tin tài khoản người đăng nhập & Đăng xuất */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          {/* Hộp hiển thị profile cá nhân */}
          <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 shadow-inner">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">Nguyễn Trọng Thức</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Administrator</span>
            </div>
          </div>

          {/* Nút Đăng xuất hệ thống */}
          <button 
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất hệ thống
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH (CONTENT AREA BÊN PHẢI)
          ========================================================================= */}
      <main className="flex-1 h-full overflow-y-auto p-8 md:p-10 relative">
        
        {/* TAB 1: MONITOR (Bao gồm hộp thông số IoT và Bản đồ thực tế Leaflet) */}
        {activeTab === 'monitor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Monitor</h2>
              <p className="text-sm text-slate-400 mt-1">Theo dõi vị trí hành trình và trạng thái vận hành thiết bị thời gian thực</p>
            </div>
            
            {/* Lưới hiển thị 3 hộp thông số nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><MapPin className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Tọa độ GPS</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">10.8494° N, 106.7725° E</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Radio className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Tần suất gửi tin</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">1000 ms / lần</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-green-500/30 bg-green-50/20 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Trạng thái an toàn</p>
                  <p className="text-lg font-black text-green-600 mt-0.5">Chưa phát hiện va chạm</p>
                </div>
              </div>
            </div>

            {/* KHU VỰC BẢN ĐỒ THẬT 100% */}
            <div className="w-full h-[480px] bg-white rounded-2xl shadow-sm relative border border-slate-200/40 overflow-hidden z-10">
              <MapComponent />
            </div>
          </div>
        )}

        {/* TAB 2: LIST DEVICES (Gọi component hiển thị danh sách thẻ thiết bị của bạn) */}
        {activeTab === 'list_devices' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">List Devices</h2>
              <p className="text-sm text-slate-400 mt-1">Quản lý và kích hoạt các module IoT phần cứng</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Gọi trực tiếp thiết bị có sẵn của bạn hiển thị ở đây */}
              <DeviceCard />
            </div>
          </div>
        )}

        {/* TAB 3: SETTING (Cấu hình ngưỡng kỹ thuật) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Setting</h2>
              <p className="text-sm text-slate-400 mt-1">Cấu hình các thông số kỹ thuật cho hệ thống cảnh báo khẩn cấp</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 max-w-xl shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Ngưỡng nhạy gia tốc va chạm (MPU6050)</label>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-[#00b494]" />
                <div className="flex justify-between text-xs text-slate-400 mt-1 font-semibold"><span>Thấp (An toàn)</span><span>Mặc định</span><span>Cao (Rất nhạy)</span></div>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Số điện thoại SOS cứu hộ khẩn cấp</label>
                <input type="text" placeholder="0901234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00b494]" />
              </div>
              <button onClick={() => alert('Đã lưu cấu hình giả lập!')} className="px-5 py-2.5 bg-gradient-to-r from-[#29cca2] to-[#54aafa] text-white font-bold rounded-xl text-xs shadow-sm hover:brightness-105 transition-all">
                Lưu cấu hình hệ thống
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT US (Thông tin dự án MoniMove) */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">About Us</h2>
              <p className="text-sm text-slate-400 mt-1">Thông tin về đồ án nghiên cứu khoa học hệ thống MoniMove</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 max-w-2xl shadow-sm space-y-4 leading-relaxed">
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">MoniMove</strong> là hệ thống IoT toàn diện kết hợp ứng dụng Web di động nhằm tối ưu hóa an toàn giao thông. Dự án tập trung phát triển bộ giải pháp phần cứng thu thập tọa độ GPS và phân tích hành vi va chạm xe thông qua các thuật toán xử lý dữ liệu gia tốc kế.
              </p>
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thành viên thực hiện</h4>
                <p className="text-sm font-semibold text-slate-800">• Nguyễn Trọng Thức - Bộ phận Kỹ thuật Phần mềm & IoT</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}