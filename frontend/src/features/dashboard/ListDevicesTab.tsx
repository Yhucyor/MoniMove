import DeviceCard from '../../features/dashboard/DeviceCard';

export default function ListDevicesTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Thiết bị</h2>
        <p className="mt-1 text-sm text-slate-400">Quản lý và theo dõi các module IoT phần cứng.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DeviceCard />
      </div>
    </div>
  );
}
