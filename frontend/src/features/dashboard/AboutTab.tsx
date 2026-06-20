<<<<<<< HEAD
"use client";

import {
  MapPin,
  Activity,
  Cpu,
  ShieldAlert,
  User,
  Terminal,
  Layers,
  BarChart2,
  Wifi,
  GitBranch,
  Zap,
  Lock,
  Shield,
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    color: "text-cyan-600",
    bg: "bg-cyan-50 group-hover:bg-cyan-100",
    title: "Giám sát GPS thời gian thực",
    desc: "Thu thập tọa độ GPS liên tục, hiển thị trực tiếp trên bản đồ số với độ trễ thấp.",
  },
  {
    icon: Activity,
    color: "text-red-500",
    bg: "bg-red-50 group-hover:bg-red-100",
    title: "Phát hiện va chạm & ngã đổ",
    desc: "Thuật toán phân tích gia tốc IMU (MPU6050) nhận diện va chạm, ngã xe và gửi cảnh báo khẩn cấp.",
  },
  {
    icon: ShieldAlert,
    color: "text-amber-500",
    bg: "bg-amber-50 group-hover:bg-amber-100",
    title: "Cảnh báo tức thời đa kênh",
    desc: "Cảnh báo real-time trên dashboard, âm thanh, thông báo trình duyệt khi phát hiện sự cố.",
  },
  {
    icon: Shield,
    color: "text-emerald-600",
    bg: "bg-emerald-50 group-hover:bg-emerald-100",
    title: "Geofencing — Vùng an toàn",
    desc: "Thiết lập vùng địa lý cho phép. Cảnh báo tự động khi thiết bị ra khỏi vùng quy định.",
  },
  {
    icon: BarChart2,
    color: "text-purple-600",
    bg: "bg-purple-50 group-hover:bg-purple-100",
    title: "Phân tích & Xuất báo cáo",
    desc: "Biểu đồ thống kê tốc độ, quãng đường, sự cố theo ngày/tuần/tháng. Xuất CSV/JSON.",
  },
  {
    icon: Zap,
    color: "text-blue-600",
    bg: "bg-blue-50 group-hover:bg-blue-100",
    title: "AI nhận diện trạng thái",
    desc: "Classifier tự động phân loại trạng thái chuyển động: đứng yên, đi bộ, di chuyển, va chạm, ngã.",
  },
  {
    icon: Wifi,
    color: "text-indigo-600",
    bg: "bg-indigo-50 group-hover:bg-indigo-100",
    title: "Hỗ trợ offline & đồng bộ",
    desc: "Lưu dữ liệu tạm thời bằng IndexedDB khi mất mạng, tự động đồng bộ khi kết nối trở lại.",
  },
  {
    icon: Lock,
    color: "text-slate-600",
    bg: "bg-slate-100 group-hover:bg-slate-200",
    title: "Bảo mật phân quyền",
    desc: "Firebase Auth + JWT, phân quyền Admin/User, mỗi user chỉ truy cập thiết bị được cấp phép.",
  },
];

const TECH_STACK = [
  {
    label: "Frontend",
    icon: "🖥️",
    color: "border-blue-100 bg-blue-50/50",
    items: ["Next.js 15", "TypeScript", "Tailwind CSS", "Recharts"],
  },
  {
    label: "Backend",
    icon: "⚙️",
    color: "border-emerald-100 bg-emerald-50/50",
    items: ["NestJS", "Firebase Admin SDK", "Firestore", "REST API"],
  },
  {
    label: "Realtime",
    icon: "⚡",
    color: "border-amber-100 bg-amber-50/50",
    items: ["Firebase Realtime DB", "WebSocket", "IndexedDB offline"],
  },
  {
    label: "Hardware",
    icon: "🔧",
    color: "border-purple-100 bg-purple-50/50",
    items: ["ESP32", "MPU6050 (IMU)", "GPS Neo-6M", "Arduino"],
  },
];

