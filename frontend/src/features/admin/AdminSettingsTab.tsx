"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sliders,
  RefreshCw,
  Compass,
  Info,
  Mail,
  Save,
  RotateCcw,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Zap,
  Users,
  UserCircle,
  Shield,
  ChevronRight,
  Settings,
  X,
} from "lucide-react";
import {
  getAllUsers,
  getDeviceSettings,
  saveDeviceSettings,
  UserProfile,
  DeviceSettings,
} from "../../services/api";

/** Clamp + parse an integer — bảo vệ khi Firebase trả về null/undefined/NaN */
function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = parseInt(String(value), 10);
  if (isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Clamp + parse a float — dùng cho các slider có số lẻ như độ nhạy (step 0.5) */
function clampFloat(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = parseFloat(String(value));
  if (isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Giá trị mặc định — khớp với backend defaults()
const DEFAULTS: DeviceSettings = {
  sos_email: "",
  impactSensitivity: 3, // Cấp 3
  fallAngleThreshold: 45, // 45°
  speedThreshold: 80, // 80 km/h
};

type SaveStatus = "idle" | "saving" | "success" | "error";

// ── Per-device settings panel ──────────────────────────────────────────────
function DeviceSettingsPanel({
  deviceId,
  onSaved,
}: {
  deviceId: string;
  onSaved?: () => void;
}) {
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    setLoading(true);
    setHasUnsaved(false);
    setSaveStatus("idle");
    getDeviceSettings(deviceId)
      .then((data) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => setSettings(DEFAULTS))
      .finally(() => setLoading(false));
  }, [deviceId]);

  const update = <K extends keyof DeviceSettings>(
    key: K,
    value: DeviceSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsaved(true);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await saveDeviceSettings(deviceId, settings);
      setSaveStatus("success");
      setHasUnsaved(false);
      onSaved?.();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const handleReset = () => {
    if (!confirm("Khôi phục cài đặt mặc định cho thiết bị này?")) return;
    setSettings(DEFAULTS);
    setHasUnsaved(true);
    setSaveStatus("idle");
  };

  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Lấy giá trị thực tế từ state (đã clamp an toàn) ──────────────────
  // impactSensitivity: 1.0–5.0 (step 0.5), không convert, lưu thẳng vào Firebase
  const sensitivity = clampFloat(settings.impactSensitivity, 1, 5, 3);
  // fallAngleThreshold: 0–90, giá trị = góc độ thực tế
  const tiltAngle = clampInt(settings.fallAngleThreshold, 0, 90, 45);
  // speedThreshold: 0–200, giá trị = km/h thực tế
  const speed = clampInt(settings.speedThreshold, 0, 200, 80);

  return (
    <div className="space-y-5">
      {/* SOS Email */}
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
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white transition-all"
        />
        <p className="text-[11px] text-slate-400">
          Nhận email cảnh báo khẩn cấp kèm vị trí GPS.
        </p>
      </div>

      {/* ── Độ nhạy va chạm ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            Độ nhạy va chạm
          </label>
          {/* Badge: Cấp N (N.X) — N là giá trị nguyên, N.X là hiển thị trực quan */}
          <span className="rounded-lg bg-[#00b494]/10 px-2 py-0.5 text-[11px] font-bold text-[#00b494]">
            Cấp {Math.floor(sensitivity)} ({sensitivity.toFixed(1)})
          </span>
        </div>
        {/* Slider + tooltip thumb */}
        <div className="relative pt-6">
          {/* Tooltip nổi phía trên thumb
                        Công thức thumb offset chuẩn HTML range:
                        left = (val - min) / (max - min) * (track_width - thumb_width) + thumb_width/2
                        Với thumb_width ≈ 16px và track đầy đủ:
                        left% ≈ (val-1)/4 * 100%, điều chỉnh ±8px để bù thumb
                    */}
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 flex flex-col items-center"
            style={{
              left: `calc(${((sensitivity - 1) / 4) * 100}% - ${((sensitivity - 1) / 4 - 0.5) * 16}px)`,
            }}
          >
            <span className="rounded-md bg-[#00b494] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap">
              {sensitivity.toFixed(1)}
            </span>
            <span className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#00b494]" />
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={sensitivity}
            onChange={(e) =>
              update("impactSensitivity", clampFloat(e.target.value, 1, 5, 3))
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-[#00b494] cursor-pointer"
          />
        </div>
        {/* Mốc nhãn */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>Cấp 1 (Nhạy nhất)</span>
          <span>Cấp 3 (Trung bình)</span>
          <span>Cấp 5 (Ít nhạy nhất)</span>
        </div>
      </div>

      {/* ── Góc nghiêng báo ngã ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-purple-500" />
            Góc nghiêng báo ngã
          </label>
          {/* Badge: giá trị thực tế từ slider */}
          <span className="rounded-lg bg-purple-50 border border-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
            {tiltAngle}°
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="1"
          value={tiltAngle}
          onChange={(e) =>
            update("fallAngleThreshold", clampInt(e.target.value, 0, 90, 45))
          }
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-purple-600 cursor-pointer"
        />
        {/* Mốc nhãn: 0° | 45° | 90° */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>0°</span>
          <span>45°</span>
          <span>90°</span>
        </div>
      </div>

      {/* ── Tốc độ cảnh báo ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Tốc độ cảnh báo
          </label>
          {/* Badge: giá trị thực tế từ slider */}
          <span className="rounded-lg bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-600">
            {speed} km/h
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="1"
          value={speed}
          onChange={(e) =>
            update("speedThreshold", clampInt(e.target.value, 0, 200, 80))
          }
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none accent-amber-500 cursor-pointer"
        />
        {/* Mốc nhãn: 0 km/h | 100 km/h | 200 km/h */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>0 km/h</span>
          <span>100 km/h</span>
          <span>200 km/h</span>
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex gap-2.5 text-[11px] text-slate-600">
        <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
        <p>
          Cảnh báo kích hoạt khi va chạm đạt{" "}
          <strong className="text-[#00b494]">
            Cấp {Math.floor(sensitivity)} ({sensitivity.toFixed(1)})
          </strong>
          , nghiêng quá{" "}
          <strong className="text-purple-600">{tiltAngle}°</strong>, hoặc tốc độ
          trên <strong className="text-amber-600">{speed} km/h</strong>.
        </p>
      </div>

      {/* Status */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">
            Đã lưu và đồng bộ cho thiết bị
          </p>
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs font-semibold text-red-700">
            Lưu thất bại, thử lại
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Mặc định
        </button>
        <button
          onClick={handleSave}
          disabled={!hasUnsaved || saveStatus === "saving"}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-sm ${
            hasUnsaved && saveStatus !== "saving"
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {saveStatus === "saving" ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Lưu & đồng bộ
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main AdminSettingsTab ──────────────────────────────────────────────────
export default function AdminSettingsTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [savedDeviceId, setSavedDeviceId] = useState<string>("");

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const list = await getAllUsers();
      // Chỉ hiện users có thiết bị
      setUsers(
        list.filter((u) => u.deviceIds.length > 0 || u.role === "admin"),
      );
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSelectUser = (u: UserProfile) => {
    setSelectedUser(u);
    setSavedDeviceId("");
    setSelectedDeviceId(u.deviceIds[0] || "");
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSelectedDeviceId("");
    setSavedDeviceId("");
  };

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const initials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((w) => w[0])
          .slice(-2)
          .join("")
          .toUpperCase()
      : "U";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-in fade-in duration-300">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50">
              <Settings className="h-4 w-4 text-amber-600" />
            </div>
            Cấu hình thiết bị theo người dùng
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Chọn người dùng để chỉnh cài đặt thiết bị — thay đổi đồng bộ ngay
            cho user.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loadingUsers}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loadingUsers ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      <div className="flex gap-5 h-full">
        {/* ── Left: User list ── */}
        <div
          className={`flex flex-col gap-3 transition-all duration-300 ${selectedUser ? "w-80 shrink-0" : "flex-1"}`}
        >
          {/* Search */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm transition-all"
            />
          </div>

          {/* List */}
          {loadingUsers ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white text-center">
              <Users className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-500">
                Không tìm thấy người dùng
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => {
                const isSelected = selectedUser?.email === u.email;
                const hasDevices = u.deviceIds.length > 0;
                return (
                  <button
                    key={u.email}
                    onClick={() => handleSelectUser(u)}
                    disabled={!hasDevices}
                    className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-amber-300 bg-amber-50 shadow-sm"
                        : hasDevices
                          ? "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-sm"
                          : "border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                        u.role === "admin"
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                          : "bg-gradient-to-br from-purple-500 to-indigo-500 text-white"
                      }`}
                    >
                      {initials(u.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {u.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold border ${
                            u.role === "admin"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <Shield className="h-2 w-2" />
                          ) : (
                            <UserCircle className="h-2 w-2" />
                          )}
                          {u.role === "admin" ? "Admin" : "User"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {u.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Cpu className="h-2.5 w-2.5 text-slate-400" />
                        <span className="text-[10px] text-slate-400">
                          {hasDevices
                            ? `${u.deviceIds.length} thiết bị`
                            : "Chưa có thiết bị"}
                        </span>
                      </div>
                    </div>

                    {hasDevices && (
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "rotate-90 text-amber-500" : "text-slate-300"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Settings panel ── */}
        {selectedUser && (
          <div className="flex-1 animate-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                      selectedUser.role === "admin"
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                        : "bg-gradient-to-br from-purple-500 to-indigo-500 text-white"
                    }`}
                  >
                    {initials(selectedUser.name)}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {selectedUser.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Device selector (nếu user có nhiều thiết bị) */}
              {selectedUser.deviceIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Cpu className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-500">
                    Người dùng chưa có thiết bị
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Gán thiết bị ở tab Tài khoản
                  </p>
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  {/* Device picker */}
                  {selectedUser.deviceIds.length > 1 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Cpu className="h-3 w-3" /> Chọn thiết bị
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.deviceIds.map((id) => (
                          <button
                            key={id}
                            onClick={() => {
                              setSelectedDeviceId(id);
                              setSavedDeviceId("");
                            }}
                            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all ${
                              selectedDeviceId === id
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/30"
                            }`}
                          >
                            <Cpu className="h-3 w-3" />
                            {id}
                            {savedDeviceId === id && (
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single device label */}
                  {selectedUser.deviceIds.length === 1 && (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                      <Cpu className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        {selectedUser.deviceIds[0]}
                      </span>
                    </div>
                  )}

                  {/* Settings form */}
                  {selectedDeviceId && (
                    <DeviceSettingsPanel
                      key={selectedDeviceId}
                      deviceId={selectedDeviceId}
                      onSaved={() => setSavedDeviceId(selectedDeviceId)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state khi chưa chọn user */}
        {!selectedUser && !loadingUsers && filteredUsers.length > 0 && (
          <div className="hidden lg:flex flex-1 items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white/50">
            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">
                Chọn người dùng
              </p>
              <p className="text-xs text-slate-400 mt-1">
                để chỉnh cài đặt thiết bị
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
