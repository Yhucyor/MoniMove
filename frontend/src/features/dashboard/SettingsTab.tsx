export default function SettingsTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Setting</h2>
        <p className="text-sm text-slate-400 mt-1">Cấu hình các thông số kỹ thuật cho hệ thống cảnh báo</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/60 max-w-xl shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Ngưỡng nhạy gia tốc va chạm (MPU6050)</label>
          <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-[#00b494]" />
          <div className="flex justify-between text-xs text-slate-400 mt-1 font-semibold">
            <span>Thấp (An toàn)</span><span>Mặc định</span><span>Cao (Rất nhạy)</span>
          </div>
        </div>
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Số điện thoại SOS khẩn cấp</label>
          <input type="text" placeholder="0901234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00b494]" />
        </div>
        <button onClick={() => alert('Đã lưu cấu hình giả lập!')} className="px-5 py-2.5 bg-gradient-to-r from-[#29cca2] to-[#54aafa] text-white font-bold rounded-xl text-xs shadow-sm hover:brightness-105 transition-all">
          Lưu cấu hình hệ thống
        </button>
      </div>
    </div>
  );
}