const MEMBERS = [
  {
    name: "Nguyễn Trọng Thức",
    role: "Nhóm trưởng · Software & IoT Lead",
    desc: "Thiết kế kiến trúc hệ thống, lập trình firmware ESP32, xây dựng NestJS API và toàn bộ Web Dashboard giám sát thời gian thực.",
    tags: [
      "ESP32 / Arduino",
      "NestJS Backend",
      "Next.js 15",
      "Firebase",
      "WebSocket",
    ],
    gradient: "from-[#12a1c0] to-[#00b494]",
    ring: "ring-[#00b494]/30",
    badge: "bg-[#00b494]/10 text-[#00b494] border-[#00b494]/20",
    isLead: true,
  },
  {
    name: "Trịnh Văn Phú Hào",
    role: "Hardware Engineer",
    desc: "Thiết kế và lắp ráp mạch phần cứng IoT, tích hợp cảm biến MPU6050 và module GPS Neo-6M với vi điều khiển ESP32.",
    tags: ["ESP32 Circuit", "MPU6050", "GPS Neo-6M", "Arduino IDE"],
    gradient: "from-purple-500 to-indigo-500",
    ring: "ring-purple-300",
    badge: "bg-purple-50 text-purple-600 border-purple-200",
    isLead: false,
  },
  {
    name: "Trần Hữu Lộc",
    role: "Backend & Database",
    desc: "Xây dựng REST API endpoints, cấu hình Firebase Realtime Database, quản lý xác thực người dùng và phân quyền hệ thống.",
    tags: ["Firebase RTDB", "Firestore", "REST API", "Auth Guard"],
    gradient: "from-amber-500 to-orange-500",
    ring: "ring-amber-300",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    isLead: false,
  },
  {
    name: "Châu Hữu Nghị",
    role: "Frontend & UI/UX",
    desc: "Phát triển giao diện dashboard, thiết kế UI/UX các tính năng giám sát, phân tích dữ liệu và xuất báo cáo.",
    tags: ["Next.js", "Tailwind CSS", "Recharts", "Leaflet Maps"],
    gradient: "from-cyan-500 to-teal-500",
    ring: "ring-cyan-300",
    badge: "bg-cyan-50 text-cyan-600 border-cyan-200",
    isLead: false,
  },
];

