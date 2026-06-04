'use client';

import { useState, useEffect } from 'react';
import { Sliders, Phone, Bell, Volume2, ShieldAlert, Save, RefreshCw, Smartphone, Compass } from 'lucide-react';

export default function SettingsTab() {
  const [sensitivity, setSensitivity] = useState(3);
  const [tiltThreshold, setTiltThreshold] = useState(45);
  const [sosPhone, setSosPhone] = useState('0901234567');
  const [enableSms, setEnableSms] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const savedSensitivity = localStorage.getItem('settings_sensitivity');
    const savedTilt = localStorage.getItem('settings_tilt');
    const savedSos = localStorage.getItem('settings_sos');
    const savedSms = localStorage.getItem('settings_sms');
    const savedAudio = localStorage.getItem('settings_audio');

    if (savedSensitivity) setSensitivity(Number(savedSensitivity));
    if (savedTilt) setTiltThreshold(Number(savedTilt));
    if (savedSos) setSosPhone(savedSos);
    if (savedSms) setEnableSms(savedSms === 'true');
    if (savedAudio) setEnableAudio(savedAudio === 'true');
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API write latency
    setTimeout(() => {
      localStorage.setItem('settings_sensitivity', sensitivity.toString());
      localStorage.setItem('settings_tilt', tiltThreshold.toString());
      localStorage.setItem('settings_sos', sosPhone);
      localStorage.setItem('settings_sms', enableSms.toString());
      localStorage.setItem('settings_audio', enableAudio.toString());
      
      setIsSaving(false);
      setShowToast(true);
      
      // Auto-hide toast notification
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có muốn khôi phục cài đặt mặc định của nhà sản xuất?')) {
      setSensitivity(3);
      setTiltThreshold(45);
      setSosPhone('0901234567');
      setEnableSms(true);
      setEnableAudio(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative max-w-3xl">
      
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Cấu hình hệ thống</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium font-normal">
            Điều chỉnh ngưỡng nhạy cảm biến phần cứng IoT và quản lý danh sách kênh cảnh báo khẩn cấp.
          </p>
        </div>
      </div>

      {/* Floating Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 rounded-2xl bg-slate-950 px-4.5 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950">✓</div>
          <span>Đã cập nhật cấu hình hệ thống thành công!</span>
        </div>
      )}

      {/* Main Settings Panel */}
      <div className="grid gap-6 md:grid-cols-5">
        
        {/* Left Side: Main Settings */}
        <div className="space-y-5 md:col-span-3">
          
          {/* Card 1: Sensor Thresholds */}
          <div className="rounded-[24px] border border-slate-200/50 bg-white/80 p-6 shadow-sm space-y-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              <Sliders className="h-4.5 w-4.5 text-[#00b494]" />
              Cấu hình Ngưỡng Cảm Biến (MPU6050)
            </h3>
            
            {/* Range 1: Collision Sensitivity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="text-slate-700">Ngưỡng nhạy gia tốc va chạm</label>
                <span className="text-[#00b494] bg-[#00b494]/10 px-2 py-0.5 rounded-lg text-[10px]">
                  Cấp {sensitivity} - {(sensitivity * 1.2).toFixed(1)}G Force
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00b494]" 
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Rất nhạy (Dễ kích hoạt)</span>
                <span>Mặc định</span>
                <span>Chỉ va chạm mạnh</span>
              </div>
            </div>

            {/* Range 2: Tilt Threshold */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="text-slate-700">Góc nghiêng giới hạn báo động ngã</label>
                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-0.5">
                  <Compass className="h-3 w-3" />
                  {tiltThreshold}° Góc nghiêng
                </span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="90" 
                step="5"
                value={tiltThreshold}
                onChange={(e) => setTiltThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" 
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>30° (Dễ ngã)</span>
                <span>45° (Khuyên dùng)</span>
                <span>90° (Nằm ngang)</span>
              </div>
            </div>
          </div>

          {/* Card 2: SOS Phone Contacts */}
          <div className="rounded-[24px] border border-slate-200/50 bg-white/80 p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              <Phone className="h-4.5 w-4.5 text-[#12a1c0]" />
              Liên Hệ Khẩn Cấp (SMS/Call SOS)
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">Số điện thoại người thân nhận cảnh báo</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input 
                  type="text" 
                  value={sosPhone}
                  onChange={(e) => setSosPhone(e.target.value)}
                  placeholder="0901234567" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-800 transition-all focus:border-[#12a1c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#12a1c0]/20" 
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Số điện thoại này sẽ tự động nhận được tin nhắn SMS bản đồ chỉ đường cứu hộ khẩn cấp ngay khi phát hiện xe bị tai nạn hoặc ngã đổ.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Channels & Actions */}
        <div className="space-y-5 md:col-span-2">
          
          {/* Card 3: Alert Channels */}
          <div className="rounded-[24px] border border-slate-200/50 bg-white/80 p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              <Bell className="h-4.5 w-4.5 text-amber-500" />
              Kênh Thông Báo Cảnh Báo
            </h3>
            
            <div className="space-y-4 pt-1">
              {/* Toggle 1: SMS Twilio */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <p className="text-xs font-bold text-slate-700">Tự động gửi SMS</p>
                  <p className="text-[9px] text-slate-400 font-medium">Gửi tin nhắn tọa độ tới số liên lạc SOS</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    checked={enableSms}
                    onChange={(e) => setEnableSms(e.target.checked)}
                    className="peer sr-only" 
                  />
                  <div className="peer h-5.5 w-10 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4.5 after:w-4.5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#00b494] peer-checked:after:translate-x-4.5 peer-focus:outline-none" />
                </label>
              </div>

              {/* Toggle 2: Audio siren */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="space-y-0.5 pr-2">
                  <p className="text-xs font-bold text-slate-700">Còi báo động Web</p>
                  <p className="text-[9px] text-slate-400 font-medium">Hú còi cảnh báo trên trình duyệt máy tính</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    checked={enableAudio}
                    onChange={(e) => setEnableAudio(e.target.checked)}
                    className="peer sr-only" 
                  />
                  <div className="peer h-5.5 w-10 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4.5 after:w-4.5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-4.5 peer-focus:outline-none" />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] py-3 text-xs font-bold text-white shadow-md hover:brightness-105 hover:shadow-[0_4px_12px_rgba(41,204,162,0.2)] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Hệ Thống'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 hover:bg-slate-50 py-3 text-xs font-bold text-slate-500 active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Khôi Phục Mặc Định
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
