'use client';

import {
  MapPin, Activity, Cpu, ShieldAlert, User, Terminal, Layers,
  Shield, BarChart2, Wifi, GitBranch, Zap, Lock,
} from 'lucide-react';

const FEATURES = [
  {
    icon: MapPin, color: 'text-cyan-600 bg-cyan-50 group-hover:bg-cyan-100',
    title: 'Giám sát GPS thời gian thực',
    desc: 'Thu thập tọa độ GPS liên tục, hiển thị trực tiếp trên bản đồ số với độ trễ thấp.',
  },
  {
    icon: Activity, color: 'text-red-500 bg-red-50 group-hover:bg-red-100',
    title: 'Phát hiện va chạm & ngã đổ',
    desc: 'Thuật toán phân tích gia tốc IMU (MPU6050) nhận diện va chạm, ngã xe và gửi cảnh báo khẩn cấp.',
  },
  {
    icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 group-hover:bg-amber-100',
    title: 'Cảnh báo tức thời đa kênh',
    desc: 'Cảnh báo real-time trên dashboard, âm thanh, thông báo trình duyệt khi phát hiện sự cố.',
  },
  {
    icon: Shield, color: 'text-[#00b494] bg-emerald-50 group-hover:bg-emerald-100',
    title: 'Geofencing — Vùng an toàn',
    desc: 'Thiết lập vùng địa lý cho phép. Cảnh báo tự động khi thiết bị ra khỏi vùng quy định.',
  },
  {
    icon: BarChart2, color: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
    title: 'Phân tích & Xuất báo cáo',
    desc: 'Biểu đồ thống kê tốc độ, quãng đường, sự cố theo ngày/tuần/tháng. Xuất CSV/JSON.',
  },
  {
    icon: Zap, color: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
    title: 'AI nhận diện trạng thái',
    desc: 'Classifier tự động phân loại trạng thái chuyển động: đứng yên, đi bộ, di chuyển, va chạm, ngã.',
  },
  {
    icon: Wifi, color: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100',
    title: 'Hỗ trợ offline & đồng bộ',
    desc: 'Lưu dữ liệu tạm thời bằng IndexedDB khi mất mạng, tự động đồng bộ khi kết nối trở lại.',
  },
  {
    icon: Lock, color: 'text-slate-700 bg-slate-50 group-hover:bg-slate-100',
    title: 'Bảo mật phân quyền',
    desc: 'Firebase Auth + JWT, phân quyền Admin/User, mỗi user chỉ truy cập thiết bị được cấp phép.',
  },
];

