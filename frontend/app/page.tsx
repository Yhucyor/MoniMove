'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LoginModal from '../src/features/auth/LoginModal';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between overflow-hidden bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5] font-sans selection:bg-cyan-200">
      <header className="z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8 md:py-5">
        <div className="group flex cursor-pointer select-none items-center gap-2.5">
          <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] shadow-[0_2px_8px_rgba(0,180,148,0.1)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(0,180,148,0.4)]">
            <svg viewBox="0 0 24 24" className="h-[16px] w-[16px] fill-current text-white" fillRule="evenodd" clipRule="evenodd">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </div>
          <span className="text-[21px] font-extrabold tracking-tight text-[#0f172a] antialiased transition-colors duration-300 group-hover:text-cyan-600">
            MoveMonitor
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="text-sm font-medium text-slate-500 transition-all duration-300 hover:text-cyan-600 hover:underline"
          >
            Đăng nhập
          </button>

          <a
            href="https://github.com/Yhucyor/MoniMove"
            target="_blank"
            rel="noopener noreferrer"
            className="block select-none rounded-full border border-transparent bg-[#f3f4f6] px-4 py-2 text-xs font-semibold tracking-wide text-[#374151] transition-all duration-300 hover:border-cyan-300/30 hover:bg-white hover:text-cyan-600 hover:shadow-[0_4px_12px_rgba(18,161,192,0.1)] active:scale-95 md:text-sm"
          >
            About MoveMonitor
          </a>
        </div>
      </header>

      <main className="z-10 mx-auto flex w-full max-w-4xl flex-1 -translate-y-2 select-none flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-[42px] font-black leading-[1.12] tracking-tight text-[#1a202c] sm:text-[54px] md:mb-5 md:text-[64px] lg:text-[72px]">
          Smart <span className="bg-gradient-to-r from-[#12a1c0] to-[#00b494] bg-clip-text text-transparent">MoveMonitor</span>,
          <br />
          Effortless Move.
        </h1>

        <p className="mb-6 max-w-2xl px-4 text-sm font-normal leading-relaxed text-slate-500 md:mb-8 md:text-base">
          MoveMonitor là người bạn đồng hành tối ưu cho ứng dụng IoT. Hệ thống theo dõi hành trình, cập nhật vị trí liên tục
          và hỗ trợ cảnh báo khẩn cấp khi phát hiện va chạm.
        </p>

        <button
          onClick={() => setIsLoginOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#29cca2] to-[#54aafa] px-7 py-3 text-sm font-bold tracking-wide text-white shadow-[0_6px_16px_-4px_rgba(41,204,162,0.3)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105 hover:shadow-[0_10px_20px_-2px_rgba(84,170,250,0.4)] active:scale-[0.99] md:text-[15px]"
        >
          Bắt đầu giám sát
          <ArrowRight className="h-4 w-4 stroke-[3] transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </main>

      <footer className="z-10 w-full py-4 text-center text-[11px] font-medium text-slate-400">
        © 2026 MoveMonitor App. Hỗ trợ giám sát hành trình toàn diện.
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <div className="pointer-events-none absolute left-[-10%] top-[-15%] h-[60vw] w-[60vw] rounded-full bg-[#cceef0]/40 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[50vw] w-[50vw] rounded-full bg-[#f7e3ee]/50 blur-[120px]" />
    </div>
  );
}
