'use client';

import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Radio, Activity, WifiOff, Search, LayoutGrid, List, Settings } from 'lucide-react';
import { listDevices, getDeviceInfo, DeviceListItem, DeviceInfo } from '../../services/api';
import DeviceCard from '../dashboard/DeviceCard';
import AdminDeviceSettingsModal from './AdminDeviceSettingsModal';

export default function DevicesOverviewTab() {
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [deviceDetails, setDeviceDetails] = useState<Record<string, DeviceInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [settingsDevice, setSettingsDevice] = useState<DeviceListItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await listDevices();
      setDevices(list);

      const details: Record<string, DeviceInfo> = {};
      await Promise.all(
        list.map(async (d) => {
          try {
            const info = await getDeviceInfo(d.id);
            if (info) details[d.id] = info;
          } catch {
            // skip
          }
        }),
      );
      setDeviceDetails(details);
      setError(null);
    } catch {
      setError('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onlineCount = devices.filter(
    d => d.connectionStatus === 'online' || d.status === 'online' || d.status === 'active'
  ).length;
  const offlineCount = devices.length - onlineCount;

  const filteredDevices = devices.filter(d => {
    const matchSearch = !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const isOnline = d.connectionStatus === 'online' || d.status === 'online' || d.status === 'active';
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'online' && isOnline) ||
      (filterStatus === 'offline' && !isOnline);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">

      {/* Device Settings Modal */}
      {settingsDevice && (
        <AdminDeviceSettingsModal device={settingsDevice} onClose={() => setSettingsDevice(null)} />
      )}

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00b494]/10">
              <Cpu className="h-4 w-4 text-[#00b494]" />
            </div>
            Toàn bộ thiết bị hệ thống
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Giám sát tất cả thiết bị IoT đang kết nối trong hệ thống.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* ─── Stats row ─── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tổng */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Radio className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng thiết bị</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{loading ? '—' : devices.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">trong hệ thống</p>
          </div>
        </div>

        {/* Online */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-50/20 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Đang hoạt động</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{loading ? '—' : onlineCount}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">
              {!loading && devices.length > 0 ? `${Math.round((onlineCount / devices.length) * 100)}% online` : ''}
            </p>
          </div>
        </div>

        {/* Offline */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-200/60 flex items-center justify-center shrink-0">
            <WifiOff className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngoại tuyến</p>
            <p className="text-2xl font-black text-slate-500 mt-0.5">{loading ? '—' : offlineCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">không kết nối</p>
          </div>
        </div>
      </div>

      {/* ─── Filter & Search bar ─── */}
      {!loading && devices.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm thiết bị..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00b494]/20 focus:border-[#00b494] bg-white shadow-sm"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            {(['all', 'online', 'offline'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === f
                  ? f === 'online'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : f === 'offline'
                      ? 'bg-slate-500 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'online' ? '● Online' : '○ Offline'}
              </button>
            ))}

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 ml-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#00b494]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Dạng lưới"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#00b494]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Dạng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Error ─── */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Radio className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button onClick={fetchData} className="mt-1 text-xs font-bold text-red-600 underline">
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* ─── Content ─── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm animate-pulse space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="h-32 bg-slate-100 rounded-2xl" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Chưa có thiết bị</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">Chưa có thiết bị IoT nào được đăng ký trong hệ thống.</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 rounded-[24px] bg-white/50 text-center">
          <Search className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-600">Không tìm thấy thiết bị</p>
          <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <>
          {/* Count label */}
          <p className="text-xs text-slate-400 font-medium -mt-2">
            Hiển thị <span className="font-bold text-slate-600">{filteredDevices.length}</span> / {devices.length} thiết bị
          </p>

          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-5"
          }>
            {filteredDevices.map(d =>
              deviceDetails[d.id] ? (
                <div key={d.id} className="relative group">
                  <DeviceCard device={deviceDetails[d.id]} viewMode={viewMode} />
                  {/* Settings button overlay */}
                  <button
                    onClick={() => setSettingsDevice(d)}
                    className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00b494]/10 hover:border-[#00b494]/40 hover:text-[#00b494]"
                    title="Cài đặt thiết bị"
                  >
                    <Settings className="h-3 w-3" />
                    Cài đặt
                  </button>
                </div>
              ) : (
                <div key={d.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Cpu className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{d.id}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {d.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettingsDevice(d)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#00b494]/30 bg-[#00b494]/10 px-3 py-1.5 text-[10px] font-bold text-[#00b494] hover:bg-[#00b494]/20 transition-colors shrink-0"
                    title="Cài đặt thiết bị"
                  >
                    <Settings className="h-3 w-3" />
                    Cài đặt
                  </button>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