const TECH_STACK = [
  { label: 'Frontend', items: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Recharts'] },
  { label: 'Backend', items: ['NestJS', 'Firebase Admin SDK', 'Firestore', 'REST API'] },
  { label: 'Realtime', items: ['Firebase Realtime DB', 'WebSocket', 'IndexedDB offline'] },
  { label: 'Hardware', items: ['ESP32', 'MPU6050 (IMU)', 'GPS Neo-6M', 'Arduino'] },
];

export default function AboutTab() {
  return (
    <div className="relative w-full min-h-[calc(100vh-120px)] pb-10">
      <style dangerouslySetInnerHTML={{
        __html: `
        .stagger-1 { animation-delay: 60ms; }
        .stagger-2 { animation-delay: 140ms; }
        .stagger-3 { animation-delay: 220ms; }
        .stagger-4 { animation-delay: 300ms; }
        .stagger-5 { animation-delay: 380ms; }
        .stagger-6 { animation-delay: 460ms; }
        .stagger-7 { animation-delay: 540ms; }
        .stagger-8 { animation-delay: 620ms; }
      ` }} />

      {/* Background glow blobs */}
      <div className="absolute top-[5%] left-[-5%] h-[300px] w-[300px] rounded-full bg-[#12a1c0]/5 blur-[80px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-[#00b494]/5 blur-[90px] pointer-events-none z-0 animate-pulse" />

      <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl">

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-[#0e172a] to-slate-900 p-8 md:p-10 text-white shadow-xl border border-slate-800/40">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12a1c0] to-[#00b494] shadow-lg">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-white" fillRule="evenodd" clipRule="evenodd">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b494]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00b494] border border-[#00b494]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00b494] animate-pulse" />
                  Dự án nghiên cứu IoT
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  MoniMove <span className="bg-gradient-to-r from-[#12a1c0] to-[#00b494] bg-clip-text text-transparent">App</span>
                </h2>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
              Hệ thống IoT kết hợp ứng dụng Web giám sát hành trình toàn diện, phát hiện va chạm thời gian thực
              và phân tích dữ liệu thông minh — được thiết kế để tối ưu hóa sự an toàn cho phương tiện và người tham gia giao thông.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {['IoT · GPS Tracking', 'Real-time Alerts', 'AI Motion Detection', 'Geofencing', 'Offline Support'].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Tính năng hệ thống</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-5 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-${(i % 8) + 1}`}
                >
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${f.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1.5 leading-tight">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* System architecture */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-[#00b494]" />
            Kiến trúc hệ thống
          </h3>

          <div className="grid gap-6 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-10 left-[28%] w-[15%] border-t-2 border-dashed border-slate-200" />
            <div className="hidden md:block absolute top-10 left-[57%] w-[15%] border-t-2 border-dashed border-slate-200" />

            {[
              { icon: Cpu, color: 'text-indigo-500 border-indigo-200 group-hover:border-indigo-300', num: '1', title: 'Hardware IoT', desc: 'ESP32 + MPU6050 + GPS Neo-6M thu thập tọa độ, gia tốc, con quay hồi chuyển và truyền lên cloud.' },
              { icon: Terminal, color: 'text-emerald-500 border-emerald-200 group-hover:border-emerald-300', num: '2', title: 'Cloud API & DB', desc: 'NestJS Backend xác thực JWT, phân quyền Role-based. Firebase Realtime DB + Firestore lưu trữ.' },
              { icon: GitBranch, color: 'text-cyan-500 border-cyan-200 group-hover:border-cyan-300', num: '3', title: 'Web Dashboard', desc: 'Next.js 15 hiển thị bản đồ Leaflet, biểu đồ Recharts, cảnh báo realtime và xuất báo cáo.' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="group flex flex-col items-center text-center p-3 relative z-10">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border-2 mb-3 transition-all duration-300 group-hover:scale-105 ${s.color}`}>
                    <Icon className={`h-6 w-6 ${s.color.split(' ')[0]}`} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Bước {s.num}</span>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech stack */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            Công nghệ sử dụng
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((stack) => (
              <div key={stack.label}>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{stack.label}</p>
                <div className="space-y-1">
                  {stack.items.map((item) => (
                    <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Nhóm thực hiện</h3>

          {/* Nhóm trưởng */}
          <div className="mb-4 rounded-2xl border border-[#00b494]/20 bg-gradient-to-r from-[#00b494]/5 to-[#12a1c0]/5 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#00b494] mb-3">Nhóm trưởng</p>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12a1c0] to-[#00b494] blur-md opacity-30" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#12a1c0] to-[#00b494] text-white shadow-md">
                  <User className="h-6 w-6" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="text-sm font-extrabold text-slate-900">Nguyễn Trọng Thức</h4>
                  <span className="rounded-full bg-[#12a1c0]/10 px-2 py-0.5 text-[9px] font-bold text-[#12a1c0] border border-[#12a1c0]/20">
                    Software & IoT Lead
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Thiết kế kiến trúc hệ thống, lập trình firmware ESP32, xây dựng NestJS API và toàn bộ Web Dashboard giám sát thời gian thực.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['ESP32 / Arduino', 'NestJS Backend', 'Next.js 15', 'Firebase', 'WebSocket'].map((t) => (
                    <span key={t} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wide">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Thành viên */}
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Thành viên</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                name: 'Trịnh Văn Phú Hào',
                role: 'Hardware Engineer',
                desc: 'Thiết kế và lắp ráp mạch phần cứng IoT, tích hợp cảm biến MPU6050 và module GPS Neo-6M với vi điều khiển ESP32.',
                tags: ['ESP32 Circuit', 'MPU6050', 'GPS Neo-6M', 'Arduino IDE'],
                gradient: 'from-purple-500 to-indigo-500',
                badge: 'bg-purple-50 text-purple-600 border-purple-200',
              },
              {
                name: 'Trần Hữu Lộc',
                role: 'Backend & Database',
                desc: 'Xây dựng REST API endpoints, cấu hình Firebase Realtime Database, quản lý xác thực người dùng và phân quyền hệ thống.',
                tags: ['Firebase RTDB', 'Firestore', 'REST API', 'Auth Guard'],
                gradient: 'from-amber-500 to-orange-500',
                badge: 'bg-amber-50 text-amber-600 border-amber-200',
              },
              {
                name: 'Châu Hữu Nghị',
                role: 'Frontend & UI/UX',
                desc: 'Phát triển giao diện dashboard, thiết kế UI/UX các tính năng giám sát, geofencing, phân tích dữ liệu và xuất báo cáo.',
                tags: ['Next.js', 'Tailwind CSS', 'Recharts', 'Leaflet Maps'],
                gradient: 'from-cyan-500 to-teal-500',
                badge: 'bg-cyan-50 text-cyan-600 border-cyan-200',
              },
            ].map((member) => (
              <div key={member.name} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-white shadow-sm`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{member.name}</p>
                    <span className={`inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${member.badge}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{member.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {member.tags.map((t) => (
                    <span key={t} className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500 uppercase tracking-wide">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center">
            Đồ án nghiên cứu tốt nghiệp · Khoa Khoa Học Công Nghệ
          </p>
        </div>

      </div>
    </div>
  );
}
