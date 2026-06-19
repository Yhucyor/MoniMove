'use client';

import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Radio, Activity } from 'lucide-react';
import { listDevices, getDeviceInfo, DeviceListItem, DeviceInfo } from '../../services/api';
import DeviceCard from '../dashboard/DeviceCard';

export default function DevicesOverviewTab() {
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [deviceDetails, setDeviceDetails] = useState<Record<string, DeviceInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await listDevices();
      setDevices(list);

      const details: Record<string, DeviceInfo> = {};
      await Promise.all(
        list.map(async (d) => {
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
      setError('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-[#00b494]" />
            Toàn bộ thiết bị hệ thống
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            Giám sát tất cả thiết bị IoT đang kết nối trong hệ thống.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Radio className="h-4 w-4" />
            Tổng thiết bị
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">{devices.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <Activity className="h-4 w-4" />
            Đang hoạt động
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600">
            {devices.filter((d) => d.connectionStatus === 'online' || d.status === 'online' || d.status === 'active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="h-4 w-4" />
            Ngoại tuyến
          </div>
          <p className="mt-2 text-3xl font-black text-slate-400">
            {devices.filter((d) => d.connectionStatus !== 'online' && d.status !== 'online' && d.status !== 'active').length}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <Radio className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Chưa có thiết bị trong hệ thống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => (
            deviceDetails[d.id] ? (
              <DeviceCard key={d.id} device={deviceDetails[d.id]} />
            ) : (
              <div key={d.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-800">{d.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">{d.id}</p>
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {d.status}
                </span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
