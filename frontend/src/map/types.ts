/**
 * Type definitions for Smart Map components
 */

export interface DevicePosition {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  type?: string;
  speed?: number;
  status?: 'active' | 'inactive' | 'warning';
  lastUpdate?: string;
  tags?: string[];
}

export interface RoutePoint {
  lat: number;
  lng: number;
  order?: number;
}

export interface TravelInfo {
  distance?: number;
  duration?: number;
  geometry?: [number, number][];
}

export interface DeviceMarker extends DevicePosition {
  originalIndex: number;
  travel_from_prev?: TravelInfo;
}

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  type?: string;
}
