// 'use client';

import dynamic from 'next/dynamic';
import { subscribeDevicePosition, subscribeDeviceRoute } from '../services/firebaseRealtime';
import { useMemo, useState, useEffect } from 'react';
import { getCurrentPosition } from '../services/firebaseRealtime';
import MapSearchBar from './MapSearchBar';
import { SearchResult } from './types';

// Import required icons
import {
  MapPin,
  Navigation,
  Layers,
  Gauge,
  Shield,
  Clock,
  Route,
  Locate,
  X,
  Plus,
  Minus,
  RefreshCw,
  Compass,
  Crosshair,
  ExternalLink,
} from 'lucide-react';


import L from 'leaflet';
import { useMap } from 'react-leaflet';

// Dynamic imports for react-leaflet components (SSR disabled)
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
    attribution: '&copy; OpenStreetMap',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
  },
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB',
  },
};

interface MapComponentProps {
  showRoute?: boolean;
  showSafeZone?: boolean;
  deviceId?: string;
}

export default function MapComponent({ showRoute = true, showSafeZone = true, deviceId = 'DEVICE_ESP32_01' }: MapComponentProps) {
  const [centerPosition, setCenterPosition] = useState<[number, number]>([10.7769, 106.7009]);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedPoi, setSearchedPoi] = useState<SearchResult | null>(null);

  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('standard');
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([10.8045, 106.7380]);
  const [speed, setSpeed] = useState(45);
  const [isDanger, setIsDanger] = useState(false);
  const [distance, setDistance] = useState(12.5);
  const [duration, setDuration] = useState('18 phút');
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [showMapStyleMenu, setShowMapStyleMenu] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [userToDeviceRoute, setUserToDeviceRoute] = useState<[number, number][]>([]);
  const [isLoadingUserRoute, setIsLoadingUserRoute] = useState(false);
  const [userRouteDistance, setUserRouteDistance] = useState<number | null>(null);
  const [userRouteDuration, setUserRouteDuration] = useState<string | null>(null);

  // Detect danger: high speed or critical alerts triggers red border
  useEffect(() => {
    setIsDanger(speed >= 80);
  }, [speed]);

  const [showStraightLine, setShowStraightLine] = useState(false);

  // Recenter map when user position updates
  useEffect(() => {
    if (userPosition && mapInstance) {
      setCenterPosition(userPosition);
      mapInstance.setView(userPosition, mapInstance.getZoom(), { animate: true });
    }
  }, [userPosition, mapInstance]);

  // Ensure map recenters when the map instance becomes available after a position has already been set
  useEffect(() => {
    if (mapInstance && userPosition) {
      setCenterPosition(userPosition);
      mapInstance.setView(userPosition, mapInstance.getZoom(), { animate: true });
    }
  }, [mapInstance, userPosition]);



  // Remove previous fetch logic and use realtime listeners
  useEffect(() => {
    const unsubPos = subscribeDevicePosition(deviceId, (pos) => {
      setCurrentPosition([pos.lat, pos.lng]);
      setCenterPosition([pos.lat, pos.lng]);
      if (pos.speed) setSpeed(pos.speed);
    });
    const unsubRoute = subscribeDeviceRoute(deviceId, (route) => {
      setWaypoints(route.waypoints);
      if (route.distance) setDistance(route.distance / 1000); // meters → km
      if (route.duration) {
        const mins = Math.round(route.duration / 60);
        setDuration(mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}p` : `${mins} phút`);
      }
    });
    return () => {
      unsubPos();
      unsubRoute();
    };
  }, [deviceId]);




  // Fetch route polyline from waypoints
  useEffect(() => {
    if (waypoints.length === 0) return;
    const fetchRoute = async () => {
      setIsLoadingRoute(true);
      try {
        const coords = waypoints.map((p) => `${p[1]},${p[0]}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
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

  // User to device route
  useEffect(() => {
    if (!userPosition || !currentPosition) {
      setUserToDeviceRoute([]);
      setUserRouteDistance(null);
      setUserRouteDuration(null);
      return;
    }
    const fetchUserRoute = async () => {
      setIsLoadingUserRoute(true);
      try {
        const start = `${userPosition[1]},${userPosition[0]}`;
        const end = `${currentPosition[1]},${currentPosition[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const routeObj = data.routes[0];
          const coordinates = routeObj.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setUserToDeviceRoute(coordinates);
          if (routeObj.distance) setUserRouteDistance(routeObj.distance / 1000);
          if (routeObj.duration) {
            const mins = Math.round(routeObj.duration / 60);
            if (mins >= 60) {
              const hrs = Math.floor(mins / 60);
              const remainingMins = mins % 60;
              setUserRouteDuration(`${hrs}h ${remainingMins}p`);
            } else {
              setUserRouteDuration(`${mins} phút`);
            }
          }
        } else {
          setUserToDeviceRoute([userPosition, currentPosition]);
        }
      } catch (error) {
        console.error('Error fetching user route:', error);
        setUserToDeviceRoute([userPosition, currentPosition]);
      } finally {
        setIsLoadingUserRoute(false);
      }
    };
    fetchUserRoute();
  }, [userPosition, currentPosition]);

  // Auto‑detect user position on mount (permission handling)
  useEffect(() => {
    // Request location permission on mount
    navigator.geolocation.getCurrentPosition(
      () => console.log('GPS permission granted'),
      (err) => console.warn('GPS permission denied or unavailable:', err.message)
    );

    let watchId: number;
    if (typeof window !== 'undefined' && navigator.geolocation) {
      // Quick initial fix
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log('Initial location check failed:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
      // Continuous watch
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log('Location watch error:', err.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // Search using Nominatim API (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();

        const results: SearchResult[] = data.map((item: any) => ({
          id: item.place_id.toString(),
          name: item.display_name,
          category: item.type || 'location',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleSelectPoi = (poi: SearchResult) => {
    setSearchedPoi(poi);
    setShowDropdown(false);
    if (mapInstance) {
      mapInstance.flyTo([poi.lat, poi.lng], 16, { duration: 1.5 });
    }
  };

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

  const userIcon = useMemo(() => {
    if (typeof window !== 'undefined') {
      return L.divIcon({
        className: 'user-location-icon',
        html: `<div style="position: relative; width: 24px; height: 24;">
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background-color: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59,130,246,0.8); z-index:10;"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    }
    return null;
  }, []);

  if (!customIcon) {
    return (
      <div className="absolute inset-0 z-50 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        {/* Loading state */}
      </div>
    );
  }

  const arrowMarkers = useArrowMarkers(routeCoordinates);
  const userArrowMarkers = useArrowMarkers(userToDeviceRoute);

  return (
    <div className="absolute inset-0">
      {isDanger && (
        <div className="absolute inset-0 pointer-events-none z-[1000] danger-border-animation" />
      )}
      {/* Map Search Bar */}
      <MapSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        searchResults={searchResults}
        searchLoading={searchLoading}
        handleSelectPoi={handleSelectPoi}
        setSearchedPoi={setSearchedPoi}
      />

      <MapContainer
        center={centerPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <MapInstanceGrabber onChange={setMapInstance} />
        <TileLayer attribution={MAP_STYLES[mapStyle].attribution} url={MAP_STYLES[mapStyle].url} />
        {showSafeZone && (
          <Circle
            center={currentPosition}
            radius={500}
            pathOptions={{ color: '#00b494', fillColor: '#00b494', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }}
          />
        )}
        {showStraightLine && userPosition && currentPosition && (
          <Polyline
            positions={[userPosition, currentPosition]}
            pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 10' }}
          />
        )}
        {showRoute && (
          userToDeviceRoute.length > 0 ? (
            <>
              <Polyline positions={userToDeviceRoute} pathOptions={{ color: '#047857', weight: 8, opacity: 0.4, lineJoin: 'round', lineCap: 'round' }} />
              <Polyline positions={userToDeviceRoute} pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8, lineJoin: 'round', lineCap: 'round' }} />
              <Polyline positions={userToDeviceRoute} pathOptions={{ className: 'user-route-flow-line', color: '#34d399', weight: 3, opacity: 0.9, dashArray: '12, 15', lineJoin: 'round', lineCap: 'round' }} />
              {userArrowMarkers.map((arrow, idx) => (
                <Marker key={`user-arrow-${idx}`} position={arrow.position} icon={L.divIcon({
                  className: 'user-route-arrow-marker',
                  html: `<div style="transform: rotate(${arrow.rotation}deg); width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="18 8 22 12 18 16"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                    </svg>
                  </div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })} interactive={false} />
              ))}
            </>
          ) : (
            routeCoordinates.length > 0 && (
              <>
                <Polyline positions={routeCoordinates} pathOptions={{ color: '#1e40af', weight: 8, opacity: 0.4, lineJoin: 'round', lineCap: 'round' }} />
                <Polyline positions={routeCoordinates} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.8, lineJoin: 'round', lineCap: 'round' }} />
                <Polyline positions={routeCoordinates} pathOptions={{ className: 'route-flow-line', color: '#22d3ee', weight: 3, opacity: 0.9, dashArray: '12, 15', lineJoin: 'round', lineCap: 'round' }} />
                {arrowMarkers.map((arrow, idx) => (
                  <Marker key={`arrow-${idx}`} position={arrow.position} icon={L.divIcon({
                    className: 'route-arrow-marker',
                    html: `<div style="transform: rotate(${arrow.rotation}deg); width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="18 8 22 12 18 16"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                      </svg>
                    </div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })} interactive={false} />
                ))}
                {waypoints.slice(0, -1).map((point, index) => (
                  <Circle
                    key={index}
                    center={point}
                    radius={80}
                    pathOptions={{
                      color: index === 0 ? '#10b981' : '#6366f1',
                      fillColor: index === 0 ? '#10b981' : '#6366f1',
                      fillOpacity: 0.3,
                      weight: 3,
                    }}
                  />
                ))}
              </>
            )
          )
        )}
        <Marker position={currentPosition} icon={customIcon}>
          <Popup>
            <div className="text-sm font-sans p-2 min-w-[220px]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-bold text-[#00b494] text-base">Nạn nhân (MoniMove)</p>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono">{currentPosition[0].toFixed(4)}°N, {currentPosition[1].toFixed(4)}°E</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-500" />
                  <span> Tốc độ: <strong>{speed} km/h</strong></span>
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
        {userPosition && userIcon && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div className="text-xs font-sans p-1">
                <p className="font-bold text-blue-600 mb-0.5">Vị trí của bạn</p>
                <p className="text-[10px] text-slate-500 font-mono">{userPosition[0].toFixed(5)}°N, {userPosition[1].toFixed(5)}°E</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Loading overlay */}
      {(isLoadingRoute || isLoadingUserRoute) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-700 font-semibold">Đang tính toán đường đi...</p>
          </div>
        </div>
      )}

      {/* Map style toggle */}
      <div className="absolute top-4 right-4 z-[1000] w-10 h-10" onMouseEnter={() => setShowMapStyleMenu(true)} onMouseLeave={() => setShowMapStyleMenu(false)}>
        <button
          onClick={() => setShowMapStyleMenu(!showMapStyleMenu)}
          className={`absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border ${showMapStyleMenu ? 'opacity-0 scale-75 rotate-90 pointer-events-none' : 'opacity-100 scale-100 rotate-0 pointer-events-auto bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-slate-50'}`}
          title="Chọn kiểu bản đồ"
        >
          <Layers className="w-4 h-4" />
        </button>
        <div className={`absolute top-0 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/40 p-1.5 w-28 transition-all duration-300 ease-out origin-top-right ${showMapStyleMenu ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-90 pointer-events-none invisible'}`}>
          <div className="px-2 py-1 border-b border-slate-100 mb-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Kiểu bản đồ</span>
          </div>
          <div className="space-y-0.5">
            {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map((style) => (
              <button
                key={style}
                onClick={() => {
                  setMapStyle(style);
                  setShowMapStyleMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 ${mapStyle === style ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                {MAP_STYLES[style].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-1.5">
        {/* Locate */}
        <button
          onClick={() => {
            const handleSuccess = (pos: GeolocationPosition) => {
              const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
              setUserPosition(userCoords);
              if (mapInstance) mapInstance.setView(userCoords, 16, { animate: true });
            };
            const handleFallback = () => {
              console.warn('Browser geolocation failed or blocked, trying IP fallback...');
              fetch('https://ipapi.co/json/')
                .then((res) => res.json())
                .then((data) => {
                  if (data.latitude && data.longitude) {
                    const userCoords: [number, number] = [data.latitude, data.longitude];
                    setUserPosition(userCoords);
                    if (mapInstance) mapInstance.setView(userCoords, 15, { animate: true });
                  } else {
                    alert('Không thể xác định vị trí của bạn. Vui lòng bật định vị trên trình duyệt.');
                  }
                })
                .catch(() => {
                  alert('Không thể xác định vị trí của bạn. Vui lòng bật định vị trên trình duyệt.');
                });
            };
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(handleSuccess, handleFallback, { enableHighAccuracy: true, timeout: 5000 });
            } else {
              handleFallback();
            }
          }}
          className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Định vị của bạn"
        >
          <Locate className="w-4 h-4 text-blue-600" />
        </button>
        {/* Refresh */}
        <button
          onClick={async () => {
            const position = await getCurrentPosition(deviceId);
            if (position) {
              setCurrentPosition([position.lat, position.lng]);
              if (position.speed) setSpeed(position.speed);
            }
          }}
          className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" />
        </button>
        {/* Center */}
        <button
          onClick={() => {
            if (mapInstance && currentPosition) {
              mapInstance.flyTo(currentPosition, 16, { duration: 1.5 });
            }
          }}
          className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Tập trung vào nạn nhân"
        >
          <Crosshair className="w-4 h-4 text-blue-600" />
        </button>
        {/* Zoom controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 overflow-hidden">
          <button
            onClick={() => {
              if (mapInstance) {
                const zoom = mapInstance.getZoom() || 13;
                mapInstance.setZoom(zoom + 1);
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            title="Phóng to"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="h-px bg-slate-200/60 mx-1.5"></div>
          <button
            onClick={() => {
              if (mapInstance) {
                const zoom = mapInstance.getZoom() || 13;
                mapInstance.setZoom(zoom - 1);
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            title="Thu nhỏ"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component to expose map instance
function MapInstanceGrabber({ onChange }: { onChange: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onChange(map);
  }, [map, onChange]);
  return null;
}

// Arrow marker calculations
function useArrowMarkers(coordinates: [number, number][]) {
  return useMemo(() => {
    if (coordinates.length < 5) return [];
    const markers: { position: [number, number]; rotation: number }[] = [];
    const step = Math.max(5, Math.floor(coordinates.length / 8));
    for (let i = step; i < coordinates.length - 2; i += step) {
      const p1 = coordinates[i];
      const p2 = coordinates[i + 2];
      const dy = p2[0] - p1[0];
      const dx = p2[1] - p1[1];
      const rotation = -(Math.atan2(dy, dx) * 180) / Math.PI;
      markers.push({ position: p1, rotation });
    }
    return markers;
  }, [coordinates]);
}


