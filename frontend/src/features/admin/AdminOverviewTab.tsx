"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Cpu,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  RefreshCw,
  Clock,
  Radio,
  Zap,
} from "lucide-react";
import {
  getAllUsers,
  listDevices,
  getAlertsHistory,
  AlertLog,
  DeviceListItem,
} from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function AdminOverviewTab() {
  const [stats, setStats] = useState({
    users: 0,
    devices: 0,
    alerts: 0,
    online: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<AlertLog[]>([]);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [wsAlertCount, setWsAlertCount] = useState(0);

  // WebSocket — admin subscribes to all
  const { connectionState, isConnected } = useWebSocket({
    onAlert: () => setWsAlertCount((c) => c + 1),
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [users, deviceList, alerts] = await Promise.all([
        getAllUsers(),
        listDevices(),
        getAlertsHistory(),
      ]);
      setStats({
        users: users.length,
        devices: deviceList.length,
        alerts: alerts.length,
        online: deviceList.filter(
          (d) =>
            d.connectionStatus === "online" ||
            d.status === "online" ||
            d.status === "active",
        ).length,
      });
      setRecentAlerts(alerts.slice(0, 5));
      setDevices(deviceList);
      setLastRefresh(Date.now());
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Build alert-by-type chart data
  const alertTypeMap: Record<string, number> = {};
  recentAlerts.forEach((a) => {
    const t = a.alertType || "unknown";
    alertTypeMap[t] = (alertTypeMap[t] || 0) + 1;
  });
  const alertChartData = Object.entries(alertTypeMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Device status chart
  const deviceChartData = [
    { name: "Trực tuyến", value: stats.online, fill: "#00b494" },
    {
      name: "Ngoại tuyến",
      value: stats.devices - stats.online,
      fill: "#ef4444",
    },
  ];

  const statCards = [
    {
      label: "Người dùng",
      value: stats.users,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
      trend: "+0",
    },
    {
      label: "Tổng thiết bị",
      value: stats.devices,
      icon: Cpu,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      trend: `${stats.online} trực tuyến`,
    },
    {
      label: "Đang hoạt động",
      value: stats.online,
      icon: Activity,
      color: "text-cyan-600",
      bg: "bg-cyan-50 border-cyan-100",
      trend:
        stats.devices > 0
          ? `${Math.round((stats.online / stats.devices) * 100)}%`
          : "0%",
    },
    {
      label: "Tổng sự cố",
      value: stats.alerts,
      icon: AlertTriangle,
      color: stats.alerts > 0 ? "text-amber-600" : "text-emerald-600",
      bg:
        stats.alerts > 0
          ? "bg-amber-50 border-amber-100"
          : "bg-emerald-50 border-emerald-100",
      trend: "hôm nay",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            Tổng quan hệ thống
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Theo dõi toàn bộ dữ liệu người dùng, thiết bị và sự cố trong hệ
            thống MoveMonitor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-semibold">
            Cập nhật: {new Date(lastRefresh).toLocaleTimeString("vi-VN")}
          </span>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border ${card.bg} p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${card.color}`} />
                <span
                  className={`text-[10px] font-bold ${card.color} opacity-70`}
                >
                  {card.trend}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className={`mt-1 text-3xl font-black ${card.color}`}>
                {loading ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device status bar */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00b494]" />
            Trạng thái thiết bị
          </h3>
          {stats.devices > 0 ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#12a1c0] to-[#00b494] transition-all duration-700"
                    style={{
                      width: `${(stats.online / stats.devices) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-[#00b494]">
                  {Math.round((stats.online / stats.devices) * 100)}%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={deviceChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#00b494" />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">
              Chưa có dữ liệu thiết bị
            </p>
          )}
        </div>

        {/* Alert type breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Phân loại sự cố gần đây
          </h3>
          {alertChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={alertChartData} layout="vertical" barSize={18}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Shield className="h-8 w-8 text-emerald-300 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">
                Không có sự cố nào gần đây
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent alerts + device list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent alerts */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            Sự cố gần đây
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : recentAlerts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Chưa có sự cố nào
            </p>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-600 truncate">
                        {alert.alertType || "Sự cố"}
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0">
                        {alert.deviceId}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                      {alert.message}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(alert.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device quick status */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#00b494]" />
            Thiết bị trong hệ thống
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Chưa có thiết bị
            </p>
          ) : (
            <div className="space-y-2">
              {devices.map((d) => {
                const isOnline = d.connectionStatus === "online";
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {d.name}
                        </p>
                        <p className="text-[9px] text-slate-400">{d.id}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${
                        isOnline
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* System health footer */}
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Backend: Hoạt động
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Firebase: Kết nối
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-[#00b494]" />
            Realtime sync: Bật
          </div>
          <div className="flex items-center gap-1.5">
            <Zap
              className={`h-3 w-3 ${isConnected ? "text-amber-500" : "text-slate-400"}`}
            />
            WebSocket: {isConnected ? `Live` : connectionState}
            {wsAlertCount > 0 && (
              <span className="text-amber-600 ml-1">
                +{wsAlertCount} alerts
              </span>
            )}
          </div>
          <div className="ml-auto text-[9px] text-slate-400">
            MoveMonitor · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
