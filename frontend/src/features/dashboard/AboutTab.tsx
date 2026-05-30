export default function AboutTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">About Us</h2>
        <p className="text-sm text-slate-400 mt-1">Thông tin về đồ án nghiên cứu khoa học MoniMove App</p>
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-200/60 max-w-2xl shadow-sm space-y-4 leading-relaxed">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">MoniMove</strong> là hệ thống IoT toàn diện kết hợp ứng dụng Web di động nhằm tối ưu hóa an toàn giao thông. Dự án tập trung phát triển bộ giải pháp phần cứng thu thập tọa độ GPS và phân tích hành vi va chạm xe thông qua các thuật toán xử lý dữ liệu gia tốc kế.
        </p>
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thành viên thực hiện</h4>
          <p className="text-sm font-semibold text-slate-800">• Nguyễn Trọng Thức - Bộ phận Kỹ thuật Phần mềm & IoT</p>
        </div>
      </div>
    </div>
  );
}