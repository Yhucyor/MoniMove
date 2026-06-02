import { useEffect, useRef } from 'react';
import { useGoogleMap } from '@react-google-maps/api';
import { DeviceMarker } from './types';

const ROUTE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

interface RouteLayerProps {
  itineraryPois: DeviceMarker[];
  selectedDay?: number;
}

export default function RouteLayer({ itineraryPois, selectedDay }: RouteLayerProps) {
  const map = useGoogleMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    // Cleanup: xóa sạch mọi polyline cũ khỏi bản đồ
    polylinesRef.current.forEach(pl => pl.setMap(null));
    polylinesRef.current = [];

    if (!map || !itineraryPois || itineraryPois.length < 2) return;

    const arrowIcon = window?.google?.maps?.SymbolPath
      ? {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillOpacity: 1,
          strokeOpacity: 1,
          scale: 2.2,
        }
      : null;

    for (let i = 1; i < itineraryPois.length; i++) {
      const prevPoi = itineraryPois[i - 1];
      const currPoi = itineraryPois[i];

      const prevLat = Number(prevPoi.lat);
      const prevLng = Number(prevPoi.lng);
      const currLat = Number(currPoi.lat);
      const currLng = Number(currPoi.lng);

      if (
        !Number.isFinite(prevLat) || !Number.isFinite(prevLng) ||
        !Number.isFinite(currLat) || !Number.isFinite(currLng)
      ) continue;

      const travel = currPoi.travel_from_prev;
      const currentPath: google.maps.LatLngLiteral[] = [{ lat: prevLat, lng: prevLng }];

      if (travel && Array.isArray(travel.geometry) && travel.geometry.length > 0) {
        const legGeometry = travel.geometry.map(coord => {
          let lat = coord[0];
          let lng = coord[1];

          // Fix inverted coordinates returned by backend in some cases
          // If the first value is outside [-90, 90], it must be longitude.
          if (Math.abs(lat) > 90) {
            return { lat: lng, lng: lat };
          }
          return { lat, lng };
        });
        currentPath.push(...legGeometry);
      }

      currentPath.push({ lat: currLat, lng: currLng });

      const polyline = new window.google.maps.Polyline({
        path: currentPath,
        strokeColor: ROUTE_COLORS[(i - 1) % ROUTE_COLORS.length],
        strokeOpacity: 0.9,
        strokeWeight: 5,
        geodesic: false,
        icons: arrowIcon
          ? [{
              icon: arrowIcon,
              offset: '20px',
              repeat: '80px',
            }]
          : undefined,
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    }

    // Cleanup khi component unmount hoặc dependencies thay đổi
    return () => {
      polylinesRef.current.forEach(pl => pl.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, itineraryPois, selectedDay]);

  return null;
}
