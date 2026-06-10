'use client';

import { useState, useEffect } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../core/config/firebase';
import { verifyAuthToken } from '../../services/api';
import { checkBackendHealth } from '../../services/healthCheck';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  
  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState(''); // email or admin username
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI Helper States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Load saved credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = localStorage.getItem('saved_username');
      const savedPassword = localStorage.getItem('saved_password');
      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setErrorMsg('');
    setLoading(true);
    
    try {
      // Kiểm tra backend trước
      const backendHealth = await checkBackendHealth();
      if (!backendHealth.isBackendOnline) {
        throw new Error(backendHealth.error || 'Backend không phản hồi. Vui lòng khởi động backend trước.');
      }
      
      const result = await signInWithPopup(auth, provider);
      
      // Lấy ID Token từ Firebase để gửi lên Backend xác thực
      const idToken = await result.user.getIdToken();
      
      // Gửi token lên backend để lấy role và đăng ký user nếu là tài khoản mới
      const authResponse = await verifyAuthToken(idToken);
      
      if (authResponse.success && authResponse.user) {
        localStorage.setItem('firebase_token', idToken);
        localStorage.setItem('user_role', authResponse.user.role);
        localStorage.setItem('user_name', authResponse.user.name);
        localStorage.setItem('user_email', authResponse.user.email);
        localStorage.setItem('user_avatar', authResponse.user.avatar);
      } else {
        throw new Error('Xác thực với Backend thất bại.');
      }
      
      // Save Google email if "Remember Me" is checked
      if (rememberMe && result.user.email) {
        localStorage.setItem('saved_username', result.user.email);
        localStorage.setItem('login_method', 'google');
      }
      
      // Chuyển hướng đến trang Dashboard
      router.push('/HomePage');
      onClose();
    } catch (error: any) {
      console.error("Lỗi đăng nhập Google:", error);
      
      let userMessage = 'Đăng nhập bằng Google thất bại.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            userMessage = 'Cửa sổ đăng nhập đã bị đóng. Vui lòng thử lại.';
            break;
          case 'auth/popup-blocked':
            userMessage = 'Popup bị chặn bởi trình duyệt. Vui lòng cho phép popup và thử lại.';
            break;
          case 'auth/cancelled-popup-request':
            userMessage = 'Đã hủy đăng nhập.';
            break;
          case 'auth/invalid-continue-uri':
          case 'auth/unauthorized-continue-uri':
            userMessage = '⚠️ Cấu hình Firebase chưa đúng. Vui lòng thêm "localhost" vào Authorized domains trong Firebase Console (Authentication → Settings → Authorized domains).';
            break;
          case 'auth/network-request-failed':
            userMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
            break;
          default:
            userMessage = error.message || userMessage;
        }
      } else {
        userMessage = error.message || userMessage;
      }
      
      setErrorMsg(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Kiểm tra backend trước
      const backendHealth = await checkBackendHealth();
      if (!backendHealth.isBackendOnline) {
        throw new Error(backendHealth.error || 'Backend không phản hồi. Vui lòng khởi động backend trước.');
      }
      
      if (isRegister) {
        // --- REGISTER FLOW ---
        if (password.length < 6) {
          throw new Error('Mật khẩu phải chứa ít nhất 6 ký tự.');
        }
        if (password !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp.');
        }
        if (!displayName.trim()) {
          throw new Error('Vui lòng nhập họ và tên.');
        }

        // 1. Tạo tài khoản trong Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, username, password);
        
        // 2. Cập nhật Display Name trong Firebase profile
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });

        // 3. Lấy ID Token mới nhất
        const idToken = await userCredential.user.getIdToken(true);

        // 4. Gửi lên backend để tạo bản ghi user trong Firestore
        const authResponse = await verifyAuthToken(idToken);
        if (authResponse.success && authResponse.user) {
          localStorage.setItem('firebase_token', idToken);
          localStorage.setItem('user_role', authResponse.user.role);
          localStorage.setItem('user_name', authResponse.user.name);
          localStorage.setItem('user_email', authResponse.user.email);
          localStorage.setItem('user_avatar', authResponse.user.avatar);
        } else {
          throw new Error('Đăng ký tài khoản trên hệ thống dữ liệu thất bại.');
        }
        
        alert('Đăng ký tài khoản thành công!');
      } else {
        // --- LOGIN FLOW ---
        // 1. Đăng nhập bằng Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        
        // 2. Lấy ID Token
        const idToken = await userCredential.user.getIdToken();

        // 3. Gửi lên backend để xác thực và lấy role
        const authResponse = await verifyAuthToken(idToken);
        if (authResponse.success && authResponse.user) {
          localStorage.setItem('firebase_token', idToken);
          localStorage.setItem('user_role', authResponse.user.role);
          localStorage.setItem('user_name', authResponse.user.name);
          localStorage.setItem('user_email', authResponse.user.email);
          localStorage.setItem('user_avatar', authResponse.user.avatar);
        } else {
          throw new Error('Tài khoản chưa được xác thực trên hệ thống dữ liệu.');
        }

        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem('saved_username', username);
          localStorage.setItem('saved_password', password);
        } else {
          localStorage.removeItem('saved_username');
          localStorage.removeItem('saved_password');
        }
      }

      // Thành công -> Chuyển hướng
      router.push('/HomePage');
      onClose();
    } catch (error: any) {
      console.warn(isRegister ? 'Lỗi đăng ký:' : 'Lỗi đăng nhập:', error);
      
      // Xử lý các lỗi Firebase Auth cụ thể
      let userMessage = 'Có lỗi xảy ra, vui lòng thử lại.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            userMessage = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.';
            break;
          case 'auth/invalid-email':
            userMessage = 'Email không hợp lệ.';
            break;
          case 'auth/weak-password':
            userMessage = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.';
            break;
          case 'auth/user-not-found':
            userMessage = 'Không tìm thấy tài khoản. Vui lòng kiểm tra lại email.';
            break;
          case 'auth/wrong-password':
            userMessage = 'Mật khẩu không đúng.';
            break;
          case 'auth/invalid-credential':
            userMessage = 'Email hoặc mật khẩu không đúng.';
            break;
          case 'auth/invalid-continue-uri':
            userMessage = 'Lỗi cấu hình Firebase. Vui lòng kiểm tra domain được authorize trong Firebase Console.';
            break;
          case 'auth/unauthorized-continue-uri':
            userMessage = 'Domain chưa được authorize. Vui lòng thêm localhost vào Authorized domains trong Firebase Console.';
            break;
          case 'auth/too-many-requests':
            userMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau.';
            break;
          case 'auth/network-request-failed':
            userMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
            break;
          default:
            userMessage = error.message || userMessage;
        }
      } else {
        userMessage = error.message || userMessage;
      }
      
      setErrorMsg(userMessage);
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-xl font-bold text-slate-950">
              {isRegister ? 'Đăng ký tài khoản' : 'Chào mừng trở lại'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {isRegister ? 'Tạo tài khoản mới để bắt đầu giám sát' : 'Đăng nhập để theo dõi thiết bị MoniMove'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-2.5 text-center">
              <p className="text-[11px] font-semibold text-red-600 leading-tight">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Họ và tên</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {isRegister ? 'Địa chỉ Email' : 'Tài khoản hoặc Email'}
              </label>
              <div className="relative">
                {isRegister ? (
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                ) : (
                  <User className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                )}
                <input
                  type={isRegister ? 'email' : 'text'}
                  placeholder={isRegister ? 'email@example.com' : 'admin hoặc email'}
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
                  placeholder={isRegister ? 'Tối thiểu 6 ký tự' : '••••••'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-600">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs text-slate-800 transition-all focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between pt-0.5 text-[11px] font-semibold">
                <label className="flex cursor-pointer items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#00b494] focus:ring-[#00b494] cursor-pointer" 
                  />
                  Ghi nhớ
                </label>
                <button type="button" className="text-[#1f75fe] hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-[0_0_15px_rgba(41,204,162,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...') 
                : (isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập hệ thống')
              }
            </button>
          </form>

          <div className="mt-4 text-center text-xs font-semibold text-slate-500">
            {isRegister ? (
              <>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                  }}
                  className="text-[#1f75fe] hover:underline font-bold"
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              <>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                  }}
                  className="text-[#1f75fe] hover:underline font-bold"
                >
                  Đăng ký ngay
                </button>
              </>
            )}
          </div>

          {/* Dòng chữ HOẶC phân cách */}
          <div className="mt-4 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
            <span className="text-center text-[10px] text-slate-500 uppercase tracking-widest">Hoặc</span>
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          </div>

          {/* Nút Đăng nhập bằng Google */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Đăng nhập / Đăng ký bằng Google
          </button>
        </div>
      </div>
    </>
  );
}
