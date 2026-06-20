"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ref, get } from "firebase/database";
import { db } from "../../core/config/firebase";
import { getAlertsHistory, AlertLog } from "../../services/api";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  MapPin,
  Navigation,
  Route,
  Timer,
  CalendarDays,
  Search,
} from "lucide-react";
import { useMyDevices } from "../../hooks/useMyDevices";

const HistoryMapModal = dynamic(() => import("./HistoryMapModal"), {
  ssr: false,
});

interface AlertsHistoryTabProps {
  showAllDevices?: boolean;
}

interface GpsPoint {
  timestamp: number;
  lat: number;
  lng: number;
  speed?: number;
}

function haversineM(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371000;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AlertsHistoryTab({
  showAllDevices = false,
}: AlertsHistoryTabProps) {
  const [activeTab, setActiveTab] = useState<"alerts" | "history">("alerts");

  // ── Alerts ──────────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await getAlertsHistory();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError("Không thể kết nối với máy chủ để lấy nhật ký sự cố.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [showAllDevices]);

  // ── GPS History ──────────────────────────────────────────────────────────────
  const { primaryDeviceId } = useMyDevices();
  const deviceId = primaryDeviceId || "";

  // Default: hôm nay, 00:00 → 23:59
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const [historyPoints, setHistoryPoints] = useState<GpsPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null,
  );

  const fetchTodayHistory = async (showRefreshIndicator = false) => {
    if (!deviceId) {
      setHistoryPoints([]);
      setTotalDistance(0);
      return;
    }
    if (showRefreshIndicator) setIsRefreshingHistory(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setHasSearched(true);
    try {
      const historyRef = ref(db, `tracking_system/devices/${deviceId}/history`);
      const snapshot = await get(historyRef);
      const data = snapshot.val();

      if (!data) {
        setHistoryPoints([]);
        setTotalDistance(0);
        return;
      }

      // Tính khoảng thời gian từ selectedDate + startTime → endTime
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const baseDate = new Date(selectedDate);

      const rangeStart = new Date(baseDate);
      rangeStart.setHours(startH, startM, 0, 0);

      const rangeEnd = new Date(baseDate);
      rangeEnd.setHours(endH, endM, 59, 999);

      const rangeStartMs = rangeStart.getTime();
      const rangeEndMs = rangeEnd.getTime();

      const allLogs: GpsPoint[] = [];

      for (const date of Object.keys(data)) {
        const dateLogs = data[date];
        if (!dateLogs || typeof dateLogs !== "object") continue;

        // Kiểm tra cấu trúc mới (có tripId lồng bên trong)
        const firstVal = Object.values(dateLogs)[0];
        const isNewStructure = firstVal && typeof firstVal === "object" &&
          !("lat" in (firstVal as object)) && !("latitude" in (firstVal as object));

        if (isNewStructure) {
          // Cấu trúc mới: history/{date}/{tripId}/{timestamp}
          for (const tripData of Object.values(dateLogs) as Record<string, any>[]) {
            if (!tripData || typeof tripData !== "object") continue;
            for (const [tsKey, point] of Object.entries(tripData)) {
              if (!point) continue;
              let tsMs = Number(tsKey);
              if (isNaN(tsMs) || tsMs === 0) continue;
              if (tsKey.length <= 10) tsMs = tsMs * 1000;
              if (tsMs < rangeStartMs || tsMs > rangeEndMs) continue;
              const lat = (point as any).lat ?? (point as any).latitude;
              const lng = (point as any).lng ?? (point as any).longitude;
              if (typeof lat !== "number" || typeof lng !== "number") continue;
              if (lat === 0 && lng === 0) continue;
              allLogs.push({ timestamp: tsMs, lat, lng, speed: (point as any).speed ?? undefined });
            }
          }
        } else {
          // Cấu trúc cũ: history/{date}/{timestamp}
          for (const tsKey of Object.keys(dateLogs)) {
            const point = dateLogs[tsKey];
            if (!point) continue;
            let tsMs = Number(tsKey);
            if (isNaN(tsMs) || tsMs === 0) continue;
            if (tsKey.length <= 10) tsMs = tsMs * 1000;
            if (tsMs < rangeStartMs || tsMs > rangeEndMs) continue;
            const lat = point.lat ?? point.latitude;
            const lng = point.lng ?? point.longitude;
            if (typeof lat !== "number" || typeof lng !== "number") continue;
            if (lat === 0 && lng === 0) continue;
            allLogs.push({ timestamp: tsMs, lat, lng, speed: point.speed ?? undefined });
          }
        }
      }

      allLogs.sort((a, b) => a.timestamp - b.timestamp);

      let dist = 0;
      for (let i = 1; i < allLogs.length; i++)
        dist += haversineM(allLogs[i - 1], allLogs[i]);

      setHistoryPoints(allLogs);
      setTotalDistance(Math.round(dist));
    } catch (err) {
      console.error("Error fetching GPS history:", err);
      setHistoryError("Không thể tải lịch sử di chuyển.");
    } finally {
      setHistoryLoading(false);
      setIsRefreshingHistory(false);
    }
  };

  useEffect(() => {
    fetchTodayHistory();
  }, [deviceId]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}g ${m}ph`;
    return `${m} phút`;
  };

  const criticalCount = logs.filter(
    (l) =>
      (l.alertType ?? "").toLowerCase().includes("ngã") ||
      (l.alertType ?? "").toLowerCase().includes("tilt"),
  ).length;
  const warningCount = logs.length - criticalCount;

  const durationSec =
    historyPoints.length > 1
      ? Math.round(
          (historyPoints[historyPoints.length - 1].timestamp -
            historyPoints[0].timestamp) /
            1000,
        )
      : 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            Nhật ký Sự cố &amp; Di chuyển
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            {showAllDevices
              ? "Toàn bộ sự cố từ mọi thiết bị."
              : "Sự cố và lịch sử di chuyển trong ngày."}
          </p>
        </div>

        <button
          onClick={() =>
            activeTab === "alerts" ? fetchLogs(true) : fetchTodayHistory(true)
          }
          disabled={isRefreshing || loading || isRefreshingHistory}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing || isRefreshingHistory ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === "alerts"
              ? "bg-white text-red-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Sự cố
          {logs.length > 0 && (
            <span className="bg-red-100 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {logs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === "history"
              ? "bg-white text-[#00b494] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Route className="h-3.5 w-3.5" />
          Lịch sử di chuyển
          {historyPoints.length > 0 && (
            <span className="bg-[#00b494]/10 text-[#00b494] text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {historyPoints.length}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB: ALERTS ─────────────────────────────────────────────────────── */}
      {activeTab === "alerts" && (
        <>
          {!loading && logs.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Tổng sự cố
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {logs.length}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                    Ngã / Va chạm
                  </p>
                  <p className="text-xl font-black text-red-600">
                    {criticalCount}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                    Cảnh báo khác
                  </p>
                  <p className="text-xl font-black text-amber-600">
                    {warningCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse"
                >
                  <div className="h-10 w-10 bg-slate-200 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-slate-200 rounded-md" />
                    <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                onClick={() => fetchLogs()}
                className="mt-3 text-xs font-bold text-red-700 underline uppercase cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Mọi thứ đều an toàn!
              </h3>
              <p className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
                Chưa ghi nhận sự cố hay va chạm nguy hại nào từ phần cứng cảm
                biến.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
              <div className="space-y-3 pl-14">
                {logs.map((log) => {
                  const alertType = log.alertType ?? "";
                  const isCritical =
                    alertType.includes("ngã") ||
                    alertType.includes("Ngã") ||
                    alertType.includes("Tilt");
                  return (
                    <div
                      key={log.id}
                      className={`group relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${isCritical ? "border-red-100 hover:border-red-200" : "border-amber-100 hover:border-amber-200"}`}
                    >
                      <div
                        className={`absolute -left-[38px] top-5 h-4 w-4 rounded-full border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-125 ${isCritical ? "bg-red-500" : "bg-amber-500"}`}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isCritical ? "bg-red-50 border-red-100 text-red-500" : "bg-amber-50 border-amber-100 text-amber-500"}`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${isCritical ? "bg-red-50 text-red-600 border-red-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
                            >
                              {isCritical ? "🔴" : "🟡"} {alertType || "—"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                              {log.deviceId}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            {log.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-2">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {new Date(log.timestamp).toLocaleString("vi-VN")}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span
                              className={`font-bold ${isCritical ? "text-red-400" : "text-amber-400"}`}
                            >
                              {getRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: MOVEMENT HISTORY ────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <>
          {/* Bộ chọn thời gian */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Chọn khoảng thời gian
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 focus:border-[#00b494]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Từ
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 focus:border-[#00b494]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500">
                  Đến
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/30 focus:border-[#00b494]"
                />
              </div>
              <button
                onClick={() => fetchTodayHistory()}
                disabled={historyLoading}
                className="flex items-center gap-2 rounded-xl bg-[#00b494] hover:bg-[#009f82] disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 py-2 text-[13px] font-bold transition-all active:scale-95 shadow-sm"
              >
                {historyLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Xem lịch sử
              </button>
            </div>
          </div>

          {/* Summary stats */}
          {!historyLoading && historyPoints.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[#00b494]/20 bg-[#00b494]/5 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#00b494]/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-[#00b494]" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#00b494]/70">
                    Điểm GPS
                  </p>
                  <p className="text-xl font-black text-[#00b494]">
                    {historyPoints.length}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Navigation className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
                    Quãng đường
                  </p>
                  <p className="text-xl font-black text-blue-600">
                    {totalDistance >= 1000
                      ? `${(totalDistance / 1000).toFixed(1)} km`
                      : `${totalDistance} m`}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Timer className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-purple-400">
                    Thời gian
                  </p>
                  <p className="text-xl font-black text-purple-600">
                    {durationSec > 0 ? formatDuration(durationSec) : "—"}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Bắt đầu
                  </p>
                  <p className="text-sm font-black text-slate-700">
                    {historyPoints.length > 0
                      ? new Date(historyPoints[0].timestamp).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 rounded-2xl border border-slate-100 bg-white animate-pulse"
                >
                  <div className="h-8 w-8 bg-slate-200 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-48 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : historyError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-600">
                {historyError}
              </p>
              <button
                onClick={() => fetchTodayHistory()}
                className="mt-3 text-xs font-bold text-red-700 underline cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : historyPoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
              <div className="h-16 w-16 rounded-full bg-[#00b494]/10 flex items-center justify-center mb-4">
                <Route className="h-8 w-8 text-[#00b494]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Chưa có lịch sử di chuyển hôm nay
              </h3>
              <p className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
                Thiết bị chưa ghi nhận điểm GPS nào trong ngày hôm nay.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00b494]/40 via-[#00b494]/20 to-transparent" />
              <div className="space-y-2 pl-14 max-h-[520px] overflow-y-auto pr-1">
                {historyPoints.map((pt, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === historyPoints.length - 1;
                  return (
                    <div
                      key={`${pt.timestamp}-${idx}`}
                      onClick={() => setSelectedPointIndex(idx)}
                      className="group relative rounded-2xl border border-slate-100 bg-white px-5 py-3.5 shadow-sm hover:shadow-md hover:border-[#00b494]/30 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                    >
                      <div
                        className={`absolute -left-[38px] top-4 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${isFirst || isLast ? "bg-[#00b494] scale-125" : "bg-slate-300 group-hover:bg-[#00b494]/60"} transition-all`}
                      />

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isFirst ? "bg-[#00b494] text-white" : isLast ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-[#00b494]/10 group-hover:text-[#00b494]"} transition-colors`}
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-700 truncate">
                              {isFirst
                                ? "🟢 Xuất phát"
                                : isLast
                                  ? "🔵 Điểm cuối"
                                  : `Điểm ${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {pt.lat.toFixed(5)}°N, {pt.lng.toFixed(5)}°E
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {pt.speed !== undefined && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                              {pt.speed.toFixed(1)} km/h
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(pt.timestamp).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )}
                          </span>
                          <span className="text-[10px] text-[#00b494] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            <Navigation className="h-3 w-3" /> Xem
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Map modal khi click vào điểm GPS */}
      {selectedPointIndex !== null && historyPoints.length > 0 && (
        <HistoryMapModal
          points={historyPoints}
          focusIndex={selectedPointIndex}
          onClose={() => setSelectedPointIndex(null)}
        />
      )}
    </div>
  );
}
