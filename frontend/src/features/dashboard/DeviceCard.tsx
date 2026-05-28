import React from 'react';
import { MapPin, Navigation, Rotate3D, Activity, Satellite } from 'lucide-react';
import mockData from '../../shared/mock-data/devices.json';

export default function DeviceCard() {
  // Lấy thiết bị đầu tiên từ file mock data
  const device = mockData[0];

  return (
    <div className="max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{device.name}</h2>
        <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
          {device.status}
        </span>
      </div>

      <div className="space-y-4">
        {/* Khu vực hiển thị GPS */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="flex items-center text-blue-800 font-semibold mb-2">
            <MapPin className="w-5 h-5 mr-2" /> Dữ liệu GPS
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p><strong>Vĩ độ (Lat):</strong> {device.gps.latitude}</p>
            <p><strong>Kinh độ (Lng):</strong> {device.gps.longitude}</p>
            <p className="flex items-center"><Navigation className="w-4 h-4 mr-1 text-gray-500"/> {device.gps.speed} km/h</p>
            <p className="flex items-center"><Satellite className="w-4 h-4 mr-1 text-gray-500"/> {device.gps.satellites} vệ tinh</p>
          </div>
        </div>

        {/* Khu vực hiển thị MPU6050 */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="flex items-center text-purple-800 font-semibold mb-2">
            <Rotate3D className="w-5 h-5 mr-2" /> Góc nghiêng (MPU6050)
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-700 text-center">
            <div className="bg-white p-2 rounded border border-purple-100">
              <p className="text-xs text-gray-500">Pitch</p>
              <p className="font-bold">{device.mpu6050.pitch}°</p>
            </div>
            <div className="bg-white p-2 rounded border border-purple-100">
              <p className="text-xs text-gray-500">Roll</p>
              <p className="font-bold">{device.mpu6050.roll}°</p>
            </div>
            <div className="bg-white p-2 rounded border border-purple-100">
              <p className="text-xs text-gray-500">Yaw</p>
              <p className="font-bold">{device.mpu6050.yaw}°</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-purple-200">
             <p className="flex items-center text-xs text-gray-500">
               <Activity className="w-4 h-4 mr-1"/>
               Gia tốc (m/s²): X: {device.mpu6050.acceleration.x} | Y: {device.mpu6050.acceleration.y} | Z: {device.mpu6050.acceleration.z}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}