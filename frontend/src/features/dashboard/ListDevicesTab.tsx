<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import DeviceCard from "./DeviceCard";
import { getDeviceInfo, DeviceInfo } from "../../services/api";
import { subscribeDeviceInfo } from "../../services/firebaseRealtime";
import {
  RefreshCw,
  Radio,
  Cpu,
  LayoutGrid,
  List,
  Search,
  Filter,
} from "lucide-react";
import { useMyDevices } from "../../hooks/useMyDevices";

export default function ListDevicesTab() {
  const {
    devices,
    loading: listLoading,
    error: listError,
    refresh,
  } = useMyDevices();
  const [deviceDetails, setDeviceDetails] = useState<
    Record<string, DeviceInfo>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "offline"
  >("all");
=======
'use client';

import { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import { getDeviceInfo, DeviceInfo } from '../../services/api';
import { subscribeDeviceInfo } from '../../services/firebaseRealtime';
import { RefreshCw, Radio } from 'lucide-react';

export default function ListDevicesTab() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a

  const fetchDeviceData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
<<<<<<< HEAD
      const details: Record<string, DeviceInfo> = {};
      await Promise.all(
        devices.map(async (d) => {
          try {
            details[d.id] = await getDeviceInfo(d.id);
          } catch {
            // skip
          }
        }),
      );
      setDeviceDetails(details);
      setError(null);
    } catch {
      setError("Không thể kết nối với máy chủ để lấy danh sách thiết bị.");
=======
      // Fetching the default ESP32 device
      const data = await getDeviceInfo('DEVICE_ESP32_01');
      setDevice(data);
      setError(null);
    } catch (err: any) {
      console.error('Error in ListDevicesTab:', err);
      setError('Không thể kết nối với máy chủ để lấy danh sách thiết bị.');
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    if (!listLoading) {
      if (devices.length === 0) {
        setLoading(false);
        return;
      }
      fetchDeviceData();
    }
  }, [devices, listLoading]);

  useEffect(() => {
    const unsubscribes = devices.map((d) =>
      subscribeDeviceInfo(d.id, (updatedData) => {
        setDeviceDetails((prev) => ({
          ...prev,
          [d.id]: { ...prev[d.id], ...updatedData } as DeviceInfo,
        }));
      }),
    );
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [devices]);

  const handleRefresh = async () => {
    await refresh();
    await fetchDeviceData(true);
  };

  const filteredDevices = devices.filter((d) => {
    if (
      searchQuery &&
      !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !d.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filterStatus !== "all") {
      const detail = deviceDetails[d.id];
      const status = detail?.connectionStatus || d.status || "offline";
      if (filterStatus === "online" && status !== "online") return false;
      if (filterStatus === "offline" && status === "online") return false;
    }
    return true;
  });

  const onlineCount = devices.filter((d) => {
    const detail = deviceDetails[d.id];
    const status = detail?.connectionStatus || d.status || "offline";
    return status === "online";
  }).length;

  if (!listLoading && devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-16 border border-dashed border-slate-200 rounded-[32px] bg-white/50 text-center max-w-2xl mx-auto mt-8 shadow-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Cpu className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-700">
          Chưa có thiết bị nào
        </h3>
        <p className="mt-3 text-sm text-slate-500 max-w-md leading-relaxed">
          Tài khoản của bạn hiện chưa được cấp quyền truy cập vào thiết bị IoT
          nào. Vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
              <Cpu className="h-4 w-4 text-emerald-600" />
            </div>
            Thiết bị của tôi
=======
    fetchDeviceData();

    // Subscribe to real-time updates from Firebase
    const unsubscribe = subscribeDeviceInfo('DEVICE_ESP32_01', (updatedData) => {
      setDevice((prev) => ({ ...prev, ...updatedData } as DeviceInfo));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Quản lý thiết bị
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
<<<<<<< HEAD
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Chỉ hiển thị các thiết bị bạn được phép truy cập.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading || listLoading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
          />
=======
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium font-normal">
            Theo dõi tình trạng hoạt động, định vị GPS và các cảm biến góc nghiêng thời gian thực.
          </p>
        </div>
        
        <button
          onClick={() => fetchDeviceData(true)}
          disabled={isRefreshing || loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
          Làm mới
        </button>
      </div>

<<<<<<< HEAD
      {/* Stats row */}
      {!loading && !listLoading && devices.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Cpu className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Tổng thiết bị
              </p>
              <p className="text-xl font-black text-slate-900">
                {devices.length}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                Trực tuyến
              </p>
              <p className="text-xl font-black text-emerald-600">
                {onlineCount}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
              <span className="h-3 w-3 rounded-full bg-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Ngoại tuyến
              </p>
              <p className="text-xl font-black text-slate-500">
                {devices.length - onlineCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters + View toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm thiết bị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/20 focus:border-[#00b494] bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/20 focus:border-[#00b494] shadow-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="online">Trực tuyến</option>
            <option value="offline">Ngoại tuyến</option>
          </select>

          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#00b494]" : "text-slate-400 hover:text-slate-600"}`}
              title="Dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#00b494]" : "text-slate-400 hover:text-slate-600"}`}
              title="Dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Device list */}
      {loading || listLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {[1, 2, 3].map((skeleton) => (
            <div
              key={skeleton}
              className="w-full rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="h-5 w-28 bg-slate-200 rounded-lg" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-24 bg-slate-100 rounded-2xl" />
                <div className="h-24 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error || listError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center max-w-md mx-auto">
          <Cpu className="h-8 w-8 text-red-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-600">
            {error || listError}
          </p>
          <button
            onClick={() => fetchDeviceData()}
            className="mt-3 text-xs font-bold text-red-700 underline uppercase cursor-pointer"
=======
      {loading ? (
        // Skeleton Loader while fetching
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="w-full max-w-md rounded-[24px] border border-slate-100 bg-white/70 p-6 shadow-sm animate-pulse space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="h-5 w-24 bg-slate-200 rounded-lg" />
              <div className="h-5 w-16 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-28 bg-slate-100 rounded-2xl" />
            <div className="h-28 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        // Error alert banner
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 max-w-md">
          <p className="text-xs font-semibold text-red-600">{error}</p>
          <button 
            onClick={() => fetchDeviceData()}
            className="mt-2 text-[10px] font-bold text-red-700 underline uppercase cursor-pointer"
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
          >
            Thử lại
          </button>
        </div>
<<<<<<< HEAD
      ) : filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
          <Radio className="h-8 w-8 text-slate-300 mb-3 animate-pulse" />
          <p className="text-sm font-bold text-slate-600">
            Không tìm thấy thiết bị nào
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {filteredDevices.map((d) =>
            deviceDetails[d.id] ? (
              <DeviceCard
                key={d.id}
                device={deviceDetails[d.id]}
                viewMode={viewMode}
              />
            ) : (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Cpu className="h-5 w-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{d.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.id}</p>
                </div>
              </div>
            ),
          )}
=======
      ) : device ? (
        // Grid rendering the fetched device details
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DeviceCard device={device} />
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center max-w-md">
          <Radio className="h-8 w-8 text-slate-400 mb-2.5 animate-pulse" />
          <p className="text-xs text-slate-500 font-semibold">Chưa phát hiện thiết bị nào đang hoạt động.</p>
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
        </div>
      )}
    </div>
  );
}
