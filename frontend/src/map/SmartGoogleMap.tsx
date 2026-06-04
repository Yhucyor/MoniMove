'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { MapPin, Navigation, Layers, Shield, Gauge, Route, Clock, Locate, X, Plus, Minus } from 'lucide-react';
import { getCurrentPosition, getDeviceRoute, getDeviceInfo, subscribeDevicePosition, subscribeDeviceRoute } from '../services/firebaseRealtime';
import MapMarkers from './MapMarkers';
import RouteLayer from './RouteLayer';
import MapSearchBar from './MapSearchBar';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from './mapConstants';
import { DeviceMarker, DevicePosition, SearchResult } from './types';

const libraries: ("places" | "drawing" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Map styles
const MAP_STYLES = {
  standard: null,
  silver: [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
  ],
  night: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
  ],
  retro: [
    { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b2a6" }] },
    { featureType: "administrative.land_parcel", elementType: "geometry.stroke", stylers: [{ color: "#dcd2be" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#ae9e90" }] },
    { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#93817c" }] },
    { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#a5b076" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#447530" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f1e6" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfcf8" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c967" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e9bc62" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#e98d58" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry.stroke", stylers: [{ color: "#db8555" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#806b63" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
    { featureType: "transit.line", elementType: "labels.text.fill", stylers: [{ color: "#8f7d77" }] },
    { featureType: "transit.line", elementType: "labels.text.stroke", stylers: [{ color: "#ebe3cd" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
    { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b9d3c2" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#92998d" }] }
  ]
};

interface SmartGoogleMapProps {
  showRoute?: boolean;
  showSafeZone?: boolean;
}

export default function SmartGoogleMap({ showRoute = true, showSafeZone = true }: SmartGoogleMapProps) {
  const deviceId = 'DEVICE_ESP32_01';
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  // Keep map centered on user's current location
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  useEffect(() => {
    if (userPosition) {
      setCenter({ lat: userPosition.lat, lng: userPosition.lng });
    }
  }, [userPosition]);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [centerPosition, setCenterPosition] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('standard');
  const [speed, setSpeed] = useState(45);
  const [storedPosition, setStoredPosition] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState(12.5);
  const [duration, setDuration] = useState('18 phút');
  const [showMapStyleMenu, setShowMapStyleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedPoi, setSearchedPoi] = useState<SearchResult | null>(null);
  const [itineraryPois, setItineraryPois] = useState<DeviceMarker[]>([]);
  const [backgroundPois, setBackgroundPois] = useState<DevicePosition[]>([]);
  const [itineraryPoiIds, setItineraryPoiIds] = useState<Set<string>>(new Set());
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [userToDeviceRoute, setUserToDeviceRoute] = useState<google.maps.LatLngLiteral[]>([]);
  const [isLoadingUserRoute, setIsLoadingUserRoute] = useState(false);
  const [userRouteDistance, setUserRouteDistance] = useState<number | null>(null);
  const [userRouteDuration, setUserRouteDuration] = useState<string | null>(null);
  const safeZoneCircleRef = useRef<google.maps.Circle | null>(null);

  // Auto‑detect and track user position continuously if permission already granted
  useEffect(() => {
    let watchId: number;
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Initial location check failed:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

  // Fetch route from user to stored device location
  const fetchUserRoute = async () => {
    if (!userPosition || !storedPosition) return;
    setIsLoadingUserRoute(true);
    try {
      const start = `${userPosition.lng},${userPosition.lat}`;
      const end = `${storedPosition[1]},${storedPosition[0]}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const routeObj = data.routes[0];
        const coordinates = routeObj.geometry.coordinates.map((c: [number, number]) => ({ lat: c[1], lng: c[0] }));
        setUserToDeviceRoute(coordinates);
        if (routeObj.distance) setUserRouteDistance(routeObj.distance / 1000);
        if (routeObj.duration) {
          const mins = Math.round(routeObj.duration / 60);
          if (mins >= 60) {
            const hrs = Math.floor(mins / 60);
            const remaining = mins % 60;
            setUserRouteDuration(`${hrs}h ${remaining}p`);
          } else {
            setUserRouteDuration(`${mins} phút`);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching user route:', e);
    } finally {
      setIsLoadingUserRoute(false);
    }
  };

  // Auto‑detect user position on mount (fallback)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Silent auto‑location check skipped:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Fetch route between user and device when positions change
  useEffect(() => {
    if (!userPosition || !currentPosition) {
      setUserToDeviceRoute([]);
      setUserRouteDistance(null);
      setUserRouteDuration(null);
      return;
    }
    const load = async () => {
      setIsLoadingUserRoute(true);
      try {
        const start = `${userPosition.lng},${userPosition.lat}`;
        const end = `${currentPosition[1]},${currentPosition[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const routeObj = data.routes[0];
          const coordinates = routeObj.geometry.coordinates.map((c: [number, number]) => ({ lat: c[1], lng: c[0] }));
          setUserToDeviceRoute(coordinates);
          if (routeObj.distance) setUserRouteDistance(routeObj.distance / 1000);
          if (routeObj.duration) {
            const mins = Math.round(routeObj.duration / 60);
            if (mins >= 60) {
              const hrs = Math.floor(mins / 60);
              const remaining = mins % 60;
              setUserRouteDuration(`${hrs}h ${remaining}p`);
            } else {
              setUserRouteDuration(`${mins} phút`);
            }
          }
        } else {
          setUserToDeviceRoute([userPosition, { lat: currentPosition[0], lng: currentPosition[1] }]);
        }
      } catch (e) {
        console.error('Error fetching user route:', e);
        setUserToDeviceRoute([userPosition, { lat: currentPosition[0], lng: currentPosition[1] }]);
      } finally {
        setIsLoadingUserRoute(false);
      }
    };
    load();
  }, [userPosition, currentPosition]);

  // Search handling
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      const results = itineraryPois
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(p => ({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: p.category || 'device' } as SearchResult));
      setSearchResults(results);
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, itineraryPois]);

  // Load device data
  useEffect(() => {
    const load = async () => {
      try {
        let deviceInfo: any = null;
        try {
          deviceInfo = await getDeviceInfo(deviceId);
        } catch (e) {
          console.warn('Could not fetch device info:', e);
        }

        const pos = await getCurrentPosition(deviceId);
        const latVal = pos?.lat ?? deviceInfo?.current_data?.gps?.latitude ?? DEFAULT_CENTER.lat;
        const lngVal = pos?.lng ?? deviceInfo?.current_data?.gps?.longitude ?? DEFAULT_CENTER.lng;
        const speedVal = pos?.speed ?? deviceInfo?.current_data?.speed ?? 0;

        setCurrentPosition([latVal, lngVal]);
        setCenterPosition([latVal, lngVal]);
        setSpeed(speedVal);

        const gps = deviceInfo?.current_data?.gps;
        if (gps) {
          setStoredPosition([gps.latitude, gps.longitude] as [number, number]);
        } else {
          setStoredPosition([latVal, lngVal]);
        }

        const deviceMarker: DeviceMarker = {
          id: deviceId,
          name: deviceInfo?.name || 'MoniMove - 01',
          lat: latVal,
          lng: lngVal,
          category: 'device',
          speed: speedVal,
          status: deviceInfo?.status || 'active',
          lastUpdate: new Date().toLocaleTimeString('vi-VN'),
          originalIndex: 0,
        };

        let routeMarkers: DeviceMarker[] = [];
        try {
          const route = await getDeviceRoute(deviceId);
          if (route && route.waypoints) {
            setWaypoints(route.waypoints);
            if (route.distance) setDistance(route.distance / 1000);
            if (route.duration) setDuration(`${Math.round(route.duration / 60)} phút`);
            routeMarkers = route.waypoints.map((pt: [number, number], idx: number) => ({
              id: `waypoint-${idx}`,
              name: idx === 0 ? 'Start' : idx === route.waypoints.length - 1 ? 'End' : `Point ${idx}`,
              lat: pt[0],
              lng: pt[1],
              category: idx === 0 ? 'device' : idx === route.waypoints.length - 1 ? 'destination' : 'checkpoint',
              originalIndex: idx,
            }));
          }
        } catch (e) {
          console.warn('Could not fetch device route:', e);
        }

        setItineraryPois([deviceMarker, ...routeMarkers]);
        setItineraryPoiIds(new Set([deviceId, ...routeMarkers.map(m => m.id)]));
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    };
    load();

    // Subscribe to realtime position updates
    const unsubPos = subscribeDevicePosition(deviceId, (pos) => {
      setCurrentPosition([pos.lat, pos.lng]);
      setCenterPosition([pos.lat, pos.lng]);
      if (pos.speed) setSpeed(pos.speed);
      setItineraryPois(prev => prev.map(p => p.id === deviceId ? { ...p, lat: pos.lat, lng: pos.lng, speed: pos.speed } : p));
    });

    // Subscribe to realtime route updates
    const unsubRoute = subscribeDeviceRoute(deviceId, (route) => {
      setWaypoints(route.waypoints);
      if (route.distance) setDistance(route.distance / 1000);
      if (route.duration) setDuration(`${Math.round(route.duration / 60)} phút`);
    });

    return () => {
      unsubPos();
      unsubRoute();
    };
  }, [deviceId]);

  // Update safe‑zone circle
  useEffect(() => {
    if (map && showSafeZone) {
      if (safeZoneCircleRef.current) safeZoneCircleRef.current.setMap(null);
      const circle = new google.maps.Circle({
        strokeColor: '#00b494',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00b494',
        fillOpacity: 0.1,
        map,
        center: currentPosition ? { lat: currentPosition[0], lng: currentPosition[1] } : { lat: 0, lng: 0 },
        radius: 500,
      });
      safeZoneCircleRef.current = circle;
    } else if (safeZoneCircleRef.current) {
      safeZoneCircleRef.current.setMap(null);
      safeZoneCircleRef.current = null;
    }
    return () => {
      if (safeZoneCircleRef.current) {
        safeZoneCircleRef.current.setMap(null);
        safeZoneCircleRef.current = null;
      }
    };
  }, [map, currentPosition, showSafeZone]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    map.addListener('zoom_changed', () => {
      const z = map.getZoom();
      if (z) setCurrentZoom(z);
    });
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);

  const handleSelectPoi = (poi: SearchResult) => {
    setSearchedPoi(poi);
    setCenter({ lat: poi.lat, lng: poi.lng });
    map?.panTo({ lat: poi.lat, lng: poi.lng });
    map?.setZoom(16);
    setShowDropdown(false);
  };

  const handlePoiClick = (poi: DevicePosition | DeviceMarker) => {
    map?.panTo({ lat: poi.lat, lng: poi.lng });
    map?.setZoom(16);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: apiKey, libraries });

  if (!apiKey) return null;
  if (loadError) {
    return (
      <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-sm border border-red-100">
          <p className="text-red-600 font-bold">Lỗi tải bản đồ Google Maps</p>
          <p className="text-xs text-slate-500 mt-2">{loadError.message}</p>
        </div>
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={DEFAULT_ZOOM}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: MAP_STYLES[mapStyle],
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        {/* Route Layer */}
        {showRoute && (
          userToDeviceRoute.length > 0 ? (
            <>
              <PolylineF path={userToDeviceRoute} options={{ strokeColor: '#047857', strokeOpacity: 0.4, strokeWeight: 8, geodesic: true }} />
              <PolylineF path={userToDeviceRoute} options={{ strokeColor: '#10b981', strokeOpacity: 0.9, strokeWeight: 5, geodesic: true }} />
            </>
          ) : (
            <RouteLayer itineraryPois={itineraryPois} />
          )
        )}
        {/* Markers */}
        <MapMarkers
          currentZoom={currentZoom}
          backgroundPois={backgroundPois}
          searchedPoi={searchedPoi}
          itineraryPoiIds={itineraryPoiIds}
          itineraryPois={itineraryPois}
          onPoiClick={handlePoiClick}
          isRainy={false}
          currency="VND"
        />
        {/* User Location Marker */}
        {userPosition && (
          <MarkerF
            position={userPosition}
            icon={window?.google?.maps?.SymbolPath ? {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: 8,
            } : undefined}
            title="Vị trí của bạn"
          />
        )}
      </GoogleMap>
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
      {isLoadingUserRoute && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-700 font-semibold">Đang tính toán đường đi...</p>
          </div>
        </div>
      )}
      {/* Map Style Toggle */}
      <div className="absolute top-4 right-4 z-[1000] w-10 h-10" onMouseEnter={() => setShowMapStyleMenu(true)} onMouseLeave={() => setShowMapStyleMenu(false)}>
        <button onClick={() => setShowMapStyleMenu(!showMapStyleMenu)} className={`absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border ${showMapStyleMenu ? 'opacity-0 scale-75 rotate-90 pointer-events-none' : 'opacity-100 scale-100 rotate-0 pointer-events-auto bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-slate-50'}`} title="Chọn kiểu bản đồ">
          <Layers className="w-4 h-4" />
        </button>
        <div className={`absolute top-0 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/40 p-1.5 w-28 transition-all duration-300 ease-out origin-top-right ${showMapStyleMenu ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-90 pointer-events-none invisible'}`}>
          <div className="px-2 py-1 border-b border-slate-100 mb-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Kiểu bản đồ</span>
          </div>
          <div className="space-y-0.5">
            {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map(style => (
              <button key={style} onClick={() => { setMapStyle(style); setShowMapStyleMenu(false); }} className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 capitalize ${mapStyle === style ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>{style}</button>
            ))}
          </div>
        </div>
      </div>
      {/* Floating Controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-1.5">
        <button onClick={() => {
          const success = (pos: GeolocationPosition) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserPosition(coords);
            map?.panTo(coords);
            map?.setZoom(16);
          };
          const fallback = () => {
            console.warn('Geolocation failed, using IP fallback');
            fetch('https://ipapi.co/json/')
              .then(r => r.json())
              .then(d => {
                if (d.latitude && d.longitude) {
                  const coords = { lat: d.latitude, lng: d.longitude };
                  setUserPosition(coords);
                  map?.panTo(coords);
                  map?.setZoom(15);
                } else {
                  alert('Không thể xác định vị trí của bạn. Vui lòng bật định vị trên trình duyệt.');
                }
              })
              .catch(() => alert('Không thể xác định vị trí của bạn. Vui lòng bật định vị trên trình duyệt.'));
          };
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fallback, { enableHighAccuracy: true, timeout: 5000 });
          } else {
            fallback();
          }
        }} className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer" title="Định vị của bạn">
          <Locate className="w-4 h-4 text-blue-600" />
        </button>
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 overflow-hidden">
          <button onClick={() => map && map.setZoom((map.getZoom() || DEFAULT_ZOOM) + 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer" title="Phóng to"><Plus className="w-3.5 h-3.5" /></button>
          <div className="h-px bg-slate-200/60 mx-1.5" />
          <button onClick={() => map && map.setZoom((map.getZoom() || DEFAULT_ZOOM) - 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer" title="Thu nhỏ"><Minus className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {/* Bottom Dashboard */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 pointer-events-auto transition-all duration-300 relative">
          {userPosition && (
            <>
              <button onClick={() => { setUserPosition(null); setUserToDeviceRoute([]); setUserRouteDistance(null); setUserRouteDuration(null); }} className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/80 transition-all duration-200 pointer-events-auto cursor-pointer" title="Dừng dẫn đường"><X className="w-4 h-4" /></button>
              <div className="flex items-center justify-between gap-6 pr-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" /><span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">Vị trí của bạn</span></div>
                  <p className="text-xs font-bold text-slate-800 truncate">Vị trí hiện tại</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{userPosition.lat.toFixed(5)}°N, {userPosition.lng.toFixed(5)}°E</p>
                </div>
                <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 min-w-[180px]">
                  {userRouteDistance !== null && userRouteDuration !== null ? (
                    <>
                      <div className="flex items-center gap-1 mb-0.5"><Navigation className="w-3.5 h-3.5 text-cyan-600 animate-pulse" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đến chỗ nạn nhân</span></div>
                      <div className="flex items-baseline gap-1"><span className="text-lg font-black text-cyan-600">{userRouteDistance.toFixed(1)}</span><span className="text-[10px] font-bold text-cyan-600">km</span><span className="mx-1 text-slate-300">•</span><span className="text-sm font-black text-orange-500">{userRouteDuration}</span></div>
                      <div className="w-full bg-slate-200 h-[3px] rounded-full mt-2 overflow-hidden"><div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full w-2/3 animate-pulse" style={{ animationDuration: '2s' }} /></div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />Tính toán đường đi...</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">Thiết bị</span></div>
                  <p className="text-xs font-bold text-slate-800 truncate">Thiết bị đang theo dõi</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentPosition ? `${currentPosition[0].toFixed(5)}°N, ${currentPosition[1].toFixed(5)}°E` : 'Đang tải...'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
