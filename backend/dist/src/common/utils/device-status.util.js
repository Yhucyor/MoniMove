"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeConnectionStatus = computeConnectionStatus;
const GPS_ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const LAST_PING_THRESHOLD_MS = 24 * 60 * 60 * 1000;
function computeConnectionStatus(lastPingSeconds, lastUpdateMs, rawStatus, gpsUpdatedAtSeconds) {
    if (gpsUpdatedAtSeconds && gpsUpdatedAtSeconds > 0) {
        const gpsAgeMs = Math.abs(Date.now() - gpsUpdatedAtSeconds * 1000);
        if (gpsAgeMs <= GPS_ONLINE_THRESHOLD_MS)
            return "online";
    }
    if (lastPingSeconds && lastPingSeconds > 0) {
        const pingAgeMs = Math.abs(Date.now() - lastPingSeconds * 1000);
        if (pingAgeMs <= LAST_PING_THRESHOLD_MS)
            return "online";
        return "offline";
    }
    if (lastUpdateMs && lastUpdateMs > 0) {
        const ageMs = Math.abs(Date.now() - lastUpdateMs);
        if (ageMs <= GPS_ONLINE_THRESHOLD_MS)
            return "online";
    }
    if (rawStatus === "online" || rawStatus === "active")
        return "online";
    if (rawStatus === "offline" || rawStatus === "inactive")
        return "offline";
    return "unknown";
}
//# sourceMappingURL=device-status.util.js.map