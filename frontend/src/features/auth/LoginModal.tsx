'use client';

import { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../core/config/firebase';
import { verifyAuthToken } from '../../services/api';
import { checkBackendHealth } from '../../services/healthCheck';
import { getDashboardPath, useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function saveSession(authResponse: any, token: string) {
  localStorage.setItem('firebase_token', token);
  localStorage.setItem('user_role', authResponse.user.role);
  localStorage.setItem('user_name', authResponse.user.name);
  localStorage.setItem('user_email', authResponse.user.email);
  localStorage.setItem('user_avatar', authResponse.user.avatar || '');
  localStorage.setItem('user_device_ids', JSON.stringify(authResponse.user.deviceIds || []));
  document.cookie = `monimove_auth=1; path=/; max-age=${7 * 86400}; SameSite=Lax`;
  document.cookie = `monimove_role=${authResponse.user.role}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { syncSession } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset password flow
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Load saved username (NOT password — security)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedUsername = localStorage.getItem('saved_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  if (!isOpen) return null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function getFirebaseErrorMsg(code: string, fallback: string): string {
    const map: Record<string, string> = {
      'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng. Vui lòng thử lại.',
      'auth/popup-blocked': 'Popup bị chặn bởi trình duyệt. Vui lòng cho phép popup và thử lại.',
      'auth/cancelled-popup-request': 'Đã hủy đăng nhập.',
      'auth/invalid-continue-uri': '⚠️ Cấu hình Firebase chưa đúng. Thêm "localhost" vào Authorized domains.',
      'auth/unauthorized-continue-uri': '⚠️ Domain chưa được authorize trong Firebase Console.',
      'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.',
      'auth/email-already-in-use': 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.',
      'auth/invalid-email': 'Email không hợp lệ.',
      'auth/weak-password': 'Mật khẩu quá yếu. Hãy dùng mật khẩu mạnh hơn.',
      'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
      'auth/wrong-password': 'Mật khẩu không đúng.',
      'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
      'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
    };
    return map[code] ?? fallback;
  }

  // ── Google login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const backendHealth = await checkBackendHealth();
      if (!backendHealth.isBackendOnline) {
        throw new Error(backendHealth.error || 'Backend không phản hồi. Vui lòng khởi động backend trước.');
      }

      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const authResponse = await verifyAuthToken(idToken);

      if (!authResponse.success || !authResponse.user) {
        throw new Error('Xác thực với backend thất bại.');
      }

      // Lưu session — KHÔNG lưu password, Google không có password
      saveSession(authResponse, idToken);
      if (rememberMe) localStorage.setItem('saved_username', result.user.email || '');

      syncSession();
      onClose();
      router.push(getDashboardPath(authResponse.user.role));
    } catch (err: any) {
      setErrorMsg(err.code ? getFirebaseErrorMsg(err.code, err.message) : err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Email/Password ────────────────────────────────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const backendHealth = await checkBackendHealth();
      if (!backendHealth.isBackendOnline) {
        throw new Error(backendHealth.error || 'Backend không phản hồi. Vui lòng khởi động backend trước.');
      }

      let authResponse: Awaited<ReturnType<typeof verifyAuthToken>>;

      if (isRegister) {
        if (!displayName.trim()) throw new Error('Vui lòng nhập họ và tên.');
        if (password.length < 6) throw new Error('Mật khẩu phải chứa ít nhất 6 ký tự.');
        if (password !== confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');

        const cred = await createUserWithEmailAndPassword(auth, username, password);
        await updateProfile(cred.user, { displayName });
        const idToken = await cred.user.getIdToken(true);
        authResponse = await verifyAuthToken(idToken);

        if (!authResponse.success || !authResponse.user) {
          throw new Error('Đăng ký tài khoản trên hệ thống dữ liệu thất bại.');
        }
        setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
      } else {
        const cred = await signInWithEmailAndPassword(auth, username, password);
        const idToken = await cred.user.getIdToken();
        authResponse = await verifyAuthToken(idToken);

        if (!authResponse.success || !authResponse.user) {
          throw new Error('Tài khoản chưa được xác thực trên hệ thống.');
        }
      }

      const finalToken = await auth.currentUser!.getIdToken();
      saveSession(authResponse, finalToken);

      // Ghi nhớ: chỉ lưu email, KHÔNG lưu password
      if (rememberMe) {
        localStorage.setItem('saved_username', username);
      } else {
        localStorage.removeItem('saved_username');
      }

      syncSession();
      onClose();
      router.push(getDashboardPath(authResponse.user.role));
    } catch (err: any) {
      setErrorMsg(err.code ? getFirebaseErrorMsg(err.code, err.message) : err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(err.code ? getFirebaseErrorMsg(err.code, err.message) : err.message);
      setShowReset(false);
    } finally {
      setResetLoading(false);
    }
  };

  // ── Render: Reset password screen ────────────────────────────────────────
  if (showReset) {
    return (
      <>
        <div className="fixed inset-0 z-[9998] bg-black/50" onClick={() => { setShowReset(false); setResetSent(false); }} />
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="pointer-events-auto relative w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setShowReset(false); setResetSent(false); }}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Đặt lại mật khẩu</h2>
              <p className="mt-1 text-xs text-slate-400">Nhập email để nhận liên kết đặt lại mật khẩu</p>
            </div>

            {resetSent ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-800 text-center">
                  Đã gửi email đặt lại mật khẩu tới <strong>{resetEmail}</strong>
                </p>
                <p className="text-xs text-slate-500 text-center">Vui lòng kiểm tra hộp thư (kể cả spam).</p>
                <button onClick={() => { setShowReset(false); setResetSent(false); }}
                  className="mt-2 rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] px-6 py-2 text-xs font-bold text-white">
                  Quay lại đăng nhập
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input type="email" required placeholder="email@example.com"
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20" />
                </div>
                {errorMsg && <p className="text-[11px] font-semibold text-red-600 text-center">{errorMsg}</p>}
                <button type="submit" disabled={resetLoading}
                  className="w-full rounded-xl bg-blue-500 py-2.5 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-50">
                  {resetLoading ? 'Đang gửi...' : 'Gửi email đặt lại'}
                </button>
                <button type="button" onClick={() => setShowReset(false)}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600">
                  ← Quay lại đăng nhập
                </button>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Render: Main login/register ───────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/50" onClick={onClose} />
      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="pointer-events-auto relative w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}>

          <button onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90">
            <X className="h-4 w-4" />
          </button>

          {/* Logo + title */}
          <div className="mb-5 text-center">
            <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#12a1c0] to-[#00b494]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-white" fillRule="evenodd" clipRule="evenodd">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-950">
              {isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {isRegister ? 'Đăng ký để bắt đầu giám sát thiết bị' : 'Đăng nhập vào hệ thống MoniMove'}
            </p>
          </div>

          {/* Error / success */}
          {errorMsg && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-2.5 text-center">
              <p className="text-[11px] font-semibold text-red-600 leading-tight">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-center">
              <p className="text-[11px] font-semibold text-emerald-600">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {/* Display name (register only) */}
            {isRegister && (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Họ và tên</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Nguyễn Văn A" value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs font-semibold text-slate-800 focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {isRegister ? 'Email' : 'Email hoặc tài khoản'}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input type={isRegister ? 'email' : 'text'}
                  placeholder={isRegister ? 'email@example.com' : 'Nhập email của bạn...'}
                  value={username} onChange={(e) => setUsername(e.target.value)} required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs font-semibold text-slate-800 focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Mật khẩu</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'}
                  placeholder={isRegister ? 'Tối thiểu 6 ký tự' : '••••••••'}
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-10 text-xs font-semibold text-slate-800 focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (register only) */}
            {isRegister && (
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input type="password" placeholder="Nhập lại mật khẩu"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3.5 text-xs font-semibold text-slate-800 focus:border-[#00b494] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20" />
                </div>
              </div>
            )}

            {/* Remember me + forgot password (login only) */}
            {!isRegister && (
              <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                <label className="flex cursor-pointer items-center gap-1.5 text-slate-500 hover:text-slate-700">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#00b494] focus:ring-[#00b494] cursor-pointer" />
                  Ghi nhớ email
                </label>
                <button type="button" onClick={() => { setShowReset(true); setResetEmail(username); setErrorMsg(''); }}
                  className="text-[#1f75fe] hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 hover:shadow-[0_0_15px_rgba(41,204,162,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading
                ? (isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...')
                : (isRegister ? 'Tạo tài khoản' : 'Đăng nhập')}
            </button>
          </form>

          {/* Toggle register/login */}
          <p className="mt-4 text-center text-xs font-semibold text-slate-500">
            {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-[#1f75fe] font-bold hover:underline">
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </p>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hoặc</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Google */}
          <button type="button" disabled={loading} onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50 transition-all">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isRegister ? 'Đăng ký bằng Google' : 'Đăng nhập bằng Google'}
          </button>
        </div>
      </div>
    </>
  );
}
