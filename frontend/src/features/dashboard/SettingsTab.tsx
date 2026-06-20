<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  RefreshCw,
  Compass,
  Info,
  Mail,
  User,
  Save,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  getDeviceSettings,
  saveDeviceSettings,
  DeviceSettings,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const SENSITIVITY_MAP: Record<number, number> = {
  1: 4.0,
  2: 3.2,
  3: 2.5,
  4: 2.0,
  5: 1.5,
};

const DEFAULTS: DeviceSettings = {
  sos_email: "",
  tilt_threshold: 45,
  accel_threshold: 2.5,
  speed_threshold: 80,
  sensitivity: 3,
};

export default function SettingsTab() {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // ── Admin: full settings save ──────────────────────────────────────────
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [toastAll, setToastAll] = useState(false);

  // ── User: chỉ lưu email SOS ────────────────────────────────────────────
  const [sosEmailInput, setSosEmailInput] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSaveStatus, setEmailSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const deviceId = user?.deviceIds?.[0] || "";

  // Load settings
  useEffect(() => {
    if (!deviceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDeviceSettings(deviceId)
      .then((data) => {
        const merged = { ...DEFAULTS, ...data };
        setSettings(merged);
        setSosEmailInput(merged.sos_email || "");
      })
      .catch(() => {
        setSettings(DEFAULTS);
        setSosEmailInput("");
      })
      .finally(() => {
        setLoading(false);
        setHasUnsaved(false);
      });
  }, [deviceId]);

  // ── Admin: update ngưỡng ──────────────────────────────────────────────
  const updateSetting = <K extends keyof DeviceSettings>(
    key: K,
    value: DeviceSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsaved(true);
  };

  const handleSaveAll = async () => {
    if (!deviceId) return;
    setIsSavingAll(true);
    try {
      const devices = user?.deviceIds?.length ? user.deviceIds : [deviceId];
      await Promise.all(
        devices.map((id) =>
          saveDeviceSettings(id, { ...settings, sos_email: sosEmailInput }),
        ),
      );
      window.dispatchEvent(
        new CustomEvent("monimove:settings:changed", {
          detail: {
            sensitivity: settings.sensitivity,
            tiltThreshold: settings.tilt_threshold,
          },
        }),
      );
      setHasUnsaved(false);
      setToastAll(true);
      setTimeout(() => setToastAll(false), 3000);
    } catch {
      alert("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setIsSavingAll(false);
    }
  };

  // ── User: chỉ lưu email SOS ───────────────────────────────────────────
  const handleSaveEmail = async () => {
    if (!deviceId || !sosEmailInput.trim()) return;
    if (!sosEmailInput.includes("@")) {
      setEmailSaveStatus("error");
      setTimeout(() => setEmailSaveStatus("idle"), 3000);
      return;
    }
    setIsSavingEmail(true);
    try {
      // Giữ nguyên settings hiện tại, chỉ update sos_email
      const devices = user?.deviceIds?.length ? user.deviceIds : [deviceId];
      await Promise.all(
        devices.map((id) =>
          saveDeviceSettings(id, {
            ...settings,
            sos_email: sosEmailInput.trim(),
          }),
        ),
      );
      setSettings((prev) => ({ ...prev, sos_email: sosEmailInput.trim() }));
      setEmailSaveStatus("success");
      setTimeout(() => setEmailSaveStatus("idle"), 3000);
    } catch {
      setEmailSaveStatus("error");
      setTimeout(() => setEmailSaveStatus("idle"), 3000);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const cardClass =
    "rounded-[20px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100/60";

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6 space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-[30px] font-bold tracking-tight text-slate-900 leading-tight">
            Cài đặt thiết bị
          </h2>
          <p className="mt-1 text-[14px] text-slate-500 font-medium">
            {isAdmin
              ? "Chỉnh ngưỡng cảm biến và email SOS."
              : "Cập nhật email SOS khẩn cấp của bạn."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleSaveAll}
            disabled={!hasUnsaved || isSavingAll}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all active:scale-95 ${
              hasUnsaved && !isSavingAll
                ? "bg-[#00b494] text-white hover:bg-[#009f82]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {isSavingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSavingAll ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        )}
      </div>

      {/* ── Unsaved banner (admin) ── */}
      {isAdmin && hasUnsaved && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3">
          <Info className="h-5 w-5 shrink-0 text-blue-500" />
          <p className="text-[13px] font-semibold text-blue-700">
            Có thay đổi chưa lưu — nhấn "Lưu thay đổi" để áp dụng.
          </p>
        </div>
      )}

      {/* ── Toast admin ── */}
      {toastAll && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-5 w-5 text-[#00b494]" />
          Đã lưu cấu hình thành công.
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-[20px] bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* ── Left column ── */}
          <div className="space-y-4 lg:col-span-3 flex flex-col">
            {/* Account info */}
            <div className={cardClass}>
              <h3 className="flex items-center gap-2 text-[18px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                <User className="h-5 w-5 text-[#12a1c0]" />
                Tài khoản đang đăng nhập
              </h3>
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-14 h-14 rounded-full border-2 border-[#00b494]/30 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] flex items-center justify-center shadow-sm">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-[15px] font-bold text-slate-900">
                    {user?.name || "—"}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    {user?.email || "—"}
                  </p>
                  <span
                    className={`inline-block mt-2 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                      isAdmin
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-[#00b494]/10 text-[#00b494] border border-[#00b494]/20"
                    }`}
                  >
                    {isAdmin ? "Quản trị viên (Admin)" : "Người dùng (User)"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Email SOS — user và admin đều chỉnh được ── */}
            <div className={cardClass}>
              <h3 className="flex items-center gap-2 text-[18px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                <Mail className="h-5 w-5 text-[#12a1c0]" />
                Email SOS khẩn cấp
              </h3>
              <div className="space-y-3">
                <label className="block text-[13px] font-bold text-slate-700">
                  Email người thân
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={sosEmailInput}
                    onChange={(e) => {
                      setSosEmailInput(e.target.value);
                      setEmailSaveStatus("idle");
                    }}
                    placeholder="nguoithan@gmail.com"
                    className="w-full rounded-xl border py-2.5 pl-11 pr-4 text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:border-[#00b494]"
                  />
                </div>
                <p className="text-[12px] text-slate-400">
                  Gửi email kèm bản đồ GPS khi xảy ra sự cố khẩn cấp.
                </p>

                {/* Save email button — mọi user đều dùng được */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSaveEmail}
                    disabled={
                      isSavingEmail ||
                      !sosEmailInput.trim() ||
                      sosEmailInput === settings.sos_email
                    }
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all active:scale-95 shadow-sm ${
                      isSavingEmail ||
                      !sosEmailInput.trim() ||
                      sosEmailInput === settings.sos_email
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#00b494] text-white hover:bg-[#009f82] hover:shadow-md"
                    }`}
                  >
                    {isSavingEmail ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang
                        lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" /> Lưu email
                      </>
                    )}
                  </button>

                  {/* Inline status */}
                  {emailSaveStatus === "success" && (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 animate-in fade-in duration-200">
                      <CheckCircle className="h-4 w-4" /> Đã lưu thành công!
                    </span>
                  )}
                  {emailSaveStatus === "error" && (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 animate-in fade-in duration-200">
                      <AlertTriangle className="h-4 w-4" /> Email không hợp lệ
                      hoặc lỗi kết nối.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Sensor thresholds — chỉ admin ── */}
            <div className={`${cardClass} flex-1`}>
              <h3 className="flex items-center gap-2 text-[18px] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                <Sliders className="h-5 w-5 text-[#00b494]" />
                Ngưỡng cảm biến MPU6050
                {!isAdmin && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Chỉ đọc
                  </span>
                )}
              </h3>

              <div className="space-y-7">
                {/* Sensitivity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[14px] font-bold text-slate-700">
                      Ngưỡng gia tốc va chạm
                    </label>
                    <span className="rounded-lg bg-[#00b494]/10 px-3 py-1 text-[12px] text-[#00b494] font-bold">
                      Cấp {settings.sensitivity ?? 3} —{" "}
                      {SENSITIVITY_MAP[settings.sensitivity ?? 3]}G
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={settings.sensitivity ?? 3}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSettings((prev) => ({
                        ...prev,
                        sensitivity: val,
                        accel_threshold: SENSITIVITY_MAP[val],
                      }));
                      setHasUnsaved(true);
                    }}
                    disabled={!isAdmin}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-[#00b494] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-[12px] text-slate-500 font-medium px-1">
                    <span>1 — Nhạy (4.0G)</span>
                    <span>3 — Mặc định (2.5G)</span>
                    <span>5 — Mạnh (1.5G)</span>
                  </div>
                </div>

                {/* Tilt */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Compass className="h-4 w-4 text-purple-500" />
                      Góc nghiêng báo động ngã
                    </label>
                    <span className="rounded-lg bg-purple-50 px-3 py-1 text-[12px] text-purple-700 font-bold border border-purple-100">
                      {settings.tilt_threshold ?? 45}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={settings.tilt_threshold ?? 45}
                    onChange={(e) =>
                      updateSetting("tilt_threshold", Number(e.target.value))
                    }
                    disabled={!isAdmin}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-[12px] text-slate-500 font-medium px-1">
                    <span>20° (Nhạy)</span>
                    <span>45° (Khuyên dùng)</span>
                    <span>90°</span>
                  </div>
                </div>

                {/* Speed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Tốc độ cảnh báo
                    </label>
                    <span className="rounded-lg bg-amber-50 px-3 py-1 text-[12px] text-amber-600 font-bold border border-amber-100">
                      {settings.speed_threshold ?? 80} km/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="10"
                    value={settings.speed_threshold ?? 80}
                    onChange={(e) =>
                      updateSetting("speed_threshold", Number(e.target.value))
                    }
                    disabled={!isAdmin}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-[12px] text-slate-500 font-medium px-1">
                    <span>30 km/h</span>
                    <span>80 km/h</span>
                    <span>200 km/h</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex gap-3 text-[13px] text-slate-600 border border-slate-100">
                  <Info className="h-5 w-5 shrink-0 text-slate-400" />
                  <p>
                    Cảnh báo khi gia tốc vượt{" "}
                    <strong>
                      {SENSITIVITY_MAP[settings.sensitivity ?? 3]}G
                    </strong>
                    , nghiêng quá{" "}
                    <strong>{settings.tilt_threshold ?? 45}°</strong>, hoặc tốc
                    độ trên{" "}
                    <strong>{settings.speed_threshold ?? 80} km/h</strong>.
                  </p>
                </div>
=======
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
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* ── Right column — summary ── */}
          <div className="space-y-4 lg:col-span-2 flex flex-col">
            <div className={`${cardClass} flex-1`}>
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Ngưỡng hiện tại
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Va chạm",
                    value: `> ${SENSITIVITY_MAP[settings.sensitivity ?? 3]}G`,
                    cls: "text-[#00b494] bg-[#00b494]/10",
                  },
                  {
                    label: "Góc ngã",
                    value: `> ${settings.tilt_threshold ?? 45}°`,
                    cls: "text-purple-600 bg-purple-50",
                  },
                  {
                    label: "Tốc độ cao",
                    value: `> ${settings.speed_threshold ?? 80} km/h`,
                    cls: "text-amber-600 bg-amber-50",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
                  >
                    <span className="text-[13px] text-slate-600 font-medium">
                      {s.label}
                    </span>
                    <span
                      className={`font-bold text-[12px] ${s.cls} px-2 py-0.5 rounded-lg`}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* SOS email preview */}
              {(settings.sos_email || sosEmailInput) && (
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    SOS đã cấu hình
                  </p>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-[12px] font-semibold text-slate-600 truncate">
                      {sosEmailInput || settings.sos_email}
                    </span>
                  </div>
                </div>
              )}

              {!deviceId && (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-[12px] text-amber-700 font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-500" />
                  Bạn chưa được cấp thiết bị nào.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
=======
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
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    </div>
  );
}
