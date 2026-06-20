"use client";

import { useState, useEffect } from "react";
import {
  X,
  Settings,
  Save,
  RefreshCw,
  Mail,
  Phone,
  Sliders,
  Compass,
  Zap,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  DeviceListItem,
  DeviceSettings,
  getDeviceSettings,
  saveDeviceSettings,
} from "../../services/api";

interface AdminDeviceSettingsModalProps {
  device: DeviceListItem;
  onClose: () => void;
}

const SENSITIVITY_MAP: Record<number, number> = {
  1: 4.0,
  2: 3.2,
  3: 2.5,
  4: 2.0,
  5: 1.5,
};

export default function AdminDeviceSettingsModal({
  device,
  onClose,
}: AdminDeviceSettingsModalProps) {
  const [settings, setSettings] = useState<DeviceSettings>({
    sos_email: "",
    sos_phone: "",
    fallAngleThreshold: 45,
    impactSensitivity: 2.5,
    speedThreshold: 80,
    enable_sms: false,
    enable_audio: true,
  });
  // UI-only state for sensitivity level (1-5)
  const [sensitivity, setSensitivity] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load settings on mount
  useEffect(() => {
    setLoading(true);
    getDeviceSettings(device.id)
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
        setHasUnsaved(false);
      })
      .catch(() => {
        // Use defaults on error
      })
      .finally(() => setLoading(false));
  }, [device.id]);

  const update = <K extends keyof DeviceSettings>(
    key: K,
    value: DeviceSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDeviceSettings(device.id, settings);
      setHasUnsaved(false);
      setToast({
        type: "success",
        message: `Đã lưu cài đặt cho ${device.name}`,
      });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ type: "error", message: "Lưu thất bại, vui lòng thử lại" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Khôi phục về cài đặt mặc định?")) return;
    setSettings({
      sos_email: "",
      sos_phone: "",
      fallAngleThreshold: 45,
      impactSensitivity: 2.5,
      speedThreshold: 80,
      enable_sms: false,
      enable_audio: true,
    });
    setSensitivity(3);
    setHasUnsaved(true);
  };

  const isOnline =
    device.status === "online" ||
    device.status === "active" ||
    device.connectionStatus === "online";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#12a1c0] to-[#00b494] flex items-center justify-center shrink-0 shadow-sm">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Cài đặt thiết bị
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 font-mono">
                  {device.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                    isOnline
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                  />
                  {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Unsaved warning */}
              {hasUnsaved && (
                <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
                  <Info className="h-4 w-4 text-blue-500 shrink-0" />
                  <p className="text-xs font-semibold text-blue-700">
                    Có thay đổi chưa lưu
                  </p>
                </div>
              )}

              {/* ── SOS Contact ── */}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Liên hệ khẩn cấp SOS
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email SOS
                  </label>
                  <input
                    type="email"
                    value={settings.sos_email || ""}
                    onChange={(e) => update("sos_email", e.target.value)}
                    placeholder="nguoithan@gmail.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 focus:border-[#00b494] bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    Nhận email khẩn cấp kèm vị trí GPS khi xảy ra sự cố nghiêm
                    trọng.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Số điện thoại SOS
                  </label>
                  <input
                    type="tel"
                    value={settings.sos_phone || ""}
                    onChange={(e) => update("sos_phone", e.target.value)}
                    placeholder="Nhập số điện thoại SOS"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 focus:border-[#00b494] bg-white transition-all"
                  />
                </div>
              </section>

              {/* ── Sensor Thresholds ── */}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-[#00b494]" />
                  Ngưỡng cảm biến MPU6050
                </h3>

                {/* Sensitivity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">
                      Độ nhạy va chạm
                    </label>
                    <span className="rounded-lg bg-[#00b494]/10 px-2.5 py-1 text-xs font-bold text-[#00b494]">
                      Cấp {sensitivity} —{" "}
                      {SENSITIVITY_MAP[sensitivity]}G
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={sensitivity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSensitivity(val);
                      update("impactSensitivity", SENSITIVITY_MAP[val]);
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-[#00b494] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>1 (4.0G)</span>
                    <span>3 (2.5G)</span>
                    <span>5 (1.5G)</span>
                  </div>
                </div>

                {/* Tilt threshold */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-purple-500" />
                      Góc nghiêng báo động ngã
                    </label>
                    <span className="rounded-lg bg-purple-50 border border-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                      {settings.fallAngleThreshold}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={settings.fallAngleThreshold}
                    onChange={(e) =>
                      update("fallAngleThreshold", Number(e.target.value))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>20° (Nhạy)</span>
                    <span>45° (Mặc định)</span>
                    <span>90°</span>
                  </div>
                </div>

                {/* Speed threshold */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      Tốc độ cảnh báo
                    </label>
                    <span className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-bold text-amber-600">
                      {settings.speedThreshold} km/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="10"
                    value={settings.speedThreshold}
                    onChange={(e) =>
                      update("speedThreshold", Number(e.target.value))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>30 km/h</span>
                    <span>80 km/h</span>
                    <span>200 km/h</span>
                  </div>
                </div>
              </section>

              {/* ── Alert Channels ── */}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 text-purple-500" />
                  Kênh thông báo
                </h3>

                {[
                  {
                    key: "enable_audio" as keyof DeviceSettings,
                    label: "Còi báo động Web",
                    desc: "Phát âm thanh trên giao diện khi có cảnh báo",
                    color: "purple",
                  },
                  {
                    key: "enable_sms" as keyof DeviceSettings,
                    label: "SMS khẩn cấp",
                    desc: "Gửi SMS đến số điện thoại SOS (yêu cầu tích hợp SMS gateway)",
                    color: "blue",
                    disabled: true,
                  },
                ].map((item) => (
                  <div
                    key={item.key as string}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                      {item.disabled && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 mt-1 inline-block">
                          Chưa hỗ trợ
                        </span>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={Boolean(settings[item.key])}
                        disabled={item.disabled}
                        onChange={(e) =>
                          update(item.key, e.target.checked as any)
                        }
                        className="peer sr-only"
                      />
                      <div
                        className={`peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5 peer-focus:outline-none peer-disabled:opacity-50 ${
                          item.color === "purple"
                            ? "peer-checked:bg-purple-500"
                            : "peer-checked:bg-blue-500"
                        }`}
                      />
                    </label>
                  </div>
                ))}
              </section>

              {/* Summary */}
              <section className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Ngưỡng hiện tại
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Va chạm",
                      value: `>${settings.impactSensitivity ?? 2.5}G`,
                      color: "text-[#00b494] bg-[#00b494]/10",
                    },
                    {
                      label: "Góc ngã",
                      value: `>${settings.fallAngleThreshold ?? 45}°`,
                      color: "text-purple-600 bg-purple-50",
                    },
                    {
                      label: "Tốc độ",
                      value: `>${settings.speedThreshold ?? 80}km/h`,
                      color: "text-amber-600 bg-amber-50",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-slate-100 bg-white p-2.5 text-center"
                    >
                      <p className="text-[10px] font-bold text-slate-400">
                        {s.label}
                      </p>
                      <span
                        className={`mt-1 inline-block text-xs font-black rounded-lg px-2 py-0.5 ${s.color}`}
                      >
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* ─── Footer actions ─── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {/* Toast inline */}
          {toast ? (
            <div
              className={`flex items-center gap-2 text-xs font-bold ${toast.type === "success" ? "text-emerald-700" : "text-red-700"}`}
            >
              {toast.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              {toast.message}
            </div>
          ) : (
            <button
              onClick={handleReset}
              disabled={loading || saving}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
            >
              Khôi phục mặc định
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving || !hasUnsaved}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
                hasUnsaved && !saving
                  ? "bg-[#00b494] text-white hover:bg-[#009f82] shadow-[#00b494]/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
