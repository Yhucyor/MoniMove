export default function AboutTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Giới thiệu</h2>
        <p className="mt-1 text-sm text-slate-400">Thông tin về đồ án nghiên cứu MoniMove App.</p>
      </div>
      <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200/60 bg-white p-8 leading-relaxed shadow-sm">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">MoniMove</strong> là hệ thống IoT kết hợp ứng dụng web nhằm tối ưu an toàn
          giao thông. Dự án tập trung thu thập tọa độ GPS, theo dõi hành trình và phân tích dữ liệu gia tốc để hỗ trợ
          phát hiện va chạm.
        </p>
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Thành viên thực hiện</h4>
          <p className="text-sm font-semibold text-slate-800">Nguyễn Trọng Thức - Bộ phận Kỹ thuật phần mềm & IoT</p>
        </div>
      </div>
    </div>
  );
}
