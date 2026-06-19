"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart2,
  Download,
  RefreshCw,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useMyDevices } from "../../hooks/useMyDevices";
import { getPositionHistory, getAlertsHistory } from "../../services/api";
import { getCachedPositions } from "../../services/offlineStorage";
import {
  buildReport,
  exportReportCsv,
  exportReportJson,
  type ReportRange,
} from "../../services/reportExport";
import { filterGpsTrack } from "../../services/gpsFilter";
import type { ActivityReport } from "../../services/reportExport";

const COLORS = ["#00b494", "#12a1c0", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsTab() {
  const { devices, primaryDeviceId } = useMyDevices();
  const [deviceId, setDeviceId] = useState(primaryDeviceId || "");
  const [range, setRange] = useState<ReportRange>("week");
  const [report, setReport] = useState<ActivityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [useKalman, setUseKalman] = useState(true);

  useEffect(() => {
    if (primaryDeviceId && !deviceId) setDeviceId(primaryDeviceId);
  }, [primaryDeviceId, deviceId]);

  const loadReport = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const rangeMs: Record<ReportRange, number> = {
        day: 86400000,
        week: 604800000,
        month: 2592000000,
      };
      const now = Date.now();
      const from = now - rangeMs[range];

      const [rawPositions, alerts] = await Promise.all([
        getPositionHistory(deviceId, from, now).catch(async () => {
          const cached = await getCachedPositions(deviceId);
          return cached.filter((p) => p.timestamp >= from);
        }),
        getAlertsHistory().catch(() => []),
      ]);

      const positions = useKalman ? filterGpsTrack(rawPositions) : rawPositions;

      setReport(buildReport(deviceId, range, positions, alerts));
    } finally {
      setLoading(false);
    }
  }, [deviceId, range, useKalman]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Build chart data
  const speedData =
    report?.positions
      .filter(
        (_, i) =>
          i % Math.max(1, Math.floor((report?.positions.length ?? 1) / 50)) ===
          0,
      )
      .map((p, i) => ({
        t: new Date(p.timestamp).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        speed: parseFloat((p.speed ?? 0).toFixed(1)),
        idx: i,
      })) ?? [];

  const alertPieData = Object.entries(report?.alertsByType ?? {}).map(
    ([name, value]) => ({ name, value }),
  );

  // Group by day for bar chart
  const dayMap: Record<string, { distance: number; count: number }> = {};
  report?.positions.forEach((p) => {
    const day = new Date(p.timestamp).toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!dayMap[day]) dayMap[day] = { distance: 0, count: 0 };
    dayMap[day].count++;
  });
  const dailyData = Object.entries(dayMap)
    .slice(-14)
    .map(([day, d]) => ({ day, points: d.count }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[#00b494]" />
            Phân tích & Báo cáo
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Thống kê hoạt động, biểu đồ và xuất báo cáo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {devices.length > 1 && (
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as ReportRange)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="day">Hôm nay</option>
            <option value="week">7 ngày</option>
            <option value="month">30 ngày</option>
          </select>
          <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useKalman}
              onChange={(e) => setUseKalman(e.target.checked)}
              className="rounded border-slate-300 text-[#00b494]"
            />
            Lọc Kalman
          </label>
          <button
            onClick={loadReport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : report ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Tổng điểm GPS",
                value: report.totalPoints.toLocaleString(),
                color: "text-slate-900",
                sub:
                  report.totalPoints === 0
                    ? "Chưa có data"
                    : `~${(report.totalPoints / Math.max(1, (report.to - report.from) / 3600000)).toFixed(0)} pts/h`,
              },
              {
                label: "Quãng đường",
                value: `${report.totalDistanceKm.toFixed(2)} km`,
                color: "text-[#00b494]",
                sub:
                  report.totalDistanceKm === 0
                    ? "Không di chuyển"
                    : "Haversine",
              },
              {
                label: "Tốc độ tối đa",
                value:
                  report.maxSpeedKmh > 0
                    ? `${report.maxSpeedKmh.toFixed(0)} km/h`
                    : "—",
                color:
                  report.maxSpeedKmh > 80 ? "text-red-500" : "text-amber-600",
                sub:
                  report.avgSpeedKmh > 0
                    ? `TB: ${report.avgSpeedKmh.toFixed(1)} km/h`
                    : "",
              },
              {
                label: "Tổng sự cố",
                value: report.alertCount,
                color:
                  report.alertCount > 0 ? "text-red-500" : "text-emerald-600",
                sub:
                  report.alertCount > 0
                    ? `${Object.keys(report.alertsByType).length} loại`
                    : "An toàn",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {s.label}
                </p>
                <p className={`mt-1 text-xl font-black ${s.color}`}>
                  {s.value}
                </p>
                {s.sub && (
                  <p className="text-[9px] text-slate-400 mt-0.5">{s.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Period info */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] text-slate-500 font-medium">
            <span className="font-bold text-slate-700">Khoảng thời gian:</span>
            <span>
              {new Date(report.from).toLocaleString("vi-VN")} →{" "}
              {new Date(report.to).toLocaleString("vi-VN")}
            </span>
            <span className="ml-auto font-bold text-slate-600">
              {report.deviceId}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Tốc độ TB
              </p>
              <p className="mt-1 text-xl font-black text-blue-600">
                {report.avgSpeedKmh.toFixed(1)} km/h
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                TG di chuyển
              </p>
              <p className="mt-1 text-xl font-black text-cyan-600">
                {Math.round(report.activeTimeMinutes)} phút
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                TG đứng yên
              </p>
              <p className="mt-1 text-xl font-black text-slate-500">
                {Math.round(report.stationaryTimeMinutes)} phút
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Lọc GPS
              </p>
              <p
                className={`mt-1 text-xs font-black ${useKalman ? "text-[#00b494]" : "text-slate-400"}`}
              >
                {useKalman ? "Kalman ON" : "Tắt"}
              </p>
            </div>
          </div>

          {/* Speed chart */}
          {speedData.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#00b494]" />
                Biểu đồ tốc độ theo thời gian
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={speedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit=" km/h" />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                    formatter={(v: any) => [`${v} km/h`, "Tốc độ"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#00b494"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily activity bar chart */}
          {dailyData.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Hoạt động theo ngày (số điểm GPS)
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="points" fill="#12a1c0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Alert pie chart */}
          {alertPieData.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Phân loại sự cố
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={alertPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {alertPieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <h3 className="w-full text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </h3>
            <button
              onClick={() => exportReportCsv(report)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#00b494]/30 bg-[#00b494]/5 px-4 py-2.5 text-xs font-bold text-[#00b494] hover:bg-[#00b494]/10 active:scale-95 transition-all"
            >
              <FileText className="h-4 w-4" />
              Xuất CSV (Excel)
            </button>
            <button
              onClick={() => exportReportJson(report)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              Xuất JSON
            </button>
          </div>
        </>
      ) : !report ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-200 rounded-2xl text-center">
          <BarChart2 className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-600 mb-1">
            Chưa có dữ liệu GPS
          </p>
          <p className="text-xs text-slate-400">
            {deviceId
              ? `Thiết bị ${deviceId} chưa có dữ liệu trong khoảng thời gian đã chọn.`
              : "Vui lòng chọn thiết bị để xem báo cáo."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
