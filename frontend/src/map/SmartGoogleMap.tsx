'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { MapPin, Navigation, Layers, Shield, Gauge, Route, Clock, Locate, X, Plus, Minus } from 'lucide-react';
import { getCurrentPosition, getDeviceRoute, getDeviceInfo } from '../services/api';
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
  const deviceId = 'device-001';
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [currentPosition, setCurrentPosition] = useState(DEFAULT_CENTER);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('standard');
  const [speed, setSpeed] = useState(45);
  const [distance, setDistance] = useState(12.5);
  const [duration, setDuration] = useState('18 phút');
  const [showMapStyleMenu, setShowMapStyleMenu] = useState(false);
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [userToDeviceRoute, setUserToDeviceRoute] = useState<google.maps.LatLngLiteral[]>([]);
  const [isLoadingUserRoute, setIsLoadingUserRoute] = useState(false);
  const [userRouteDistance, setUserRouteDistance] = useState<number | null>(null);
  const [userRouteDuration, setUserRouteDuration] = useState<string | null>(null);

  // Auto-detect user position on mount if permission already granted
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPosition(userCoords);
        },
        (err) => {
          console.log('Silent auto-location check skipped or denied:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Fetch route from user to device when positions change
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
        const start = `${userPosition.lng},${userPosition.lat}`;
        const end = `${currentPosition.lng},${currentPosition.lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const routeObj = data.routes[0];
          const coordinates = routeObj.geometry.coordinates.map(
            (coord: [number, number]) => ({ lat: coord[1], lng: coord[0] })
          );
          setUserToDeviceRoute(coordinates);

          if (routeObj.distance) {
            setUserRouteDistance(routeObj.distance / 1000);
          }
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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedPoi, setSearchedPoi] = useState<SearchResult | null>(null);

  // Device markers state
  const [itineraryPois, setItineraryPois] = useState<DeviceMarker[]>([]);
  const [backgroundPois, setBackgroundPois] = useState<DevicePosition[]>([]);
  const [itineraryPoiIds, setItineraryPoiIds] = useState<Set<string>>(new Set());

  const safeZoneCircleRef = useRef<google.maps.Circle | null>(null);

  // Load device data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviceInfo = await getDeviceInfo(deviceId);
        console.log('Device info:', deviceInfo);

        const position = await getCurrentPosition(deviceId);
        const newPos = { lat: position.lat, lng: position.lng };
        setCurrentPosition(newPos);
        setCenter(newPos);
        if (position.speed) setSpeed(position.speed);

        // Create device marker
        const deviceMarker: DeviceMarker = {
          id: deviceId,
          name: 'MoniMove - 01',
          lat: position.lat,
          lng: position.lng,
          category: 'device',
          speed: position.speed,
          status: 'active',
          lastUpdate: new Date().toLocaleTimeString('vi-VN'),
          originalIndex: 0,
        };

        const route = await getDeviceRoute(deviceId);
        if (route.distance) setDistance(route.distance / 1000);
        if (route.duration) setDuration(`${Math.round(route.duration / 60)} phút`);

        // Create route markers
        const routeMarkers: DeviceMarker[] = route.waypoints.map((point, index) => ({
          id: `waypoint-${index}`,
          name: index === 0 ? 'Điểm xuất phát' : 
                index === route.waypoints.length - 1 ? 'Điểm đến' : 
                `Điểm ${index}`,
          lat: point[0],
          lng: point[1],
          category: index === 0 ? 'device' : 
                    index === route.waypoints.length - 1 ? 'destination' : 
                    'checkpoint',
          originalIndex: index,
        }));

        setItineraryPois([deviceMarker, ...routeMarkers]);
        setItineraryPoiIds(new Set([deviceId, ...routeMarkers.map(m => m.id)]));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const interval = setInterval(async () => {
      try {
        const position = await getCurrentPosition(deviceId);
        setCurrentPosition({ lat: position.lat, lng: position.lng });
        if (position.speed) setSpeed(position.speed);
        
        // Update device marker position
        setItineraryPois(prev => prev.map(poi => 
          poi.id === deviceId 
            ? { ...poi, lat: position.lat, lng: position.lng, speed: position.speed }
            : poi
        ));
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deviceId]);

  // Update safe zone circle
  useEffect(() => {
    if (map && showSafeZone) {
      if (safeZoneCircleRef.current) {
        safeZoneCircleRef.current.setMap(null);
      }
      
      const circle = new google.maps.Circle({
        strokeColor: '#00b494',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00b494',
        fillOpacity: 0.1,
        map,
        center: currentPosition,
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

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      // Mock search - replace with actual API call
      const mockResults: SearchResult[] = itineraryPois
        .filter(poi => poi.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(poi => ({
          id: poi.id,
          name: poi.name,
          lat: poi.lat,
          lng: poi.lng,
          category: poi.category || 'device',
        }));
      
      setSearchResults(mockResults);
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, itineraryPois]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Listen to zoom changes
    map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      if (zoom) setCurrentZoom(zoom);
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleSelectPoi = (poi: SearchResult) => {
    setSearchedPoi(poi);
    setCenter({ lat: poi.lat, lng: poi.lng });
    map?.panTo({ lat: poi.lat, lng: poi.lng });
    map?.setZoom(16);
    setShowDropdown(false);
  };

  const handlePoiClick = (poi: DevicePosition | DeviceMarker) => {
    console.log('POI clicked:', poi);
    map?.panTo({ lat: poi.lat, lng: poi.lng });
    map?.setZoom(16);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Google Maps API Key Required</h3>
          <p className="text-slate-600 mb-4">
            Vui lòng thêm Google Maps API key vào file <code className="bg-slate-100 px-2 py-1 rounded">.env.local</code>
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-left text-sm">
            <p className="font-mono text-xs mb-2">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</p>
            <a 
              href="https://console.cloud.google.com/google/maps-apis" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              → Lấy API key tại đây
            </a>
          </div>
        </div>
      </div>
    );
  }

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
              {/* Outer outline path */}
              <PolylineF
                path={userToDeviceRoute}
                options={{
                  strokeColor: '#047857',
                  strokeOpacity: 0.4,
                  strokeWeight: 8,
                  geodesic: true,
                }}
              />
              {/* Core green path */}
              <PolylineF
                path={userToDeviceRoute}
                options={{
                  strokeColor: '#10b981',
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                  geodesic: true,
                }}
              />
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
            icon={window?.google?.maps?.SymbolPath
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                  scale: 8,
                }
              : undefined
            }
            title="Vị trí của bạn"
          />
        )}
      </GoogleMap>

      {/* Search Bar */}
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



      {/* Map Style Toggle Selector */}
      <div 
        className="absolute top-4 right-4 z-[1000] w-10 h-10"
        onMouseEnter={() => setShowMapStyleMenu(true)}
        onMouseLeave={() => setShowMapStyleMenu(false)}
      >
        <button
          onClick={() => setShowMapStyleMenu(!showMapStyleMenu)}
          className={`absolute top-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border ${
            showMapStyleMenu
              ? 'opacity-0 scale-75 rotate-90 pointer-events-none'
              : 'opacity-100 scale-100 rotate-0 pointer-events-auto bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-slate-50'
          }`}
          title="Chọn kiểu bản đồ"
        >
          <Layers className="w-4 h-4" />
        </button>

        <div className={`absolute top-0 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/40 p-1.5 w-28 transition-all duration-300 ease-out origin-top-right ${
          showMapStyleMenu 
            ? 'opacity-100 scale-100 pointer-events-auto visible' 
            : 'opacity-0 scale-90 pointer-events-none invisible'
        }`}>
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
                className={`w-full text-left px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 capitalize ${
                  mapStyle === style
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Floating Map Controls (Locate & Zoom) */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-1.5">
        {/* Locate Button */}
        <button
          onClick={() => {
            const handleSuccess = (pos: GeolocationPosition) => {
              const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setUserPosition(userCoords);
              map?.panTo(userCoords);
              map?.setZoom(16);
            };

            const handleFallback = () => {
              console.warn('Browser geolocation failed or blocked, trying IP fallback...');
              fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                  if (data.latitude && data.longitude) {
                    const userCoords = { lat: data.latitude, lng: data.longitude };
                    setUserPosition(userCoords);
                    map?.panTo(userCoords);
                    map?.setZoom(15);
                  } else {
                    alert('Không thể xác định vị trí của bạn. Vui lòng bật định vị trên trình duyệt.');
                  }
                })
                .catch(() => {
                  alert('Không thể xác định vị trí của bạn. Vui lòng bật định vị trên trình duyệt.');
                });
            };

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(handleSuccess, handleFallback, {
                enableHighAccuracy: true,
                timeout: 5000
              });
            } else {
              handleFallback();
            }
          }}
          className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer"
          title="Định vị của bạn"
        >
          <Locate className="w-4 h-4 text-blue-600" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/50 overflow-hidden">
          <button
            onClick={() => {
              if (map) {
                const zoom = map.getZoom() || DEFAULT_ZOOM;
                map.setZoom(zoom + 1);
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
              if (map) {
                const zoom = map.getZoom() || DEFAULT_ZOOM;
                map.setZoom(zoom - 1);
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            title="Thu nhỏ"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Center - Directions & Travel Info Dashboard */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 pointer-events-auto transition-all duration-300 relative">
          {userPosition ? (
            <>
              {/* Stop Navigation Button */}
              <button
                onClick={() => {
                  setUserPosition(null);
                  setUserToDeviceRoute([]);
                  setUserRouteDistance(null);
                  setUserRouteDuration(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/80 transition-all duration-200 pointer-events-auto cursor-pointer"
                title="Dừng dẫn đường"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between gap-6 pr-4">
                
                {/* Departure - User Position */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">Vị trí của bạn</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">Vị trí hiện tại</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {userPosition.lat.toFixed(5)}°N, {userPosition.lng.toFixed(5)}°E
                  </p>
                </div>

                {/* Travel Statistics - Middle */}
                <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 min-w-[180px]">
                  {userRouteDistance !== null && userRouteDuration !== null ? (
                    <>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Navigation className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đến chỗ nạn nhân</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-cyan-600">{userRouteDistance.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-cyan-600">km</span>
                        <span className="mx-1 text-slate-300">•</span>
                        <span className="text-sm font-black text-orange-500">{userRouteDuration}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-[3px] rounded-full mt-2 overflow-hidden relative">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full w-2/3 animate-pulse" style={{ animationDuration: '2s' }}></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      Tính toán đường đi...
                    </div>
                  )}
                </div>

                {/* Destination - IoT Device */}
                <div className="flex-1 min-w-0 text-right pr-2">
                  <div className="flex items-center justify-end gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00b494]">Vị trí nạn nhân</span>
                    <div className="w-2.5 h-2.5 bg-[#00b494] rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">Nạn nhân (MoniMove)</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {currentPosition.lat.toFixed(5)}°N, {currentPosition.lng.toFixed(5)}°E
                  </p>
                </div>

              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                  <Navigation className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Bắt đầu dẫn đường cứu nạn</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Vui lòng định vị vị trí hiện tại của bạn để hiển thị lộ trình và khoảng cách cứu nạn.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const locateButton = document.querySelector('[title="Định vị của bạn"]') as HTMLButtonElement;
                  if (locateButton) locateButton.click();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:brightness-105 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
              >
                📍 Định vị ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
