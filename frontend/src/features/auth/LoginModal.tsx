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

  // Tạo các trạng thái lưu dữ liệu người dùng gõ
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  // Hàm xử lý kiểm tra đăng nhập bằng tay
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin') {
      console.log("🎉 Đăng nhập giả lập thành công!");
      router.push('/DeviceCard'); // Chuyển hướng sang trang danh sách thiết bị
      onClose(); // Đóng modal lại
    } else {
      alert('Tài khoản hoặc mật khẩu admin chưa chính xác rồi bạn ơi!');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-[28px] shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <div className="w-[34px] h-[34px] bg-gradient-to-br from-[#12a1c0] to-[#00b494] rounded-[11px] flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white fill-current" fillRule="evenodd" clipRule="evenodd">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-950">Chào mừng trở lại</h2>
          <p className="text-sm text-slate-400 mt-1">Đăng nhập để theo dõi thiết bị MoniMove</p>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tài khoản</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Nhập tài khoản admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00b494] focus:bg-white focus:ring-2 focus:ring-[#00b494]/20 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00b494] focus:bg-white focus:ring-2 focus:ring-[#00b494]/20 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold pt-1">
            <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-[#00b494] focus:ring-[#00b494]" /> Ghi nhớ
            </label>
            <a href="#" className="text-[#1f75fe] hover:underline">Quên mật khẩu?</a>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 bg-gradient-to-r from-[#29cca2] to-[#54aafa] text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-[0_0_20px_rgba(41,204,162,0.4)] hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Đăng nhập hệ thống
          </button>
        </form>
      </div>
    </div>
  );
}