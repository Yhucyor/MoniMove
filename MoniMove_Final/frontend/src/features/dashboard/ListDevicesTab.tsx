'use client';

import { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import { getDeviceInfo, DeviceInfo } from '../../services/api';
import { subscribeDeviceInfo } from '../../services/firebaseRealtime';
import { RefreshCw, Radio, Shield, LayoutGrid, List } from 'lucide-react';
import { useMyDevices } from '../../hooks/useMyDevices';

export default function ListDevicesTab() {
  const { devices, loading: listLoading, error: listError, refresh } = useMyDevices();
  const [deviceDetails, setDeviceDetails] = useState<Record<string, DeviceInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  const fetchDeviceData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
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
      setError('Không thể kết nối với máy chủ để lấy danh sách thiết bị.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
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

  if (!listLoading && devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-200 rounded-[32px] bg-white/50 text-center max-w-2xl mx-auto mt-8 shadow-sm">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Shield className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-700">Chưa có thiết bị nào</h3>
        <p className="mt-3 text-sm text-slate-500 max-w-md">
          Tài khoản của bạn hiện chưa được cấp quyền truy cập vào thiết bị IoT nào. Vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Thiết bị của tôi
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium font-normal">
            Chỉ hiển thị các thiết bị bạn được phép truy cập.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Tìm thiết bị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-[#00b494]/20 focus:border-[#00b494]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00b494]/20 focus:border-[#00b494]"
          >
            <option value="all">Tất cả</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#00b494]' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#00b494]' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading || listLoading}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {(loading || listLoading) ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className={`w-full rounded-[24px] border border-slate-100 bg-white/70 p-6 shadow-sm animate-pulse space-y-4 ${viewMode === 'list' ? 'flex flex-row gap-6' : ''}`}>
              <div className={`flex justify-between items-center pb-4 border-slate-100 ${viewMode === 'list' ? 'w-1/4 border-r pr-4' : 'border-b'}`}>
                <div className="h-5 w-24 bg-slate-200 rounded-lg" />
                <div className="h-5 w-16 bg-slate-200 rounded-lg" />
              </div>
              <div className={`space-y-3 ${viewMode === 'list' ? 'flex-1 flex flex-row gap-4' : ''}`}>
                <div className="h-28 bg-slate-100 rounded-2xl flex-1" />
                <div className="h-28 bg-slate-100 rounded-2xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (error || listError) ? (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 max-w-md">
          <p className="text-xs font-semibold text-red-600">{error || listError}</p>
          <button
            onClick={() => fetchDeviceData()}
            className="mt-2 text-[10px] font-bold text-red-700 underline uppercase cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-6"}>
          {devices
            .filter((d) => {
              // Search
              if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.id.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
              }
              // Filter Status
              if (filterStatus !== 'all') {
                const detail = deviceDetails[d.id];
                const status = detail?.connectionStatus || d.status || 'offline';
                if (filterStatus === 'online' && status !== 'online') return false;
                if (filterStatus === 'offline' && status === 'online') return false;
              }
              return true;
            })
            .map((d) =>
              deviceDetails[d.id] ? (
                <DeviceCard key={d.id} device={deviceDetails[d.id]} viewMode={viewMode} />
              ) : (
                <div key={d.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-800">{d.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{d.id}</p>
                </div>
              ),
            )}
        </div>
      )}

      {!loading && !listLoading && devices.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-slate-400 animate-pulse" />
          </div>
          <p className="text-sm text-slate-600 font-bold">Không tìm thấy dữ liệu thiết bị.</p>
          <p className="text-xs text-slate-400 mt-1">Chưa phát hiện thiết bị nào đang hoạt động và gửi tín hiệu về hệ thống.</p>
        </div>
      )}
    </div>
  );
}
