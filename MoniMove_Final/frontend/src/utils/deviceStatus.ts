export type ConnectionStatus = 'online' | 'offline' | 'unknown';

export const OFFLINE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 giờ — phù hợp khi hardware không update liên tục

export function normalizeLastPing(lastUpdate?: number, lastPingSeconds?: number): number | null {
  if (lastPingSeconds) return lastPingSeconds * 1000;
  if (lastUpdate) return lastUpdate;
  return null;
}

export function getConnectionStatus(
  lastUpdate?: number,
  lastPingSeconds?: number,
  rawStatus?: string,
  thresholdMs = OFFLINE_THRESHOLD_MS,
): ConnectionStatus {
  const lastPingMs = normalizeLastPing(lastUpdate, lastPingSeconds);

  if (lastPingMs) {
    const stale = Date.now() - lastPingMs > thresholdMs;
    if (stale) return 'offline';
    return 'online';
  }

  if (rawStatus === 'online' || rawStatus === 'active') return 'online';
  if (rawStatus === 'offline' || rawStatus === 'inactive') return 'offline';
  return 'unknown';
}

export function formatLastSeen(lastUpdate?: number, lastPingSeconds?: number): string {
  const lastPingMs = normalizeLastPing(lastUpdate, lastPingSeconds);
  if (!lastPingMs) return 'Không rõ';

  const diff = Date.now() - lastPingMs;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}
