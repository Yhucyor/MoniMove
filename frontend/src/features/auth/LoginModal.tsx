'use client';

import { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (username === 'admin' && password === 'admin') {
      router.push('/DeviceCard');
      onClose();
      return;
    }

    alert('Tài khoản hoặc mật khẩu không đúng. Thử: admin/admin');
  };

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/50" onClick={onClose} />

      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="pointer-events-auto relative w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-90"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-gradient-to-br from-[#12a1c0] to-[#00b494]">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current text-white" fillRule="evenodd" clipRule="evenodd">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Chào mừng trở lại</h2>
            <p className="mt-1 text-sm text-slate-400">Đăng nhập để theo dõi thiết bị MoniMove</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Tài khoản</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs font-semibold">
              <label className="flex cursor-pointer items-center gap-1.5 text-slate-500">
                <input type="checkbox" className="rounded border-slate-300 text-[#00b494] focus:ring-[#00b494]" />
                Ghi nhớ
              </label>
              <button type="button" className="text-[#1f75fe] hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-[0_0_20px_rgba(41,204,162,0.4)] active:scale-[0.98]"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-center text-xs text-blue-600">
              Demo: <strong>admin</strong> / <strong>admin</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
