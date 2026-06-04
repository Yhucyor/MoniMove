'use client';

import { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../core/config/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Lấy ID Token từ Firebase để gửi lên Backend xác thực
      const idToken = await result.user.getIdToken();
      
      // Lưu token vào localStorage để sử dụng cho các API Request tiếp theo
      localStorage.setItem('firebase_token', idToken);
      
      // Chuyển hướng đến trang Dashboard thiết bị
      router.push('/DeviceCard');
      onClose();
    } catch (error: any) {
      console.error("Lỗi đăng nhập Google:", error);
      alert(`Đăng nhập bằng Google thất bại. Chi tiết lỗi: ${error.message || error}`);
    }
  };

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (username === 'admin' && password === 'admin') {
      // Lưu token mock để vượt qua router protection khi test local
      localStorage.setItem('firebase_token', 'mock-admin-token');
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
          className="pointer-events-auto relative w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-90"
            type="button"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          <div className="mb-5 text-center">
            <div className="mx-auto mb-2.5 flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#12a1c0] to-[#00b494]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-white" fillRule="evenodd" clipRule="evenodd">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-950">Chào mừng trở lại</h2>
            <p className="mt-0.5 text-xs text-slate-400">Đăng nhập để theo dõi thiết bị MoniMove</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Tài khoản</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Mật khẩu</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="admin"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-[11px] font-semibold">
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
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-[0_0_15px_rgba(41,204,162,0.3)] active:scale-[0.98]"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          {/* Dòng chữ HOẶC phân cách */}
          <div className="mt-4 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
            <span className="text-center text-[10px] text-slate-500 uppercase tracking-widest">Hoặc</span>
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          </div>

          {/* Nút Đăng nhập bằng Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Đăng nhập / Đăng ký bằng Google
          </button>

          <div className="mt-3.5 rounded-lg border border-blue-50 bg-blue-50/50 p-2.5">
            <p className="text-center text-[11px] text-blue-600">
              Demo: <strong>admin</strong> / <strong>admin</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
