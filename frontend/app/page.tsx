'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LoginModal from '../src/features/auth/LoginModal';
import DeviceCard from '../src/features/dashboard/DeviceCard';

export default function Home() {
  // Quản lý trạng thái ẩn/hiện LoginModal
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    // 1. Khóa cứng khung hình cố định theo chiều cao màn hình (h-screen) và chặn cuộn hoàn toàn (overflow-hidden)
    <div className="h-screen w-screen relative overflow-hidden bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5] flex flex-col justify-between font-sans selection:bg-cyan-200">
      
      {/* HEADER - Hạ bớt padding dọc (py-4 md:py-5) để giải phóng không gian cho phần trung tâm */}
      <header className="w-full max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-5 flex justify-between items-center z-10">
        
        {/* Khối LOGO */}
        <div className="flex items-center gap-2.5 select-none cursor-pointer group">
          <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,180,148,0.1)] group-hover:shadow-[0_0_12px_rgba(0,180,148,0.4)] group-hover:scale-105 transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-white fill-current" fillRule="evenodd" clipRule="evenodd">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </div>
          <span className="text-[21px] font-extrabold tracking-tight text-[#0f172a] antialiased group-hover:text-cyan-600 transition-colors duration-300">
            MoniMove
          </span>
        </div>

        {/* Khối nút chức năng bên phải - Cập nhật link repo chuẩn của bạn */}
        <div className="flex items-center gap-4 md:gap-5">
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="text-sm font-medium text-slate-500 hover:text-cyan-600 hover:underline transition-all duration-300"
          >
            Đăng nhập
          </button>

          <a 
            href="https://github.com/Yhucyor/MoniMove" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-4 py-2 bg-[#f3f4f6] hover:bg-white text-xs md:text-sm font-semibold text-[#374151] hover:text-cyan-600 rounded-full border border-transparent hover:border-cyan-300/30 hover:shadow-[0_4px_12px_rgba(18,161,192,0.1)] active:scale-95 transition-all duration-300 tracking-wide block select-none"
          >
            About MoniMove  
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION - Dùng flex-1 kết hợp my-auto để khối này luôn tự động căn giữa tuyệt đối */}
      <main className="w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center flex-1 z-10 select-none transform -translate-y-2">
        
        {/* Tối ưu kích thước tiêu đề co giãn linh hoạt (text-[42px] lên tối đa [72px] ở màn hình lớn) */}
        <h1 className="text-[42px] sm:text-[54px] md:text-[64px] lg:text-[72px] font-black tracking-tight text-[#1a202c] leading-[1.12] mb-4 md:mb-5">
          Smart <span className="bg-gradient-to-r from-[#12a1c0] to-[#00b494] bg-clip-text text-transparent">MoniMove</span> ,
          <br />
          Effortless Move.
        </h1>

        {/* Thu gọn nhẹ size chữ mô tả và margin-bottom (mb-6 md:mb-8) */}
        <p className="text-sm md:text-base text-slate-500 max-w-2xl leading-relaxed mb-6 md:mb-8 font-normal px-4">
          MoniMove là người bạn đồng hành tối ưu ứng dụng công nghệ IoT. Chúng tôi tối ưu hóa lộ trình di chuyển của bạn, liên tục cập nhật vị trí và tự động kích hoạt cảnh báo cứu hộ khẩn cấp ngay khi phát hiện va chạm.
        </p>

        {/* Nút bấm hành trình */}
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="group px-7 py-3 bg-gradient-to-r from-[#29cca2] to-[#54aafa] text-white font-bold rounded-full text-sm md:text-[15px] tracking-wide shadow-[0_6px_16px_-4px_rgba(41,204,162,0.3)] hover:shadow-[0_10px_20px_-2px_rgba(84,170,250,0.4)] hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center gap-2"
        >
          Create your own itinerary
          <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </main>

      {/* 3. FOOTER - Tiết kiệm diện tích đáy, giữ chữ thanh thoát nhẹ nhàng */}
      <footer className="w-full text-center py-4 text-[11px] text-slate-400 font-medium z-10">
        © 2026 MoniMove App. Hỗ trợ giám sát hành trình toàn diện.
      </footer>

      {/* Gọi Component LoginModal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* BACKGROUND BLUR ORBS */}
      <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-[#cceef0]/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#f7e3ee]/50 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}