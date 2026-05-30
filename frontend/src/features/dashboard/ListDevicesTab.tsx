// Điều chỉnh lại đường dẫn import DeviceCard cho khớp với dự án thực tế của bạn
import DeviceCard from '../../features/dashboard/DeviceCard';

export default function ListDevicesTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">List Devices</h2>
        <p className="text-sm text-slate-400 mt-1">Quản lý và kích hoạt các module IoT phần cứng</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DeviceCard />
      </div>
    </div>
  );
}