'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { MapPin, Navigation, Layers, Shield, Gauge, Route, Clock, Search, X } from 'lucide-react';
import { getCurrentPosition, getDeviceRoute, getDeviceInfo } from '../../services/api';

const libraries: ("places" | "drawing" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 10.7769,
  lng: 106.7009
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

export default function GoogleMapComponent() {
  const deviceId = 'device-001';
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('standard');
  const [showRoute, setShowRoute] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [speed, setSpeed] = useState(45);
  const [distance, setDistance] = useState(12.5);
  const [duration, setDuration] = useState('18 phút');
  const [searchOpen, setSearchOpen] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

        const route = await getDeviceRoute(deviceId);
        if (route.distance) setDistance(route.distance / 1000);
        if (route.duration) setDuration(`${Math.round(route.duration / 60)} phút`);

        // Calculate directions using Google Maps Directions API
        if (route.waypoints.length >= 2 && window.google) {
          const directionsService = new google.maps.DirectionsService();
          const origin = { lat: route.waypoints[0][0], lng: route.waypoints[0][1] };
          const destination = { 
            lat: route.waypoints[route.waypoints.length - 1][0], 
            lng: route.waypoints[route.waypoints.length - 1][1] 
          };
          
          const waypoints = route.waypoints.slice(1, -1).map(point => ({
            location: { lat: point[0], lng: point[1] },
            stopover: true
          }));

          directionsService.route(
            {
              origin,
              destination,
              waypoints,
              travelMode: google.maps.TravelMode.DRIVING,
              optimizeWaypoints: false
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
                const leg = result.routes[0].legs[0];
                if (leg.distance) setDistance(leg.distance.value / 1000);
                if (leg.duration) setDuration(leg.duration.text);
              }
            }
          );
        }
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

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setCenter(newCenter);
        map?.panTo(newCenter);
        map?.setZoom(15);
        setSearchOpen(false);
      }
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

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

  return (
    <div className="absolute inset-0">
      <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: MAP_STYLES[mapStyle],
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {/* Current Position Marker */}
          <Marker
            position={currentPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#00b494',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          />

          {/* Directions Route */}
          {showRoute && directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#2563eb',
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                },
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        {searchOpen ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-2 flex items-center gap-2 min-w-[400px]">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm địa điểm..."
                  className="flex-1 px-2 py-2 outline-none bg-transparent text-slate-700"
                  autoFocus
                />
              </Autocomplete>
            </LoadScript>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 px-6 py-3 flex items-center gap-2 hover:shadow-xl transition-all"
          >
            <Search className="w-5 h-5 text-slate-600" />
            <span className="text-slate-700 font-semibold">Tìm kiếm địa điểm</span>
          </button>
        )}
      </div>

      {/* Top Left - Device Info Card */}
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
            <p className="text-xl font-black text-purple-700">{distance.toFixed(1)} <span className="text-sm">km</span></p>
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

      {/* Top Right - Map Style Selector */}
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
              className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all capitalize ${
                mapStyle === style
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Left - Quick Controls */}
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

        <button
          onClick={() => {
            map?.panTo(currentPosition);
            map?.setZoom(15);
          }}
          className="px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl transition-all flex items-center gap-2 bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-slate-50"
        >
          <Navigation className="w-4 h-4" />
          Về vị trí hiện tại
        </button>
      </div>

      {/* Bottom Right - Location Info */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-cyan-600" />
          <h4 className="font-bold text-slate-900">Vị trí hiện tại</h4>
        </div>
        <p className="text-sm text-slate-600 font-mono mb-1">
          {currentPosition.lat.toFixed(6)}°N
        </p>
        <p className="text-sm text-slate-600 font-mono mb-2">
          {currentPosition.lng.toFixed(6)}°E
        </p>
        <p className="text-xs text-slate-500">
          📍 Ho Chi Minh City, Vietnam
        </p>
        {directions && (
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            Đường đi thực tế (Google Maps)
          </p>
        )}
      </div>
    </div>
  );
}
