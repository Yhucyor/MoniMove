"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RtdbListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtdbListenerService = void 0;
const common_1 = require("@nestjs/common");
const realtime_gateway_1 = require("./realtime.gateway");
const mail_service_1 = require("../mail/mail.service");
const alerts_service_1 = require("../alerts/alerts.service");
const DB_URL = process.env.FIREBASE_RTDB_URL ||
    "https://monitoring-d6063-default-rtdb.firebaseio.com";
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || "";
const MOVEMENT_SPEED_KMH = 2;
const MIN_DISTANCE_M = 30;
const SAVE_INTERVAL_MS = 60_000;
const STOP_TIMEOUT_MS = 5 * 60_000;
function haversineM(lat1, lng1, lat2, lng2) {
    const R = 6_371_000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
let RtdbListenerService = RtdbListenerService_1 = class RtdbListenerService {
    constructor(gateway, mailService) {
        this.gateway = gateway;
        this.mailService = mailService;
        this.logger = new common_1.Logger(RtdbListenerService_1.name);
        this.pollInterval = null;
        this.lastDeviceSnapshots = new Map();
        this.lastAlertCount = 0;
        this.knownAlertIds = new Set();
        this.tripStates = new Map();
    }
    onModuleInit() {
        setTimeout(() => this.startPolling(), 3000);
    }
    onModuleDestroy() {
        if (this.pollInterval)
            clearInterval(this.pollInterval);
    }
    startPolling() {
        this.logger.log("🔄 RTDB Listener started — polling every 3s | Trip detection: ON");
        this.pollInterval = setInterval(() => this.poll(), 3000);
        this.poll();
    }
    async poll() {
        await Promise.all([this.pollDevices(), this.pollAlerts()]);
    }
    async pollDevices() {
        try {
            const res = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}&shallow=false`);
            if (!res.ok)
                return;
            const devices = await res.json();
            if (!devices)
                return;
            for (const [deviceId, deviceData] of Object.entries(devices)) {
                const current = deviceData?.current_data;
                const info = deviceData?.info || {};
                if (!current)
                    continue;
                const hash = JSON.stringify({
                    gps: current.gps,
                    mpu: current.mpu6050,
                    bat: current.battery,
                });
                const prev = this.lastDeviceSnapshots.get(deviceId);
                if (hash !== prev) {
                    this.lastDeviceSnapshots.set(deviceId, hash);
                    const gps = current.gps || {};
                    const mpu = current.mpu6050 || {};
                    const lastPing = info.last_ping;
                    const gpsUpdatedAt = gps.updated_at;
                    const nowSec = Math.floor(Date.now() / 1000);
                    const gpsAge = gpsUpdatedAt ? nowSec - gpsUpdatedAt : Infinity;
                    const pingAge = lastPing ? nowSec - lastPing : Infinity;
                    const isOnline = gpsAge < 300 || pingAge < 86400;
                    this.gateway.pushDeviceUpdate({
                        deviceId,
                        lat: gps.latitude,
                        lng: gps.longitude,
                        speed: gps.speed,
                        battery: current.battery,
                        status: isOnline ? "online" : "offline",
                        isTilted: mpu.is_tilted ?? false,
                        timestamp: gps.updated_at ? gps.updated_at * 1000 : Date.now(),
                    });
                }
                const gps = current.gps || {};
                const lat = gps.latitude ?? gps.lat;
                const lng = gps.longitude ?? gps.lng;
                if (typeof lat !== "number" || typeof lng !== "number")
                    continue;
                if (lat === 0 && lng === 0)
                    continue;
                await this.handleTripDetection(deviceId, lat, lng, gps.speed ?? 0);
            }
        }
        catch (err) {
            this.logger.warn("Device poll error: " + err.message);
        }
    }
    async handleTripDetection(deviceId, lat, lng, speed) {
        const now = Date.now();
        if (!this.tripStates.has(deviceId)) {
            this.tripStates.set(deviceId, {
                isInTrip: false,
                lastMovedAt: 0,
                lastSavedAt: 0,
                lastSavedLat: lat,
                lastSavedLng: lng,
            });
        }
        const state = this.tripStates.get(deviceId);
        const distFromLastSave = haversineM(state.lastSavedLat, state.lastSavedLng, lat, lng);
        const isMoving = speed >= MOVEMENT_SPEED_KMH || distFromLastSave >= MIN_DISTANCE_M;
        if (isMoving) {
            state.lastMovedAt = now;
            if (!state.isInTrip) {
                state.isInTrip = true;
                this.logger.log(`🚴 [${deviceId}] Trip started — speed=${speed} km/h dist=${distFromLastSave.toFixed(0)}m`);
            }
            const timeSinceLastSave = now - state.lastSavedAt;
            const shouldSaveByTime = timeSinceLastSave >= SAVE_INTERVAL_MS;
            const shouldSaveByDist = distFromLastSave >= MIN_DISTANCE_M && timeSinceLastSave >= 10_000;
            if (shouldSaveByTime || shouldSaveByDist) {
                await this.saveHistoryPoint(deviceId, lat, lng, speed, now);
                state.lastSavedAt = now;
                state.lastSavedLat = lat;
                state.lastSavedLng = lng;
            }
        }
        else {
            if (state.isInTrip) {
                const stoppedDurationMs = now - state.lastMovedAt;
                if (stoppedDurationMs >= STOP_TIMEOUT_MS) {
                    state.isInTrip = false;
                    this.logger.log(`🛑 [${deviceId}] Trip ended — stopped for ${Math.round(stoppedDurationMs / 60000)}min`);
                }
            }
        }
    }
    async saveHistoryPoint(deviceId, lat, lng, speed, nowMs) {
        const now = new Date(nowMs);
        const y = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        const dateKey = `${y}-${mo}-${d}`;
        const timestampSec = Math.floor(nowMs / 1000);
        const url = `${DB_URL}/tracking_system/devices/${deviceId}/history/${dateKey}/${timestampSec}.json${DB_SECRET ? `?auth=${DB_SECRET}` : ""}`;
        try {
            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lat,
                    lng,
                    latitude: lat,
                    longitude: lng,
                    speed,
                }),
            });
            const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            this.logger.log(`📍 [${deviceId}] Saved ${dateKey} ${hhmm} — (${lat.toFixed(5)}, ${lng.toFixed(5)}) ${speed} km/h`);
        }
        catch (err) {
            this.logger.warn(`History write error [${deviceId}]: ${err.message}`);
        }
    }
    async pollAlerts() {
        try {
            const res = await fetch(`${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`);
            if (!res.ok)
                return;
            const data = await res.json();
            if (!data)
                return;
            for (const [alertId, alert] of Object.entries(data)) {
                if (this.knownAlertIds.has(alertId))
                    continue;
                this.knownAlertIds.add(alertId);
                if (this.lastAlertCount === 0)
                    continue;
                this.gateway.pushAlert({
                    id: alertId,
                    deviceId: alert.deviceId || "",
                    alertType: alert.alertType || alert.type || "unknown",
                    severity: alert.severity || "warning",
                    message: alert.message || "",
                    timestamp: alert.timestamp || Date.now(),
                    location: alert.location,
                });
                this.logger.log(`🚨 New alert pushed via WS: ${alert.alertType} for ${alert.deviceId}`);
                if (alert.alertType && (0, alerts_service_1.isEmergency)(alert.alertType)) {
                    this.processEmergencyEmail({
                        id: alertId,
                        deviceId: alert.deviceId || "Unknown",
                        alertType: alert.alertType,
                        message: alert.message || "",
                        timestamp: alert.timestamp || Date.now(),
                        location: alert.location,
                    });
                }
            }
            this.lastAlertCount = Object.keys(data).length;
        }
        catch (err) {
            this.logger.warn("Alert poll error: " + err.message);
        }
    }
    async getSosEmail(deviceId) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/settings/${deviceId}/sos_email.json?auth=${DB_SECRET}`);
            if (!response.ok)
                return null;
            const val = await response.json();
            return typeof val === "string" && val.includes("@") ? val : null;
        }
        catch {
            return null;
        }
    }
    async processEmergencyEmail(alertData) {
        let sosEmail = null;
        sosEmail = await this.getSosEmail(alertData.deviceId);
        if (!sosEmail) {
            sosEmail = process.env.SMTP_USER || null;
            if (sosEmail) {
                this.logger.warn(`⚠️ No SOS email for ${alertData.deviceId} — fallback to system email: ${sosEmail}`);
            }
        }
        if (sosEmail) {
            this.logger.log(`📧 RTDB Listener sending emergency email to: ${sosEmail} (type: ${alertData.alertType})`);
            this.mailService.sendEmergencyEmail(sosEmail, alertData).catch((err) => {
                this.logger.error(`Email failed: ${err.message}`);
            });
        }
    }
};
exports.RtdbListenerService = RtdbListenerService;
exports.RtdbListenerService = RtdbListenerService = RtdbListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway,
        mail_service_1.MailService])
], RtdbListenerService);
//# sourceMappingURL=rtdb-listener.service.js.map