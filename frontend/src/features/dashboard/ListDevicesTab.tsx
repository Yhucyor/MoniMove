'use client';

import { useState, useEffect } from 'react';
import DeviceCard from './DeviceCard';
import { getDeviceInfo, DeviceInfo } from '../../services/api';
import { RefreshCw, Radio } from 'lucide-react';

export default function ListDevicesTab() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDeviceData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      // Fetching the default ESP32 device
      const data = await getDeviceInfo('DEVICE_ESP32_01');
      setDevice(data);
      setError(null);
    } catch (err: any) {
      console.error('Error in ListDevicesTab:', err);
      setError('Không thể kết nối với máy chủ để lấy danh sách thiết bị.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();

    // Poll the backend every 2.5 seconds to get live coordinates & tilt status from Firebase
    const interval = setInterval(() => {
      fetchDeviceData();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Quản lý thiết bị
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
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
          Làm mới
        </button>
      </div>

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
          >
            Thử lại
          </button>
        </div>
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
        </div>
      )}
    </div>
  );
}
