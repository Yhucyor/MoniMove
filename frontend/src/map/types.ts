// Types for Map components

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
}

export interface DeviceMarker {
  id: string;
  name: string;
  position: [number, number];
  status: 'online' | 'offline';
  battery: number;
}
