/**
 * RealtimeTracker — ghi lại GPS track live theo thời gian thực
 * Kết hợp WebSocket updates + GPS filter để vẽ lịch sử di chuyển ngay trong phiên
 */

import { KalmanGpsFilter, GpsPoint } from './gpsFilter';

export interface TrackPoint extends GpsPoint {
    speed: number;
    deviceId: string;
}

export class RealtimeTracker {
    private filter = new KalmanGpsFilter();
    private track: TrackPoint[] = [];
    private readonly maxPoints: number;
    private readonly deviceId: string;

    constructor(deviceId: string, maxPoints = 500) {
        this.deviceId = deviceId;
        this.maxPoints = maxPoints;
    }

    /** Thêm điểm GPS mới (từ WebSocket hoặc Firebase) */
    addPoint(lat: number, lng: number, speed: number, timestamp?: number): TrackPoint {
        const raw: GpsPoint = { lat, lng, timestamp: timestamp ?? Date.now() };
        const filtered = this.filter.filter(raw);

        const point: TrackPoint = {
            ...filtered,
            speed,
            deviceId: this.deviceId,
        };

        this.track.push(point);

        // Giữ tối đa maxPoints — xóa điểm cũ nhất
        if (this.track.length > this.maxPoints) {
            this.track.shift();
        }

        return point;
    }

    /** Lấy toàn bộ track hiện tại */
    getTrack(): TrackPoint[] {
        return [...this.track];
    }

    /** Lấy N điểm gần nhất */
    getRecentPoints(n: number): TrackPoint[] {
        return this.track.slice(-n);
    }

    /** Tổng quãng đường (km) */
    getTotalDistance(): number {
        if (this.track.length < 2) return 0;
        let total = 0;
        for (let i = 1; i < this.track.length; i++) {
            const p1 = this.track[i - 1];
            const p2 = this.track[i];
            const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
            const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((p1.lat * Math.PI) / 180) *
                Math.cos((p2.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2;
            total += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        return total;
    }

    /** Tốc độ trung bình (km/h) */
    getAvgSpeed(): number {
        if (this.track.length === 0) return 0;
        return this.track.reduce((s, p) => s + p.speed, 0) / this.track.length;
    }

    /** Tốc độ tối đa */
    getMaxSpeed(): number {
        if (this.track.length === 0) return 0;
        return Math.max(...this.track.map((p) => p.speed));
    }

    /** Xóa track */
    reset() {
        this.track = [];
        this.filter.reset();
    }

    /** Số điểm trong track */
    get length(): number {
        return this.track.length;
    }
}

/** Singleton map: deviceId → tracker */
const trackers = new Map<string, RealtimeTracker>();

export function getTracker(deviceId: string): RealtimeTracker {
    if (!trackers.has(deviceId)) {
        trackers.set(deviceId, new RealtimeTracker(deviceId));
    }
    return trackers.get(deviceId)!;
}

export function resetTracker(deviceId: string) {
    trackers.get(deviceId)?.reset();
}
