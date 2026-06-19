"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFLINE_THRESHOLD_MS = void 0;
exports.computeConnectionStatus = computeConnectionStatus;
exports.OFFLINE_THRESHOLD_MS = 24 * 60 * 60 * 1000;
function computeConnectionStatus(lastPingSeconds, lastUpdateMs, rawStatus) {
    let lastPingMs = null;
    if (lastPingSeconds)
        lastPingMs = lastPingSeconds * 1000;
    else if (lastUpdateMs)
        lastPingMs = lastUpdateMs;
    if (lastPingMs) {
        return Date.now() - lastPingMs > exports.OFFLINE_THRESHOLD_MS ? 'offline' : 'online';
    }
    if (rawStatus === 'online' || rawStatus === 'active')
        return 'online';
    if (rawStatus === 'offline' || rawStatus === 'inactive')
        return 'offline';
    return 'unknown';
}
//# sourceMappingURL=device-status.util.js.map