export default function AboutTab() {
  return (
    <div className="relative w-full pb-10">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .stagger-1 { animation-delay: 60ms; }
        .stagger-2 { animation-delay: 140ms; }
        .stagger-3 { animation-delay: 220ms; }
        .stagger-4 { animation-delay: 300ms; }
        .stagger-5 { animation-delay: 380ms; }
        .stagger-6 { animation-delay: 460ms; }
        .stagger-7 { animation-delay: 540ms; }
        .stagger-8 { animation-delay: 620ms; }
      `,
        }}
      />

      {/* Background glow */}
      <div className="absolute top-[5%] left-[-5%] h-[300px] w-[300px] rounded-full bg-[#12a1c0]/5 blur-[80px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-[#00b494]/5 blur-[90px] pointer-events-none z-0 animate-pulse" />

      <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto">
        {/* ─── Hero Banner ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-[#0e172a] to-slate-900 p-8 md:p-10 text-white shadow-xl border border-slate-800/40">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12a1c0] to-[#00b494] shadow-lg shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 fill-current text-white"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z" />
                  </svg>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b494]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00b494] border border-[#00b494]/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00b494] animate-pulse" />
                    Dự án nghiên cứu IoT
                  </span>
                  <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white">
                    MoveMonitor{" "}
                    <span className="bg-gradient-to-r from-[#12a1c0] to-[#00b494] bg-clip-text text-transparent">
                      App
                    </span>
                  </h2>
                </div>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                Hệ thống IoT kết hợp ứng dụng Web giám sát hành trình toàn diện,
                phát hiện va chạm thời gian thực và phân tích dữ liệu thông minh
                — được thiết kế để tối ưu hóa sự an toàn cho phương tiện và
                người tham gia giao thông.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "IoT · GPS Tracking",
                  "Real-time Alerts",
                  "AI Motion Detection",
                  "Offline Support",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: "Tính năng", value: "8+", color: "text-cyan-400" },
                { label: "Công nghệ", value: "12+", color: "text-emerald-400" },
                { label: "Thành viên", value: "4", color: "text-purple-400" },
                { label: "Realtime", value: "< 1s", color: "text-amber-400" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center"
                >
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Features grid ─── */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-slate-100" />
            Tính năng hệ thống
            <span className="h-px flex-1 bg-slate-100" />
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group relative rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-300/60 animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-${(i % 8) + 1}`}
                >
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${f.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1.5 leading-tight">
                    {f.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Architecture ─── */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#00b494]" />
            Kiến trúc hệ thống
          </h3>

          <div className="grid gap-4 md:grid-cols-3 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-8 left-[32%] right-[32%] h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-cyan-200 z-0" />

            {[
              {
                icon: Cpu,
                color: "text-indigo-500",
                bg: "bg-indigo-50 border-indigo-200",
                num: "01",
                title: "Hardware IoT",
                desc: "ESP32 + MPU6050 + GPS Neo-6M thu thập tọa độ, gia tốc, con quay hồi chuyển và truyền lên cloud.",
              },
              {
                icon: Terminal,
                color: "text-emerald-500",
                bg: "bg-emerald-50 border-emerald-200",
                num: "02",
                title: "Cloud API & DB",
                desc: "NestJS Backend xác thực JWT, phân quyền Role-based. Firebase Realtime DB + Firestore lưu trữ.",
              },
              {
                icon: GitBranch,
                color: "text-cyan-500",
                bg: "bg-cyan-50 border-cyan-200",
                num: "03",
                title: "Web Dashboard",
                desc: "Next.js 15 hiển thị bản đồ Leaflet, biểu đồ Recharts, cảnh báo realtime và xuất báo cáo.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="group flex flex-col items-center text-center p-4 relative z-10 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 mb-3 transition-all duration-300 group-hover:scale-110 ${s.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Bước {s.num}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Tech stack ─── */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            Công nghệ sử dụng
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TECH_STACK.map((stack) => (
              <div
                key={stack.label}
                className={`rounded-xl border p-4 ${stack.color}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{stack.icon}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {stack.label}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {stack.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-slate-200/60 bg-white/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Team ─── */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <span className="h-px flex-1 bg-slate-100" />
            Nhóm thực hiện
            <span className="h-px flex-1 bg-slate-100" />
          </h3>

          {/* Nhóm trưởng — full width horizontal card */}
          {MEMBERS.filter((m) => m.isLead).map((member) => (
            <div
              key={member.name}
              className="mb-4 relative rounded-2xl border border-[#00b494]/25 bg-gradient-to-r from-[#00b494]/8 via-[#0fbbdc]/5 to-transparent p-5 shadow-sm overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#00b494]/5 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.gradient} blur-xl opacity-30`}
                  />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-white shadow-lg ring-4 ${member.ring}`}
                  >
                    <User className="h-7 w-7" />
                  </div>
                  {/* Crown badge */}
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                    <span className="text-[10px]">⭐</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-base font-extrabold text-slate-900">
                      {member.name}
                    </h4>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${member.badge}`}
                    >
                      Nhóm trưởng
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 max-w-xl">
                    {member.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wide shadow-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Role badge right side */}
                <div className="shrink-0 hidden sm:block text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#00b494] mb-1">
                    Vai trò
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {member.role.split(" · ").pop()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* 3 thành viên còn lại — 3 cột đều nhau */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MEMBERS.filter((m) => !m.isLead).map((member) => (
              <div
                key={member.name}
                className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Top: avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative shrink-0">
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.gradient} blur-md opacity-20`}
                    />
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-white shadow-md ring-2 ${member.ring}`}
                    >
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 leading-tight">
                      {member.name}
                    </p>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold mt-1 ${member.badge}`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Desc */}
                <p className="text-[11px] text-slate-500 leading-relaxed flex-1 mb-4">
                  {member.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {member.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
=======
'use client';

import { MapPin, Activity, Cpu, ShieldAlert, User, Terminal, Layers } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="relative w-full min-h-[calc(100vh-120px)] pb-10">
      
      {/* Embedded CSS for staggered delays */}
      <style dangerouslySetInnerHTML={{ __html: `
        .stagger-1 { animation-delay: 80ms; }
        .stagger-2 { animation-delay: 200ms; }
        .stagger-3 { animation-delay: 320ms; }
        .stagger-4 { animation-delay: 440ms; }
      ` }} />

      {/* Floating Blobs (adds extra subtle glowing depth in light theme) */}
      <div className="absolute top-[10%] left-[-5%] h-[280px] w-[280px] rounded-full bg-[#12a1c0]/5 blur-[75px] pointer-events-none z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-[#00b494]/5 blur-[90px] pointer-events-none z-10 animate-pulse duration-[8000ms]" />

      {/* Main Content (Aligned layout with z-20 on top of canvas and background) */}
      <div className="relative z-20 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl">
        
        {/* Header Section (Dark theme as requested) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-[#0e172a] to-slate-900 p-8 md:p-10 text-white shadow-xl border border-slate-800/40 transform hover:scale-[1.002] transition-all duration-500 ease-out">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00b494]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00b494] border border-[#00b494]/30 shadow-[0_2px_10px_rgba(0,180,148,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00b494] animate-pulse" />
              Dự án nghiên cứu IoT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              MoniMove <span className="bg-gradient-to-r from-[#12a1c0] to-[#00b494] bg-clip-text text-transparent">App</span>
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-400 font-medium font-normal">
              Hệ thống IoT kết hợp ứng dụng Web giám sát hành trình toàn diện và phát hiện va chạm thời gian thực,
              được thiết kế nhằm tối ưu hóa sự an toàn cho phương tiện và người tham gia giao thông.
            </p>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: GPS */}
          <div className="group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-300/60 hover:shadow-[0_12px_24px_-10px_rgba(18,161,192,0.12)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-1">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-110 group-hover:bg-cyan-100 group-hover:shadow-[0_4px_12px_rgba(6,182,212,0.15)] transition-all duration-300">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-cyan-600 transition-colors">Giám sát GPS thời gian thực</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thu thập liên tục tọa độ kinh độ, vĩ độ của thiết bị và cập nhật trực tiếp lên bản đồ số với tần suất cao.
            </p>
          </div>

          {/* Card 2: Crash Detection */}
          <div className="group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-red-300/60 hover:shadow-[0_12px_24px_-10px_rgba(239,68,68,0.12)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-2">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 group-hover:scale-110 group-hover:bg-red-100 group-hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] transition-all duration-300">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-red-500 transition-colors">Phân tích gia tốc & va chạm</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sử dụng thuật toán phân tích sự thay đổi đột ngột của gia tốc (IMU) để nhận diện va chạm hoặc ngã xe.
            </p>
          </div>

          {/* Card 3: Instant Alerts */}
          <div className="group relative rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-300/60 hover:shadow-[0_12px_24px_-10px_rgba(245,158,11,0.12)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-3">
            <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 group-hover:bg-amber-100 group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.15)] transition-all duration-300">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-amber-500 transition-colors">Cảnh báo khẩn cấp tức thời</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tự động gửi cảnh báo khẩn cấp (Alerts) lên dashboard và lưu trữ lịch sử để kịp thời ứng cứu khi có sự cố.
            </p>
          </div>
        </div>

        {/* System Architecture */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-both stagger-4">
          <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-[#00b494]" />
            Kiến trúc hệ thống hoạt động
          </h3>
          
          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connector lines on larger screens */}
            <div className="hidden md:block absolute top-10 left-[26%] w-[18%] border-t-2 border-dashed border-slate-200" />
            <div className="hidden md:block absolute top-10 left-[58%] w-[18%] border-t-2 border-dashed border-slate-200" />

            {/* Step 1 */}
            <div className="group flex flex-col items-center text-center p-2 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 font-bold mb-3 shadow-sm border border-slate-200/40 group-hover:scale-110 group-hover:border-indigo-300 transition-all duration-300">
                <Cpu className="h-5.5 w-5.5 text-indigo-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">1. Thiết bị IoT (Hardware)</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Khối phần cứng cảm biến (MPU6050, GPS Neo-6M) thu thập toạ độ và gia tốc góc.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group flex flex-col items-center text-center p-2 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 font-bold mb-3 shadow-sm border border-slate-200/40 group-hover:scale-110 group-hover:border-emerald-300 transition-all duration-300">
                <Terminal className="h-5 w-5 text-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">2. Cloud API & Database</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Dữ liệu được gửi lên NestJS Backend qua HTTP/REST, rồi đồng bộ và lưu trữ tại Cloud Firestore.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group flex flex-col items-center text-center p-2 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 font-bold mb-3 shadow-sm border border-slate-200/40 group-hover:scale-110 group-hover:border-cyan-300 transition-all duration-300">
                <Layers className="h-5 w-5 text-cyan-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">3. Web Dashboard</h4>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Frontend Next.js vẽ biểu đồ hành trình, cập nhật thời gian thực và tự động phát âm thanh cảnh báo.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Profile Section */}
        <div className="rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-md p-6 shadow-sm max-w-2xl transform hover:shadow-md transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Thông tin thực hiện</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12a1c0] to-[#00b494] blur-sm opacity-25 group-hover:opacity-50 transition-opacity" />
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#12a1c0] to-[#00b494] text-white shadow-md border border-white/20">
                <User className="h-8 w-8" />
              </div>
            </div>
            
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">Nguyễn Trọng Thức</h4>
                <span className="inline-block rounded-full bg-[#12a1c0]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#12a1c0] border border-[#12a1c0]/20">
                  Software & IoT Developer
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium font-normal leading-relaxed">
                Chịu trách nhiệm thiết kế mô-đun phần cứng IoT, viết API xác thực bảo mật và lập trình ứng dụng bản đồ Web Dashboard.
              </p>
              <div className="pt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Đồ án nghiên cứu tốt nghiệp khoa học công nghệ
              </div>
            </div>
          </div>
        </div>

>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      </div>
    </div>
  );
}
