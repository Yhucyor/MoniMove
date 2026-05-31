import { MapPin, Navigation, Rotate3D, Activity, Satellite } from 'lucide-react';
import mockData from '../../shared/mock-data/devices.json';

export default function DeviceCard() {
  const device = mockData[0];

  return (
    <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">{device.name}</h2>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          {device.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 flex items-center font-semibold text-blue-800">
            <MapPin className="mr-2 h-5 w-5" /> Dữ liệu GPS
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p><strong>Vĩ độ (Lat):</strong> {device.gps.latitude}</p>
            <p><strong>Kinh độ (Lng):</strong> {device.gps.longitude}</p>
            <p className="flex items-center"><Navigation className="mr-1 h-4 w-4 text-gray-500" /> {device.gps.speed} km/h</p>
            <p className="flex items-center"><Satellite className="mr-1 h-4 w-4 text-gray-500" /> {device.gps.satellites} vệ tinh</p>
          </div>
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <h3 className="mb-2 flex items-center font-semibold text-purple-800">
            <Rotate3D className="mr-2 h-5 w-5" /> Góc nghiêng (MPU6050)
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-700">
            <div className="rounded border border-purple-100 bg-white p-2">
              <p className="text-xs text-gray-500">Pitch</p>
              <p className="font-bold">{device.mpu6050.pitch}°</p>
            </div>
            <div className="rounded border border-purple-100 bg-white p-2">
              <p className="text-xs text-gray-500">Roll</p>
              <p className="font-bold">{device.mpu6050.roll}°</p>
            </div>
            <div className="rounded border border-purple-100 bg-white p-2">
              <p className="text-xs text-gray-500">Yaw</p>
              <p className="font-bold">{device.mpu6050.yaw}°</p>
            </div>
          </div>

          <div className="mt-3 border-t border-purple-200 pt-3">
            <p className="flex items-center text-xs text-gray-500">
              <Activity className="mr-1 h-4 w-4" />
              Gia tốc (m/s²): X: {device.mpu6050.acceleration.x} | Y: {device.mpu6050.acceleration.y} | Z: {device.mpu6050.acceleration.z}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
