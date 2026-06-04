'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../src/services/firebase';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface DeviceData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed?: number;
  status?: string;
  battery?: number;
  lastUpdate?: number;
}

export default function TestFirebasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [error, setError] = useState<string>('');
  const [dbStructure, setDbStructure] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check database reference
        const dbRef = ref(db, 'tracking_system');
        
        // Test 2: Try to read data
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setDbStructure(data);
          
          // Test 3: Parse devices
          if (data.devices) {
            const devicesList: DeviceData[] = [];
            Object.keys(data.devices).forEach(deviceId => {
              const device = data.devices[deviceId];
              const gps = device.current_data?.gps || {};
              const info = device.info || {};
              
              devicesList.push({
                id: deviceId,
                name: info.device_name || info.license_plate || deviceId,
                lat: gps.latitude || 0,
                lng: gps.longitude || 0,
                speed: gps.speed || 0,
                status: info.status || 'unknown',
                battery: device.current_data?.battery || 0,
                lastUpdate: info.last_ping || 0,
              });
            });
            
            setDevices(devicesList);
          }
          
          setStatus('success');
        } else {
          setError('Database structure "tracking_system" not found');
          setStatus('error');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setStatus('error');
      }
    };

    testConnection();

    // Setup realtime listener
    const dbRef = ref(db, 'tracking_system/devices');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const devicesList: DeviceData[] = [];
        
        Object.keys(data).forEach(deviceId => {
          const device = data[deviceId];
          const gps = device.current_data?.gps || {};
          const info = device.info || {};
          
          devicesList.push({
            id: deviceId,
            name: info.device_name || info.license_plate || deviceId,
            lat: gps.latitude || 0,
            lng: gps.longitude || 0,
            speed: gps.speed || 0,
            status: info.status || 'unknown',
            battery: device.current_data?.battery || 0,
            lastUpdate: info.last_ping || 0,
          });
        });
        
        setDevices(devicesList);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Quay lại</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-slate-900">
              🔥 Firebase Connection Test
            </h1>
            
            <div className="w-24"></div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-xl">
            {status === 'loading' && (
              <>
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-slate-700 font-semibold">Đang kết nối Firebase...</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-green-700 font-semibold">Kết nối thành công!</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="text-red-700 font-semibold">Lỗi kết nối</span>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 font-mono text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Database Structure */}
        {dbStructure && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">📊 Database Structure</h2>
            <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-96">
              <pre className="text-green-400 text-xs font-mono">
                {JSON.stringify(dbStructure, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Devices List */}
        {devices.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              📍 Devices ({devices.length})
            </h2>
            
            <div className="space-y-3">
              {devices.map(device => (
                <div 
                  key={device.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        device.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      <h3 className="font-bold text-slate-900">{device.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {device.id}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">GPS:</span>
                        <span className="ml-2 font-mono text-slate-700">
                          {device.lat.toFixed(5)}, {device.lng.toFixed(5)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Speed:</span>
                        <span className="ml-2 font-bold text-blue-600">
                          {device.speed} km/h
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Battery:</span>
                        <span className="ml-2 font-bold text-green-600">
                          {device.battery}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <span className={`ml-2 font-bold ${
                          device.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-blue-900 mb-2">ℹ️ Connection Info</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Database URL:</strong> {process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}</p>
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            <p><strong>Structure:</strong> tracking_system/devices/[deviceId]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
