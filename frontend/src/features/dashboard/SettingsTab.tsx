'use client';

import { useState, useEffect } from 'react';
import { Sliders, Phone, Bell, RefreshCw, Smartphone, Compass, Volume2, Info, Mail, User, Save, RotateCcw } from 'lucide-react';
import { writeDeviceSettings } from '../../services/firebaseRealtime';
import { useAuth } from '../../contexts/AuthContext';

// Map sensitivity level → G-force (phải khớp với alertProcessor)
const SENSITIVITY_MAP: Record<number, number> = { 1: 4.0, 2: 3.2, 3: 2.5, 4: 2.0, 5: 1.5 };

export default function SettingsTab() {
  const { user, isAdmin } = useAuth();
  const [sensitivity, setSensitivity] = useState(3);
  const [tiltThreshold, setTiltThreshold] = useState(45);
  const [sosPhone, setSosPhone] = useState('0901234567');
  const [sosEmail, setSosEmail] = useState('');
  const [enableSms, setEnableSms] = useState(false); // false mặc định — chưa tích hợp SMS
  const [enableAudio, setEnableAudio] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    const savedSensitivity = localStorage.getItem('settings_sensitivity');
    const savedTilt = localStorage.getItem('settings_tilt');
    const savedSos = localStorage.getItem('settings_sos');
    const savedSosEmail = localStorage.getItem('settings_sos_email');
    const savedSms = localStorage.getItem('settings_sms');
    const savedAudio = localStorage.getItem('settings_audio');
    if (savedSensitivity) setSensitivity(Number(savedSensitivity));
    if (savedTilt) setTiltThreshold(Number(savedTilt));
    if (savedSos) setSosPhone(savedSos);
    if (savedSosEmail) setSosEmail(savedSosEmail);
    if (savedSms) setEnableSms(savedSms === 'true');
    if (savedAudio) setEnableAudio(savedAudio !== 'false');
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('settings_sensitivity', sensitivity.toString());
      localStorage.setItem('settings_tilt', tiltThreshold.toString());
      localStorage.setItem('settings_sos', sosPhone);
      localStorage.setItem('settings_sos_email', sosEmail);
      localStorage.setItem('settings_sms', enableSms.toString());
      localStorage.setItem('settings_audio', enableAudio.toString());

      // Lấy danh sách thiết bị của admin từ context để cập nhật tất cả (nếu cần)
      // Ở đây tạm thời cập nhật thiết bị mặc định hoặc tất cả thiết bị của user
      const devicesToUpdate = user?.deviceIds?.length ? user.deviceIds : ['DEVICE_ESP32_01'];
      
      devicesToUpdate.forEach(deviceId => {
        writeDeviceSettings(deviceId, {
          sos_email: sosEmail,
          sos_phone: sosPhone,
          sensitivity,
          tilt_threshold: tiltThreshold
        }).catch(err => console.error(`Lỗi khi lưu thiết bị ${deviceId} lên Firebase:`, err));
      });

      window.dispatchEvent(new CustomEvent('monimove:settings:changed', {
        detail: { sensitivity, tiltThreshold, enableAudio, enableSms, sosPhone },
      }));

      setIsSaving(false);
      setHasUnsaved(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 400);
  };

  const handleReset = () => {
    if (!window.confirm('Bạn có muốn khôi phục cấu hình về mặc định cho toàn hệ thống?')) return;
    const defaults = { sensitivity: 3, tiltThreshold: 45, sosPhone: '0901234567', enableSms: false, enableAudio: true, sosEmail: '' };
    setSensitivity(defaults.sensitivity);
    setTiltThreshold(defaults.tiltThreshold);
    setSosPhone(defaults.sosPhone);
    setSosEmail(defaults.sosEmail);
    setEnableSms(defaults.enableSms);
    setEnableAudio(defaults.enableAudio);
    setHasUnsaved(true);
  };

  const markUnsaved = () => {
    setHasUnsaved(true);
  };

  // Common Card Class
  const cardClass = "rounded-[20px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-[2px] transition-transform duration-200 ease-out";

  return (
    <div className="mx-auto w-full max-w-[1600px] p-6 space-y-6 animate-in fade-in duration-300 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-[36px] font-bold tracking-tight text-slate-900 leading-tight">Cấu hình hệ thống</h2>
          <p className="mt-1 text-[15px] text-slate-500 font-medium">
            Điều chỉnh ngưỡng cảm biến IoT và kênh cảnh báo cho toàn bộ thiết bị.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" /> Mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsaved || isSaving}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-95 ${
              hasUnsaved && !isSaving
                ? 'bg-[#00b494] text-white hover:bg-[#009f82] hover:shadow-lg hover:shadow-[#00b494]/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>



      {hasUnsaved && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 shadow-sm animate-pulse">
          <Info className="h-5 w-5 shrink-0 text-blue-500" />
          <p className="text-[14px] font-semibold text-blue-700">
            Bạn có thay đổi chưa lưu. Hãy nhấn "Lưu thay đổi" để áp dụng cấu hình cho thiết bị.
          </p>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 rounded-[20px] bg-slate-900 px-6 py-4 text-[14px] font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00b494] text-slate-900 text-xs">✓</div>
          Đã lưu cấu hình. Hệ thống đã cập nhật.
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid gap-4 lg:grid-cols-5">
        
        {/* Left Column */}
        <div className="space-y-4 lg:col-span-3 flex flex-col">

          {/* User Account Info */}
          <div className={`${cardClass}`}>
            <h3 className="flex items-center gap-2 text-[20px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
              <User className="h-5 w-5 text-[#12a1c0]" />
              Tài khoản đang đăng nhập
            </h3>
            <div className="flex items-center gap-5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full border-2 border-[#00b494]/30 object-cover shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] flex items-center justify-center shadow-sm">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <p className="text-[15px] font-bold text-slate-900">{user?.name || 'Người dùng'}</p>
                <p className="text-[14px] text-slate-500 font-medium mt-1">{user?.email || '—'}</p>
                <span className={`inline-block mt-2 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                  isAdmin ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-[#00b494]/10 text-[#00b494] border border-[#00b494]/20'
                }`}>
                  {isAdmin ? 'Quản trị viên (Admin)' : 'Người dùng (User)'}
                </span>
              </div>
            </div>
          </div>

          {/* SOS Contact */}
          <div className={`${cardClass}`}>
            <h3 className="flex items-center gap-2 text-[20px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
              <Phone className="h-5 w-5 text-[#12a1c0]" />
              Liên hệ khẩn cấp SOS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[14px] font-bold text-slate-700">Số điện thoại cảnh báo</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input type="tel" value={sosPhone}
                    onChange={e => { setSosPhone(e.target.value); markUnsaved(); }}
                    placeholder="0901234567"
                    className="w-full rounded-xl border py-2.5 pl-11 pr-4 text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:border-[#00b494]" />
                </div>
                <p className="text-[13px] text-slate-500 mt-1">Sử dụng cho hệ thống SMS (đang phát triển).</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[14px] font-bold text-slate-700">Email người thân</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input type="email" value={sosEmail}
                    onChange={e => { setSosEmail(e.target.value); markUnsaved(); }}
                    placeholder="nguoithan@gmail.com"
                    className="w-full rounded-xl border py-2.5 pl-11 pr-4 text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:border-[#00b494]" />
                </div>
                <p className="text-[13px] text-slate-500 mt-1">Gửi email kèm bản đồ GPS khi có sự cố.</p>
              </div>
            </div>
          </div>

          {/* Sensor thresholds */}
          <div className={`${cardClass} flex-1`}>
            <h3 className="flex items-center gap-2 text-[20px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
              <Sliders className="h-5 w-5 text-[#00b494]" />
              Ngưỡng cảm biến MPU6050
            </h3>

            <div className="space-y-8">
              {/* Collision sensitivity */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[15px] font-bold text-slate-700">Ngưỡng gia tốc va chạm</label>
                  <span className="rounded-lg bg-[#00b494]/10 px-3 py-1 text-[13px] text-[#00b494] font-bold self-start sm:self-auto">
                    Cấp {sensitivity} — {SENSITIVITY_MAP[sensitivity]}G
                  </span>
                </div>
                <input type="range" min="1" max="5" value={sensitivity}
                  onChange={e => { setSensitivity(Number(e.target.value)); markUnsaved(); }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-[#00b494] transition-all cursor-pointer hover:bg-slate-300" />
                <div className="flex justify-between text-[13px] text-slate-500 font-medium px-1">
                  <span>1 — Nhạy (4.0G)</span>
                  <span>3 — Mặc định (2.5G)</span>
                  <span>5 — Mạnh (1.5G)</span>
                </div>
              </div>

              {/* Tilt threshold */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[15px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-purple-500" />
                    Góc nghiêng báo động ngã
                  </label>
                  <span className="rounded-lg bg-purple-50 px-3 py-1 text-[13px] text-purple-700 font-bold border border-purple-100 self-start sm:self-auto">
                    {tiltThreshold}°
                  </span>
                </div>
                <input type="range" min="30" max="90" step="5" value={tiltThreshold}
                  onChange={e => { setTiltThreshold(Number(e.target.value)); markUnsaved(); }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-purple-600 transition-all cursor-pointer hover:bg-slate-300" />
                <div className="flex justify-between text-[13px] text-slate-500 font-medium px-1">
                  <span>30° (Nhạy)</span>
                  <span>45° (Khuyên dùng)</span>
                  <span>90° (Nằm ngang)</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 flex gap-3 text-[14px] text-slate-600 border border-slate-100 shadow-sm">
                <Info className="h-5 w-5 shrink-0 text-slate-400" />
                <p>
                  Alert sẽ kích hoạt khi tổng gia tốc vượt qua ngưỡng <strong>{SENSITIVITY_MAP[sensitivity]}G</strong> hoặc khi độ nghiêng của xe lớn hơn <strong>{tiltThreshold}°</strong>.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-4 lg:col-span-2 flex flex-col">

          {/* Alert channels */}
          <div className={`${cardClass}`}>
            <h3 className="flex items-center gap-2 text-[20px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
              <Bell className="h-5 w-5 text-amber-500" />
              Kênh thông báo
            </h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500" /> Còi báo động Web
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">Phát âm thanh khi có cảnh báo.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={enableAudio}
                    onChange={e => { setEnableAudio(e.target.checked); markUnsaved(); }}
                    className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-5 peer-focus:outline-none" />
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" /> Tự động gửi SMS
                  </p>
                  <p className="text-[13px] text-amber-500 mt-1 font-semibold">⚠ Đang phát triển</p>
                </div>
                <label className="relative inline-flex items-center opacity-50 cursor-not-allowed">
                  <input type="checkbox" checked={enableSms} disabled
                    className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#00b494] peer-checked:after:translate-x-5 peer-focus:outline-none" />
                </label>
              </div>
            </div>
          </div>

          {/* Current thresholds summary */}
          <div className={`${cardClass} flex-1 bg-slate-50/50`}>
            <p className="text-[13px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Ngưỡng hiện tại
            </p>
            <div className="space-y-4 text-[15px] font-medium">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-slate-600">Va chạm</span>
                <span className="font-bold text-[#00b494] bg-[#00b494]/10 px-2 py-0.5 rounded-lg">&gt; {SENSITIVITY_MAP[sensitivity]}G</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-slate-600">Góc ngã</span>
                <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">&gt; {tiltThreshold}°</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-slate-600">Tốc độ cao</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">&gt; 80 km/h</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
