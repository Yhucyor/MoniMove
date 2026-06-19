export type ConnectionStatus = 'online' | 'offline' | 'unknown';

// 5 phút — nếu GPS updated_at mới trong 5 phút → online
const GPS_ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
// 24 giờ — nếu last_ping (hardware heartbeat) trong 24h → online
const LAST_PING_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function computeConnectionStatus(
  lastPingSeconds?: number,
  lastUpdateMs?: number,
  rawStatus?: string,
  gpsUpdatedAtSeconds?: number,
): ConnectionStatus {
  // 1. GPS updated_at — realtime nhất (ESP32 ghi khi có fix GPS)
  if (gpsUpdatedAtSeconds && gpsUpdatedAtSeconds > 0) {
    const gpsAgeMs = Date.now() - gpsUpdatedAtSeconds * 1000;
    if (gpsAgeMs <= GPS_ONLINE_THRESHOLD_MS) return 'online';
  }

  // 2. last_ping — hardware heartbeat, threshold rộng hơn
  if (lastPingSeconds && lastPingSeconds > 0) {
    const pingAgeMs = Date.now() - lastPingSeconds * 1000;
    if (pingAgeMs <= LAST_PING_THRESHOLD_MS) return 'online';
    return 'offline';
  }

  // 3. lastUpdateMs (từ gps.updated_at đã * 1000 hoặc thời điểm fetch)
  if (lastUpdateMs && lastUpdateMs > 0) {
    const ageMs = Date.now() - lastUpdateMs;
    if (ageMs <= GPS_ONLINE_THRESHOLD_MS) return 'online';
    // stale — tiếp tục xuống rawStatus
  }

  // 4. rawStatus từ Firebase info.status
  if (rawStatus === 'online' || rawStatus === 'active') return 'online';
  if (rawStatus === 'offline' || rawStatus === 'inactive') return 'offline';
  return 'unknown';
}
