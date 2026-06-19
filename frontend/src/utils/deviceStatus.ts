export type ConnectionStatus = "online" | "offline" | "unknown";

// 30 giây — ngưỡng coi là offline nếu không có tín hiệu GPS mới
export const OFFLINE_THRESHOLD_MS = 30 * 1000;

// 24 giờ — ngưỡng fallback cho last_ping (hardware không gửi ping liên tục)
export const LAST_PING_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function normalizeLastPing(
  lastUpdate?: number,
  lastPingSeconds?: number,
): number | null {
  if (lastPingSeconds) return lastPingSeconds * 1000;
  if (lastUpdate) return lastUpdate;
  return null;
}

/**
 * Xác định trạng thái kết nối thiết bị.
 *
 * Quy tắc:
 *   currentTime - lastSeen <= 30 giây  → Trực tuyến (online)
 *   currentTime - lastSeen > 30 giây   → Ngoại tuyến (offline)
 *
 * Ưu tiên theo thứ tự:
 * 1. lastUpdate (gps.updated_at * 1000) — realtime nhất, threshold 30 giây
 * 2. lastPingSeconds (info.last_ping)   — hardware ping, threshold 24 giờ
 * 3. rawStatus từ Firebase info.status  — fallback cuối
 */
export function getConnectionStatus(
  lastUpdate?: number,
  lastPingSeconds?: number,
  rawStatus?: string,
): ConnectionStatus {
  // Ưu tiên GPS updated_at (realtime từ ESP32)
  if (lastUpdate && lastUpdate > 0) {
    const age = Math.abs(Date.now() - lastUpdate);
    // Trong vòng 30 giây => Trực tuyến
    if (age <= OFFLINE_THRESHOLD_MS) return "online";
    // Quá 30 giây nhưng vẫn kiểm tra last_ping
  }

  // Kiểm tra last_ping (hardware heartbeat, threshold rộng hơn)
  if (lastPingSeconds && lastPingSeconds > 0) {
    const lastPingMs = lastPingSeconds * 1000;
    if (Math.abs(Date.now() - lastPingMs) <= LAST_PING_THRESHOLD_MS)
      return "online";
    return "offline";
  }

  // Nếu lastUpdate tồn tại nhưng stale (> 30 giây)
  if (lastUpdate && lastUpdate > 0) return "offline";

  // Fallback về rawStatus
  if (rawStatus === "online" || rawStatus === "active") return "online";
  if (rawStatus === "offline" || rawStatus === "inactive") return "offline";
  return "unknown";
}

export function formatLastSeen(
  lastUpdate?: number,
  lastPingSeconds?: number,
): string {
  const lastPingMs = normalizeLastPing(lastUpdate, lastPingSeconds);
  if (!lastPingMs) return "Không rõ";

  const diff = Date.now() - lastPingMs;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}
