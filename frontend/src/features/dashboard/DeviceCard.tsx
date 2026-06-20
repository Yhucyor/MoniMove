"use client";

import { useState } from "react";
import {
  MapPin,
  Navigation,
  Rotate3D,
  Activity,
  Satellite,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Tag,
  Volume2,
  VolumeX,
  AlertTriangle,
} from "lucide-react";
import { DeviceInfo } from "../../services/api";
import { getConnectionStatus, formatLastSeen } from "../../utils/deviceStatus";

interface DeviceCardProps {
  device: DeviceInfo;
  viewMode?: "grid" | "list";
}

function calcTiltAngles(
  accel: { x: number; y: number; z: number } | undefined,
): { pitch: number; roll: number } {
  if (!accel) return { pitch: 0, roll: 0 };
  const { x, y, z } = accel;
  const total = Math.sqrt(x * x + y * y + z * z);
  if (total === 0) return { pitch: 0, roll: 0 };
  const pitch = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
  const roll = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
  return { pitch, roll };
}

function calcTotalAccel(
  accel: { x: number; y: number; z: number } | undefined,
): number {
  if (!accel) return 0;
  return Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
}

const renderProgressBar = (
  label: string,
  value: number,
  max: number,
  unit: string = "°",
) => {
  const absValue = Math.abs(value);
  const percentage = Math.min(100, (absValue / max) * 100);

  let colorClass = "bg-emerald-500";
  let textClass = "text-emerald-600";
  if (percentage > 60) {
    colorClass = "bg-red-500";
    textClass = "text-red-600";
  } else if (percentage > 30) {
    colorClass = "bg-amber-500";
    textClass = "text-amber-600";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={textClass}>
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function DeviceCard({
  device,
  viewMode = "grid",
}: DeviceCardProps) {
  const gps = device.current_data?.gps;
  const mpu = device.current_data?.mpu6050;

  const isTilted = mpu?.is_tilted ?? false;
  const buzzerActive = device.current_data?.buzzer || (device as any).controls?.buzzer || isTilted || false;

  // Ưu tiên GPS updated_at (realtime nhất), sau đó lastUpdate, rồi connectionStatus từ API
  const gpsUpdatedAt = gps?.updated_at ? gps.updated_at * 1000 : undefined;
  const effectiveLastUpdate = gpsUpdatedAt || device.lastUpdate;

  // connectionStatus được tính sẵn trong firebaseRealtime.ts (nguồn duy nhất)
  // Ưu tiên dùng connectionStatus từ API; chỉ fallback về getConnectionStatus
  // nếu không có (tránh tính lại và có nguy cơ đảo ngược)
  const conn: "online" | "offline" | "unknown" =
    device.connectionStatus === "online"
      ? "online"
      : device.connectionStatus === "offline"
        ? "offline"
        : getConnectionStatus(effectiveLastUpdate, undefined, device.status);

  const isOnline = conn === "online";

  const { pitch, roll } = calcTiltAngles(mpu?.accel);
  const yaw = mpu?.gyro?.z ?? 0;

  const totalAccelMs2 = calcTotalAccel(mpu?.accel);
  const totalAccelG = totalAccelMs2 / 9.81;
  const dynamicG = Math.abs(totalAccelG - 1.0);
  const maxTilt = Math.max(Math.abs(pitch), Math.abs(roll));

  const speedKmh = gps?.speed ?? 0;

  // Trạng thái tổng thể: AN TOÀN / CẢNH BÁO / NGUY HIỂM
  let overallStatus: "AN TOÀN" | "CẢNH BÁO" | "NGUY HIỂM" = "AN TOÀN";
  if (isTilted || maxTilt > 60 || dynamicG > 2.5 || speedKmh >= 100) {
    overallStatus = "NGUY HIỂM";
  } else if (maxTilt > 30 || dynamicG > 1.5 || speedKmh >= 80) {
    overallStatus = "CẢNH BÁO";
  }

  const isList = viewMode === "list";

  return (
    <div
      className={`group relative overflow-hidden rounded-[32px] border border-slate-200/50 bg-white/90 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl hover:border-cyan-300/40 transition-all duration-500 ease-out transform hover:-translate-y-1 ${isList ? "w-full flex flex-col md:flex-row gap-6" : "w-full flex flex-col"}`}
    >
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

      {/* HEADER */}
      <div
        className={`mb-4 flex items-start justify-between border-slate-100 pb-4 ${isList ? "md:w-1/4 md:border-r md:border-b-0 md:pr-4 md:mb-0" : "border-b"}`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              {device.id}
            </span>
            {(device as any).licensePlate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                <Tag className="h-2.5 w-2.5" />
                {(device as any).licensePlate}
              </span>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">
            {device.name}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Badge Trực tuyến / Ngoại tuyến — isOnline = true khi lastSeen <= 30s */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isOnline
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/40"
                : "bg-slate-100 text-slate-500 border border-slate-200/40"
            }`}
          >
            {isOnline ? "🟢 Trực tuyến" : "🔴 Ngoại tuyến"}
          </span>
          {/* Badge Trạng thái */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              overallStatus === "NGUY HIỂM"
                ? "bg-red-50 text-red-600 border border-red-200/40 animate-pulse"
                : overallStatus === "CẢNH BÁO"
                  ? "bg-amber-50 text-amber-600 border border-amber-200/40"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200/40"
            }`}
          >
            {overallStatus === "NGUY HIỂM" ? (
              <ShieldAlert className="w-3 h-3" />
            ) : overallStatus === "CẢNH BÁO" ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <ShieldCheck className="w-3 h-3" />
            )}
            {overallStatus}
          </span>
        </div>
      </div>

      {/* SENSOR DATA & STATUS */}
      <div
        className={`space-y-4 ${isList ? "flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 space-y-0" : ""}`}
      >
        {/* GPS Panel */}
        <div className="rounded-[24px] border border-cyan-100/50 bg-gradient-to-br from-cyan-50/50 via-white to-transparent p-5 relative overflow-hidden group/gps">
          <div className="absolute right-2 top-2 h-20 w-20 opacity-5 group-hover/gps:scale-110 transition-transform duration-500">
            <MapPin className="h-full w-full text-cyan-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <h4 className="flex items-center text-xs font-extrabold text-cyan-700 uppercase tracking-wider">
              <MapPin className="mr-1.5 h-4 w-4 text-cyan-600" /> Định vị GPS
            </h4>
          </div>
          {gps ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/80 border border-slate-100 rounded-xl px-4 py-3 relative shadow-sm">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-ping absolute left-4" />
                <div className="h-2 w-2 rounded-full bg-cyan-600 absolute left-4" />
                <div className="pl-6 grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      Vĩ độ
                    </p>
                    <p className="font-bold text-slate-800 font-mono text-sm">
                      {gps.latitude.toFixed(6)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                      Kinh độ
                    </p>
                    <p className="font-bold text-slate-800 font-mono text-sm">
                      {gps.longitude.toFixed(6)}°
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm ${speedKmh >= 80 ? "bg-red-50 border-red-100" : "bg-white border-slate-100"}`}
                >
                  <div
                    className={`p-2 rounded-full ${speedKmh >= 80 ? "bg-red-100" : "bg-blue-50"}`}
                  >
                    <Navigation
                      className={`h-4 w-4 ${speedKmh >= 80 ? "text-red-600" : "text-blue-600"}`}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Tốc độ
                    </p>
                    <p
                      className={`font-black text-base ${speedKmh >= 80 ? "text-red-600" : "text-blue-700"}`}
                    >
                      {speedKmh.toFixed(0)}{" "}
                      <span className="text-[10px] font-semibold">km/h</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="p-2 rounded-full bg-indigo-50">
                    <Satellite className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Vệ tinh
                    </p>
                    <p className="font-black text-base text-indigo-700">
                      {gps.satellites ?? "—"}{" "}
                      <span className="text-[10px] font-semibold">sats</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
              <MapPin className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs font-semibold">
                Chưa nhận được tín hiệu GPS
              </p>
            </div>
          )}
        </div>

        {/* Cảm biến MPU6050 Panel */}
        <div
          className={`rounded-[24px] border p-5 transition-colors duration-300 relative overflow-hidden group/imu ${
            overallStatus === "NGUY HIỂM"
              ? "border-red-200 bg-red-50/40"
              : overallStatus === "CẢNH BÁO"
                ? "border-amber-200 bg-amber-50/40"
                : "border-purple-100/50 bg-gradient-to-br from-purple-50/40 via-white to-transparent"
          }`}
        >
          <div className="absolute right-2 top-2 h-20 w-20 opacity-5 group-hover/imu:rotate-12 transition-transform duration-500">
            <Rotate3D
              className={`h-full w-full ${overallStatus === "NGUY HIỂM" ? "text-red-500" : "text-purple-500"}`}
            />
          </div>
          <div className="flex justify-between items-start mb-4">
            <h4
              className={`flex items-center text-xs font-extrabold uppercase tracking-wider ${overallStatus === "NGUY HIỂM" ? "text-red-700" : "text-purple-700"}`}
            >
              <Rotate3D className="mr-1.5 h-4 w-4" /> Dữ liệu cảm biến
            </h4>
            <div
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                buzzerActive
                  ? "bg-red-500 text-white border-red-600 animate-pulse"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {buzzerActive ? (
                <Volume2 className="w-3 h-3" />
              ) : (
                <VolumeX className="w-3 h-3" />
              )}
              {buzzerActive ? "Còi báo động Bật" : "Còi báo động Tắt"}
            </div>
          </div>

          {mpu ? (
            <div className="space-y-4 relative z-10">
              <div className="bg-white/80 border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                {renderProgressBar("Góc nghiêng trước/sau", pitch, 90)}
                {renderProgressBar("Góc nghiêng trái/phải", roll, 90)}
                {renderProgressBar("Góc xoay", yaw, 360, "°/s")}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border bg-white px-4 py-3 shadow-sm ${dynamicG > 1.5 ? "border-red-200" : "border-slate-100"}`}
                >
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Activity className="h-3 w-3" /> Gia tốc va chạm
                  </p>
                  <p
                    className={`font-black text-base ${dynamicG > 1.5 ? "text-red-600" : "text-slate-700"}`}
                  >
                    {totalAccelG.toFixed(2)}
                    <span className="text-[10px] font-semibold ml-0.5">G</span>
                  </p>
                </div>
                <div
                  className={`rounded-xl border bg-white px-4 py-3 shadow-sm ${isTilted ? "border-red-200" : "border-slate-100"}`}
                >
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <ShieldAlert className="h-3 w-3" /> Trạng thái ngã
                  </p>
                  <p
                    className={`font-black text-base ${isTilted ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {isTilted ? "Ngã đổ" : "An toàn"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
              <Rotate3D className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs font-semibold">
                Chưa nhận được tín hiệu cảm biến
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 ${isList ? "xl:col-span-2" : ""}`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Cập nhật: {formatLastSeen(device.lastUpdate)}</span>
          </div>
          <span className="font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            {device.lastUpdate
              ? new Date(device.lastUpdate).toLocaleTimeString("vi-VN")
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
