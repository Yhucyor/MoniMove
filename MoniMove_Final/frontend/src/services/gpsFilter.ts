/**
 * GPS Noise Filter Service
 * Áp dụng Kalman filter đơn giản + outlier rejection để cải thiện độ chính xác GPS
 */

export interface GpsPoint {
    lat: number;
    lng: number;
    timestamp: number;
    speed?: number;
    accuracy?: number;
}

interface KalmanState {
    lat: number;
    lng: number;
    varLat: number;
    varLng: number;
}

/** Lọc nhiễu GPS bằng Kalman Filter 1D đơn giản */
export class KalmanGpsFilter {
    private state: KalmanState | null = null;
    // Process noise (Q) — càng lớn càng trust GPS mới hơn
    private readonly Q = 0.00001;
    // Measurement noise (R) — GPS accuracy ~5-15m
    private readonly R = 0.0001;

    filter(point: GpsPoint): GpsPoint {
        if (!this.state) {
            this.state = {
                lat: point.lat,
                lng: point.lng,
                varLat: 1,
                varLng: 1,
            };
            return point;
        }

        // Predict step
        const predVarLat = this.state.varLat + this.Q;
        const predVarLng = this.state.varLng + this.Q;

        // Update step
        const kLat = predVarLat / (predVarLat + this.R);
        const kLng = predVarLng / (predVarLng + this.R);

        const newLat = this.state.lat + kLat * (point.lat - this.state.lat);
        const newLng = this.state.lng + kLng * (point.lng - this.state.lng);

        this.state = {
            lat: newLat,
            lng: newLng,
            varLat: (1 - kLat) * predVarLat,
            varLng: (1 - kLng) * predVarLng,
        };

        return { ...point, lat: newLat, lng: newLng };
    }

    reset() {
        this.state = null;
    }
}

/** Loại bỏ các điểm GPS nhảy bất thường (outlier rejection) */
export function rejectOutliers(points: GpsPoint[], maxSpeedKmh = 200): GpsPoint[] {
    if (points.length < 2) return points;

    const result: GpsPoint[] = [points[0]];

    for (let i = 1; i < points.length; i++) {
        const prev = result[result.length - 1];
        const curr = points[i];

        const dt = (curr.timestamp - prev.timestamp) / 1000; // seconds
        if (dt <= 0) continue;

        // Haversine distance
        const dLat = ((curr.lat - prev.lat) * Math.PI) / 180;
        const dLng = ((curr.lng - prev.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((prev.lat * Math.PI) / 180) *
            Math.cos((curr.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const dist = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const speedMs = dist / dt;
        const speedKmh = speedMs * 3.6;

        // Bỏ điểm nếu tốc độ di chuyển GPS không thực tế
        if (speedKmh > maxSpeedKmh) continue;

        result.push(curr);
    }

    return result;
}

/** Làm mịn mảng GPS bằng moving average */
export function smoothGpsTrack(points: GpsPoint[], windowSize = 3): GpsPoint[] {
    if (points.length < windowSize) return points;

    return points.map((p, i) => {
        const half = Math.floor(windowSize / 2);
        const from = Math.max(0, i - half);
        const to = Math.min(points.length - 1, i + half);
        const slice = points.slice(from, to + 1);

        const avgLat = slice.reduce((s, x) => s + x.lat, 0) / slice.length;
        const avgLng = slice.reduce((s, x) => s + x.lng, 0) / slice.length;

        return { ...p, lat: avgLat, lng: avgLng };
    });
}

/** Pipeline đầy đủ: reject outliers → Kalman filter → smooth */
export function filterGpsTrack(raw: GpsPoint[]): GpsPoint[] {
    const clean = rejectOutliers(raw);
    const filter = new KalmanGpsFilter();
    const kalman = clean.map((p) => filter.filter(p));
    return smoothGpsTrack(kalman, 3);
}
