/**
 * Geofencing Service
 * Quản lý vùng an toàn và cảnh báo khi thiết bị ra ngoài vùng cho phép
 */

export interface GeoZone {
    id: string;
    name: string;
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    deviceId: string;
    createdAt: number;
}

const STORAGE_KEY = 'monimove_geozones';

/** Tính khoảng cách (meters) giữa 2 tọa độ GPS — Haversine formula */
export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Kiểm tra xem vị trí có trong vùng an toàn không */
export function isInsideZone(zone: GeoZone, lat: number, lng: number): boolean {
    const dist = haversineDistance(zone.centerLat, zone.centerLng, lat, lng);
    return dist <= zone.radiusMeters;
}

/** Load danh sách vùng từ localStorage */
export function loadZones(): GeoZone[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/** Lưu danh sách vùng vào localStorage */
export function saveZones(zones: GeoZone[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

/** Thêm vùng mới */
export function addZone(zone: Omit<GeoZone, 'id' | 'createdAt'>): GeoZone {
    const zones = loadZones();
    const newZone: GeoZone = {
        ...zone,
        id: `zone_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
    };
    saveZones([...zones, newZone]);
    return newZone;
}

/** Xóa vùng */
export function deleteZone(id: string): void {
    saveZones(loadZones().filter((z) => z.id !== id));
}

/** Lấy vùng theo deviceId */
export function getZonesForDevice(deviceId: string): GeoZone[] {
    return loadZones().filter((z) => z.deviceId === deviceId || z.deviceId === '*');
}

/** Kiểm tra vị trí với tất cả zones của thiết bị — trả về zones bị vi phạm */
export function checkGeofenceViolations(
    deviceId: string,
    lat: number,
    lng: number,
): GeoZone[] {
    const zones = getZonesForDevice(deviceId);
    return zones.filter((z) => !isInsideZone(z, lat, lng));
}
