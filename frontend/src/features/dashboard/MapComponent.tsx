'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import { MapPin, Navigation, Layers, Gauge, Shield, Clock, Route } from 'lucide-react';
import { getCurrentPosition, getDeviceRoute, getDeviceInfo } from '../../services/api';
import L from 'leaflet';

// Dynamic imports
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });

import 'leaflet/dist/leaflet.css';

const MAP_STYLES = {
  standard: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap'
  },
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  }
};

export default function MapComponent() {
  const deviceId = 'device-001';
  const [centerPosition, setCenterPosition] = useState<[number, number]>([10.7769, 106.7009]);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('standard');
  const [showRoute, setShowRoute] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([10.8100, 106.7400]);
  const [speed, setSpeed] = useState(45);
  const [distance, setDistance] = useState(12.5);
  const [duration, setDuration] = useState('18 phút');
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);

  // Fetch device data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviceInfo = await getDeviceInfo(deviceId);
        console.log('Device info:', deviceInfo);

        const position = await getCurrentPosition(deviceId);
        setCurrentPosition([position.lat, position.lng]);
        setCenterPosition([position.lat, position.lng]);
        if (position.speed) setSpeed(position.speed);

        const route = await getDeviceRoute(deviceId);
        setWaypoints(route.waypoints);
        if (route.distance) setDistance(route.distance / 1000);
        if (route.duration) setDuration(`${Math.round(route.duration / 60)} phút`);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const interval = setInterval(async () => {
      try {
        const position = await getCurrentPosition(deviceId);
        setCurrentPosition([position.lat, position.lng]);
        if (position.speed) setSpeed(position.speed);
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deviceId]);

  // Fetch route from OSRM when waypoints change
  useEffect(() => {
    if (waypoints.length === 0) return;

    const fetchRoute = async () => {
      setIsLoadingRoute(true);
      try {
        const coords = waypoints.map(point => `${point[1]},${point[0]}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoordinates(coordinates);
        } else {
          setRouteCoordinates(waypoints);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        setRouteCoordinates(waypoints);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [waypoints]);

  const customIcon = useMemo(() => {
    if (typeof window !== 'undefined') {
      return L.divIcon({
        className: 'custom-device-icon',
        html: `
          <div style="
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #00b494 0%, #12a1c0 100%);
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 6px 20px rgba(0, 180, 148, 0.5), 0 0 0 8px rgba(0, 180, 148, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
            position: relative;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 4a3 3 0 100 6 3 3 0 000-6z"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); box-shadow: 0 6px 20px rgba(0, 180, 148, 0.5), 0 0 0 8px rgba(0, 180, 148, 0.1); }
              50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(0, 180, 148, 0.6), 0 0 0 12px rgba(0, 180, 148, 0.15); }
            }
          </style>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
    }
    return null;
  }, []);

  if (!customIcon) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold text-lg">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <MapContainer 
        center={centerPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer attribution={MAP_STYLES[mapStyle].attribution} url={MAP_STYLES[mapStyle].url} />
        
        {showSafeZone && (
          <Circle
            center={currentPosition}
            radius={500}
            pathOptions={{ color: '#00b494', fillColor: '#00b494', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }}
          />
        )}
        
        {showRoute && routeCoordinates.length > 0 && (
          <>
            <Polyline 
              positions={routeCoordinates} 
              pathOptions={{ 
                color: '#2563eb', 
                weight: 6, 
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
              }} 
            />
            <Polyline 
              positions={routeCoordinates} 
              pathOptions={{ 
                color: '#1e40af', 
                weight: 8, 
                opacity: 0.4,
                lineJoin: 'round',
                lineCap: 'round'
              }} 
            />
            {waypoints.slice(0, -1).map((point, index) => (
              <Circle 
                key={index} 
                center={point} 
                radius={80} 
                pathOptions={{ 
                  color: index === 0 ? '#10b981' : '#6366f1', 
                  fillColor: index === 0 ? '#10b981' : '#6366f1', 
                  fillOpacity: 0.3, 
                  weight: 3 
                }} 
              />
            ))}
          </>
        )}
        
        <Marker position={currentPosition} icon={customIcon}>
          <Popup>
            <div className="text-sm font-sans p-2 min-w-[220px]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-bold text-[#00b494] text-base">MoniMove - 01</p>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono">{currentPosition[0].toFixed(4)}°N, {currentPosition[1].toFixed(4)}°E</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-500" />
                  <span>Tốc độ: <strong>{speed} km/h</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-purple-500" />
                  <span>Quãng đường: <strong>{distance} km</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Thời gian: <strong>{duration}</strong></span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200">
                <p className="text-green-600 font-semibold text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Đang kết nối - An toàn
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {isLoadingRoute && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-700 font-semibold">Đang tính toán đường đi...</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">MoniMove - 01</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-semibold">Đang hoạt động</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-semibold">Tốc độ</span>
            </div>
            <p className="text-xl font-black text-blue-700">{speed} <span className="text-sm">km/h</span></p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <Route className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-semibold">Quãng đường</span>
            </div>
            <p className="text-xl font-black text-purple-700">{distance} <span className="text-sm">km</span></p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-600 font-semibold">Thời gian</span>
            </div>
            <p className="text-lg font-black text-orange-700">{duration}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">Trạng thái</span>
            </div>
            <p className="text-sm font-bold text-green-700">An toàn</p>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span className="text-sm font-bold">Kiểu bản đồ</span>
        </div>
        <div className="p-2 space-y-1">
          {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                mapStyle === style
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {MAP_STYLES[style].name}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowRoute(!showRoute)}
          className={`px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl transition-all flex items-center gap-2 ${
            showRoute
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200'
          }`}
        >
          <Route className="w-4 h-4" />
          {showRoute ? 'Ẩn lộ trình' : 'Hiện lộ trình'}
        </button>
        
        <button
          onClick={() => setShowSafeZone(!showSafeZone)}
          className={`px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl transition-all flex items-center gap-2 ${
            showSafeZone
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : 'bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          {showSafeZone ? 'Ẩn vùng an toàn' : 'Hiện vùng an toàn'}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-cyan-600" />
          <h4 className="font-bold text-slate-900">Vị trí hiện tại</h4>
        </div>
        <p className="text-sm text-slate-600 font-mono mb-1">
          {currentPosition[0].toFixed(6)}°N
        </p>
        <p className="text-sm text-slate-600 font-mono mb-2">
          {currentPosition[1].toFixed(6)}°E
        </p>
        <p className="text-xs text-slate-500">
          📍 Ho Chi Minh City, Vietnam
        </p>
        {routeCoordinates.length > 0 && (
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            Đường đi thực tế ({routeCoordinates.length} điểm)
          </p>
        )}
      </div>
    </div>
  );
}
