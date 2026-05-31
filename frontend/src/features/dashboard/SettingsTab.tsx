export default function SettingsTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cài đặt</h2>
        <p className="mt-1 text-sm text-slate-400">Cấu hình thông số kỹ thuật cho hệ thống cảnh báo.</p>
      </div>
      <div className="max-w-xl space-y-4 rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-slate-700">Ngưỡng nhạy gia tốc va chạm (MPU6050)</label>
          <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-[#00b494]" />
          <div className="mt-1 flex justify-between text-xs font-semibold text-slate-400">
            <span>Thấp</span>
            <span>Mặc định</span>
            <span>Cao</span>
          </div>
        </div>
        <div className="pt-2">
          <label className="mb-1.5 block text-xs font-bold uppercase text-slate-700">Số điện thoại SOS khẩn cấp</label>
          <input type="text" placeholder="0901234567" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#00b494] focus:outline-none" />
        </div>
        <button
          onClick={() => alert('Đã lưu cấu hình mô phỏng!')}
          className="rounded-xl bg-gradient-to-r from-[#29cca2] to-[#54aafa] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105"
        >
          Lưu cấu hình hệ thống
        </button>
      </div>
    </div>
  );
}
