'use client';

import { MapPin, Activity, Cpu, ShieldAlert, User, Terminal, Layers } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="relative w-full min-h-[calc(100vh-120px)] pb-10">
      
      {/* Embedded CSS for staggered delays */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stagger-1 { animation-delay: 80ms; }
        .stagger-2 { animation-delay: 200ms; }
        .stagger-3 { animation-delay: 320ms; }
        .stagger-4 { animation-delay: 440ms; }
      ` }} />

      {/* Floating Blobs (adds extra subtle glowing depth in light theme) */}
      <div className="absolute top-[10%] left-[-5%] h-[280px] w-[280px] rounded-full bg-[#12a1c0]/5 blur-[75px] pointer-events-none z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-[#00b494]/5 blur-[90px] pointer-events-none z-10 animate-pulse duration-[8000ms]" />

      {/* Main Content (Aligned layout with z-20 on top of canvas and background) */}
      <div className="relative z-20 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl">
        
        {/* Header Section (Dark theme as requested) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-[#0e172a] to-slate-900 p-8 md:p-10 text-white shadow-xl border border-slate-800/40 transform hover:scale-[1.002] transition-all duration-500 ease-out">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b494]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00b494] border border-[#00b494]/30 shadow-[0_2px_10px_rgba(0,180,148,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00b494] animate-pulse" />
              Dự án nghiên cứu IoT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              MoniMove <span className="bg-gradient-to-r from-[#12a1c0] to-[#00b494] bg-clip-text text-transparent">App</span>
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-400 font-medium font-normal">
              Hệ thống IoT kết hợp ứng dụng Web giám sát hành trình toàn diện và phát hiện va chạm thời gian thực,
              được thiết kế nhằm tối ưu hóa sự an toàn cho phương tiện và người tham gia giao thông.
            </p>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: GPS */}
          <div className="group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-300/60 hover:shadow-[0_12px_24px_-10px_rgba(18,161,192,0.12)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-1">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 group-hover:bg-cyan-100 group-hover:shadow-[0_4px_12px_rgba(6,182,212,0.15)] transition-all duration-300">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-cyan-600 transition-colors">Giám sát GPS thời gian thực</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thu thập liên tục tọa độ kinh độ, vĩ độ của thiết bị và cập nhật trực tiếp lên bản đồ số với tần suất cao.
            </p>
          </div>

          {/* Card 2: Crash Detection */}
          <div className="group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-red-300/60 hover:shadow-[0_12px_24px_-10px_rgba(239,68,68,0.12)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-2">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 group-hover:scale-110 group-hover:bg-red-100 group-hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] transition-all duration-300">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-500 transition-colors">Phân tích gia tốc & va chạm</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sử dụng thuật toán phân tích sự thay đổi đột ngột của gia tốc (IMU) để nhận diện va chạm hoặc ngã xe.
            </p>
          </div>

          {/* Card 3: Instant Alerts */}
          <div className="group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-300/60 hover:shadow-[0_12px_24px_-10px_rgba(245,158,11,0.12)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-3">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 group-hover:bg-amber-100 group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.15)] transition-all duration-300">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-amber-500 transition-colors">Cảnh báo khẩn cấp tức thời</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tự động gửi cảnh báo khẩn cấp (Alerts) lên dashboard và lưu trữ lịch sử để kịp thời ứng cứu khi có sự cố.
            </p>
          </div>
        </div>

        {/* System Architecture */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-4">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-[#00b494]" />
            Kiến trúc hệ thống hoạt động
          </h3>
          
          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connector lines on larger screens */}
            <div className="hidden md:block absolute top-10 left-[26%] w-[18%] border-t-2 border-dashed border-slate-200" />
            <div className="hidden md:block absolute top-10 left-[58%] w-[18%] border-t-2 border-dashed border-slate-200" />

            {/* Step 1 */}
            <div className="group flex flex-col items-center text-center p-2 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 font-bold mb-3 shadow-sm border border-slate-200/40 group-hover:scale-110 group-hover:border-indigo-300 transition-all duration-300">
                <Cpu className="h-5.5 w-5.5 text-indigo-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">1. Thiết bị IoT (Hardware)</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Khối phần cứng cảm biến (MPU6050, GPS Neo-6M) thu thập toạ độ và gia tốc góc.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group flex flex-col items-center text-center p-2 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 font-bold mb-3 shadow-sm border border-slate-200/40 group-hover:scale-110 group-hover:border-emerald-300 transition-all duration-300">
                <Terminal className="h-5 w-5 text-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">2. Cloud API & Database</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Dữ liệu được gửi lên NestJS Backend qua HTTP/REST, rồi đồng bộ và lưu trữ tại Cloud Firestore.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group flex flex-col items-center text-center p-2 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 font-bold mb-3 shadow-sm border border-slate-200/40 group-hover:scale-110 group-hover:border-cyan-300 transition-all duration-300">
                <Layers className="h-5 w-5 text-cyan-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">3. Web Dashboard</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Frontend Next.js vẽ biểu đồ hành trình, cập nhật thời gian thực và tự động phát âm thanh cảnh báo.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Profile Section */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm max-w-2xl transform hover:shadow-md transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Thông tin thực hiện</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12a1c0] to-[#00b494] blur-sm opacity-25 group-hover:opacity-50 transition-opacity" />
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#12a1c0] to-[#00b494] text-white shadow-md border border-white/20">
                <User className="h-8 w-8" />
              </div>
            </div>
            
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">Nguyễn Trọng Thức</h4>
                <span className="inline-block rounded-full bg-[#12a1c0]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#12a1c0] border border-[#12a1c0]/20">
                  Software & IoT Developer
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium font-normal leading-relaxed">
                Chịu trách nhiệm thiết kế mô-đun phần cứng IoT, viết API xác thực bảo mật và lập trình ứng dụng bản đồ Web Dashboard.
              </p>
              <div className="pt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Đồ án nghiên cứu tốt nghiệp khoa học công nghệ
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
