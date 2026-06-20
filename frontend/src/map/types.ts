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
<<<<<<< HEAD
  status: "online" | "offline";
=======
  status: 'online' | 'offline';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  battery: number;
}
