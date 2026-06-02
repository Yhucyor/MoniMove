import { MapPin, Navigation, Rotate3D, Activity, Satellite, Battery, ShieldAlert, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { DeviceInfo } from '../../services/api';

interface DeviceCardProps {
  device: DeviceInfo;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const gps = device.current_data?.gps;
  const mpu = device.current_data?.mpu6050;
  
  // Determine battery color based on level
  const batteryLevel = device.battery || 85;
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-[#00b494] bg-[#00b494]/10 border-[#00b494]/20';
    if (level > 20) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse';
  };

  // Determine status color
  const isTilted = mpu?.is_tilted || false;
  const status = device.status === 'active' ? 'online' : 'offline';

  return (
    <div className="group relative w-full overflow-hidden rounded-[24px] border border-slate-200/50 bg-white/75 backdrop-blur-xl p-6 shadow-md hover:shadow-xl hover:border-cyan-300/40 transition-all duration-500 ease-out transform hover:-translate-y-1">
      {/* Background radial glow */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
      
      {/* Card Header */}
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{device.id}</span>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">{device.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isTilted 
              ? 'bg-red-50 text-red-500 border border-red-200/40 animate-pulse'
              : status === 'online'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40'
                : 'bg-slate-50 text-slate-400 border border-slate-200/40'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              isTilted ? 'bg-red-500' : status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
            }`} />
            {isTilted ? 'Báo động ngã' : status}
          </span>
          
          {/* Battery Badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${getBatteryColor(batteryLevel)}`}>
            <Battery className="h-3.5 w-3.5" />
            {batteryLevel}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* GPS Section */}
        <div className="rounded-2xl border border-cyan-100/30 bg-gradient-to-br from-cyan-50/40 via-white/80 to-transparent p-4 shadow-[0_4px_12px_-5px_rgba(18,161,192,0.05)]">
          <div className="mb-2.5 flex items-center justify-between">
            <h4 className="flex items-center text-xs font-bold text-cyan-800 uppercase tracking-wider">
              <MapPin className="mr-1.5 h-4 w-4 text-cyan-600" /> Dữ liệu định vị GPS
            </h4>
            {gps && (
              <a 
                href={`https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 hover:text-cyan-800 hover:underline transition-all"
              >
                Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          
          {gps ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Vĩ độ (Latitude)</span>
                <p className="font-bold text-slate-800 font-mono text-[11px]">{gps.latitude.toFixed(6)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Kinh độ (Longitude)</span>
                <p className="font-bold text-slate-800 font-mono text-[11px]">{gps.longitude.toFixed(6)}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/60 border border-slate-100/50 p-1.5 font-bold text-slate-700">
                <Navigation className="h-3.5 w-3.5 text-slate-400 rotate-45" />
                <span>{gps.speed?.toFixed(1) || 0} km/h</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/60 border border-slate-100/50 p-1.5 font-bold text-slate-700">
                <Satellite className="h-3.5 w-3.5 text-slate-400" />
                <span>{gps.satellites || 0} Vệ tinh</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Không tìm thấy tọa độ GPS mới nhất.</p>
          )}
        </div>

        {/* IMU MPU6050 Section */}
        <div className={`rounded-2xl border p-4 transition-colors duration-500 ${
          isTilted 
            ? 'border-red-200/50 bg-red-50/20' 
            : 'border-purple-100/30 bg-gradient-to-br from-purple-50/40 via-white/80 to-transparent'
        }`}>
          <h4 className="mb-2.5 flex items-center text-xs font-bold text-purple-800 uppercase tracking-wider">
            <Rotate3D className="mr-1.5 h-4 w-4 text-purple-600" /> Cảm biến IMU MPU6050
          </h4>
          
          {/* Tilt Alert Box */}
          <div className={`mb-3 flex items-center gap-2 rounded-xl border p-2.5 transition-all ${
            isTilted 
              ? 'bg-red-50 border-red-200 text-red-700 shadow-sm animate-pulse'
              : 'bg-emerald-50/40 border-emerald-100/50 text-emerald-700'
          }`}>
            {isTilted ? (
              <>
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">Ngã đổ nguy hiểm! Cần hỗ trợ!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Độ nghiêng an toàn</span>
              </>
            )}
          </div>

          {mpu ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl border border-purple-100 bg-white p-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Pitch</p>
                  <p className="font-extrabold text-purple-700">{mpu.gyro?.x?.toFixed(1) || 0}°</p>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Roll</p>
                  <p className="font-extrabold text-purple-700">{mpu.gyro?.y?.toFixed(1) || 0}°</p>
                </div>
                <div className="rounded-xl border border-purple-100 bg-white p-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Yaw</p>
                  <p className="font-extrabold text-purple-700">{mpu.gyro?.z?.toFixed(1) || 0}°</p>
                </div>
              </div>

              <div className="border-t border-purple-100/50 pt-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                  <span className="flex items-center gap-1 uppercase">
                    <Activity className="h-3.5 w-3.5 text-purple-400" /> Gia tốc (m/s²)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center bg-white/40 border border-slate-100/50 rounded-lg p-1">
                  <div>X: <strong className="text-slate-700">{mpu.accel?.x?.toFixed(2) || 0}</strong></div>
                  <div>Y: <strong className="text-slate-700">{mpu.accel?.y?.toFixed(2) || 0}</strong></div>
                  <div>Z: <strong className="text-slate-700">{mpu.accel?.z?.toFixed(2) || 0}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Không tìm thấy dữ liệu IMU mới nhất.</p>
          )}
        </div>

        {/* Footer Timestamp */}
        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
          <Clock className="h-3 w-3" />
          <span>Cập nhật: {new Date(device.lastUpdate || Date.now()).toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}
