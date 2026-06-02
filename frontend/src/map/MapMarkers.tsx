import React, { Fragment, useState } from 'react';
import { MarkerF, InfoWindowF } from '@react-google-maps/api';
import PinPopup from './PinPopup';
import {
  CATEGORY_MAP,
  BG_MIN_ZOOM,
  createPinMarkerSvg,
  createBgDotSvg,
  svgToDataUrl,
} from './mapConstants';
import { DeviceMarker, DevicePosition, SearchResult } from './types';

const bgDotIconUrlCache = new Map<string, string>();
const pinIconUrlCache = new Map<string, string>();

const getBgDotIconUrl = (typeKey: string): string => {
  if (!bgDotIconUrlCache.has(typeKey)) {
    bgDotIconUrlCache.set(typeKey, svgToDataUrl(createBgDotSvg(typeKey)));
  }
  return bgDotIconUrlCache.get(typeKey)!;
};

const getPinIconUrl = (typeKey: string, order?: number): string => {
  const cacheKey = `${typeKey}:${order}`;
  if (!pinIconUrlCache.has(cacheKey)) {
    pinIconUrlCache.set(cacheKey, svgToDataUrl(createPinMarkerSvg(typeKey, order)));
  }
  return pinIconUrlCache.get(cacheKey)!;
};

const isOutdoor = (poi: DevicePosition | DeviceMarker): boolean => 
  Array.isArray(poi.tags) && poi.tags.includes('outdoor');

interface MapMarkersProps {
  currentZoom: number;
  backgroundPois: DevicePosition[];
  searchedPoi: SearchResult | null;
  itineraryPoiIds: Set<string>;
  itineraryPois: DeviceMarker[];
  onPoiClick?: (poi: DevicePosition | DeviceMarker) => void;
  isRainy?: boolean;
  prefetchPoi?: (poi: DevicePosition | DeviceMarker) => void;
  currency?: string;
}

export default function MapMarkers({
  currentZoom,
  backgroundPois,
  searchedPoi,
  itineraryPoiIds,
  itineraryPois,
  onPoiClick,
  isRainy = false,
  prefetchPoi,
  currency = 'VND',
}: MapMarkersProps) {
  const [hoveredPoiId, setHoveredPoiId] = useState<string | null>(null);
  
  const toSize = (width: number, height: number): google.maps.Size => {
    if (window?.google?.maps?.Size) {
      return new window.google.maps.Size(width, height);
    }
    return { width, height } as google.maps.Size;
  };

  const toPoint = (x: number, y: number): google.maps.Point => {
    if (window?.google?.maps?.Point) {
      return new window.google.maps.Point(x, y);
    }
    return { x, y } as google.maps.Point;
  };

  const activeHoveredPoi = (currentZoom >= 14 && hoveredPoiId)
    ? itineraryPois.find((p) => String(p.id) === String(hoveredPoiId))
    : null;

  return (
    <Fragment>
      {/* Background POI markers (hiện khi zoom >= BG_MIN_ZOOM) */}
      {currentZoom >= BG_MIN_ZOOM &&
        backgroundPois.map((poi) => {
          const typeKey = poi.category ?? poi.type ?? 'device';
          const dotUrl = getBgDotIconUrl(typeKey);
          const opacity = isRainy && isOutdoor(poi) ? 0.35 : 1;
          return (
            <MarkerF
              key={`bg-${poi.id}`}
              opacity={opacity}
              position={{ lat: poi.lat, lng: poi.lng }}
              icon={{
                url: dotUrl,
                scaledSize: toSize(28, 28),
                anchor: toPoint(14, 14),
                labelOrigin: toPoint(14, 38),
              }}
              label={{
                text: poi.name || '',
                color: CATEGORY_MAP[typeKey as keyof typeof CATEGORY_MAP]?.bg || '#1e293b',
                fontSize: '10px',
                fontWeight: '700',
                fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
                className: 'map-poi-badge',
              }}
              onClick={() => onPoiClick?.(poi)}
              onMouseOver={() => prefetchPoi?.(poi)}
              title={poi.name}
              zIndex={500}
            />
          );
        })}

      {/* Searched POI marker */}
      {searchedPoi && !itineraryPoiIds.has(searchedPoi.id) && (
        <MarkerF
          position={{ lat: searchedPoi.lat, lng: searchedPoi.lng }}
          title={searchedPoi.name}
          zIndex={2000}
          onClick={() => onPoiClick?.(searchedPoi as any)}
          icon={{
            url: getPinIconUrl(searchedPoi.category),
            scaledSize: toSize(58, 50),
            anchor: toPoint(29, 50),
          }}
        />
      )}

      {/* POI markers cho thiết bị (luôn hiện, nổi bật) */}
      {itineraryPois.map((poi) => {
        const typeKey = poi.category ?? poi.type ?? 'device';
        const dataUrl = getPinIconUrl(typeKey, poi.originalIndex + 1);
        const opacity = isRainy && isOutdoor(poi) ? 0.35 : 1;
        const poiId = poi.id;

        return (
          <MarkerF
            key={`poi-${poiId}`}
            position={{ lat: poi.lat, lng: poi.lng }}
            opacity={opacity}
            icon={{
              url: dataUrl,
              scaledSize: toSize(58, 50),
              anchor: toPoint(29, 50),
              labelOrigin: toPoint(29, 62),
            }}
            label={{
              text: poi.name || '',
              color: CATEGORY_MAP[typeKey as keyof typeof CATEGORY_MAP]?.bg || '#083D77',
              fontSize: '10px',
              fontWeight: '700',
              fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
              className: 'map-poi-badge',
            }}
            onClick={() => onPoiClick?.(poi)}
            onMouseOver={() => {
              prefetchPoi?.(poi);
              setHoveredPoiId(poiId);
            }}
            onMouseOut={() => setHoveredPoiId(null)}
            title={poi.name}
            zIndex={1000 + poi.originalIndex}
          />
        );
      })}
      
      {/* Render InfoWindow on hover with zoom threshold >= 14 */}
      {activeHoveredPoi && (
        <InfoWindowF
          key={`popup-${hoveredPoiId}`}
          position={{ lat: activeHoveredPoi.lat, lng: activeHoveredPoi.lng }}
          onCloseClick={() => setHoveredPoiId(null)}
          options={{ pixelOffset: toSize(0, -50) }}
        >
          <PinPopup 
            poi={activeHoveredPoi} 
            index={activeHoveredPoi.originalIndex + 1} 
            currency={currency} 
          />
        </InfoWindowF>
      )}
    </Fragment>
  );
}
