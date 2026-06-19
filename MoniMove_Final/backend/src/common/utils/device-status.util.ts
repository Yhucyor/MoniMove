export type ConnectionStatus = 'online' | 'offline' | 'unknown';

// 24 giờ — phù hợp khi phần cứng không update last_ping liên tục
export const OFFLINE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function computeConnectionStatus(
  lastPingSeconds?: number,
  lastUpdateMs?: number,
  rawStatus?: string,
): ConnectionStatus {
  let lastPingMs: number | null = null;
  if (lastPingSeconds) lastPingMs = lastPingSeconds * 1000;
  else if (lastUpdateMs) lastPingMs = lastUpdateMs;

  if (lastPingMs) {
    return Date.now() - lastPingMs > OFFLINE_THRESHOLD_MS ? 'offline' : 'online';
  }

  // Fallback về rawStatus từ Firebase
  if (rawStatus === 'online' || rawStatus === 'active') return 'online';
  if (rawStatus === 'offline' || rawStatus === 'inactive') return 'offline';
  return 'unknown';
}
