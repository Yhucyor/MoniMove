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
const DB_URL = process.env.FIREBASE_RTDB_URL ||
    'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';
let RtdbListenerService = RtdbListenerService_1 = class RtdbListenerService {
    constructor(gateway) {
        this.gateway = gateway;
        this.logger = new common_1.Logger(RtdbListenerService_1.name);
        this.pollInterval = null;
        this.lastDeviceSnapshots = new Map();
        this.lastAlertCount = 0;
        this.knownAlertIds = new Set();
    }
    onModuleInit() {
        setTimeout(() => this.startPolling(), 3000);
    }
    onModuleDestroy() {
        if (this.pollInterval)
            clearInterval(this.pollInterval);
    }
    startPolling() {
        this.logger.log('🔄 RTDB Listener started — polling every 3s');
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
                const hash = JSON.stringify({ gps: current.gps, mpu: current.mpu6050, bat: current.battery });
                const prev = this.lastDeviceSnapshots.get(deviceId);
                if (hash !== prev) {
                    this.lastDeviceSnapshots.set(deviceId, hash);
                    const gps = current.gps || {};
                    const mpu = current.mpu6050 || {};
                    const lastPing = info.last_ping;
                    const nowSec = Math.floor(Date.now() / 1000);
                    const isOnline = lastPing ? nowSec - lastPing < 86400 : info.status === 'online';
                    this.gateway.pushDeviceUpdate({
                        deviceId,
                        lat: gps.latitude,
                        lng: gps.longitude,
                        speed: gps.speed,
                        battery: current.battery,
                        status: isOnline ? 'online' : 'offline',
                        isTilted: mpu.is_tilted ?? false,
                        timestamp: gps.updated_at ? gps.updated_at * 1000 : Date.now(),
                    });
                }
            }
        }
        catch (err) {
            this.logger.warn('Device poll error: ' + err.message);
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
                    deviceId: alert.deviceId || '',
                    alertType: alert.alertType || alert.type || 'unknown',
                    severity: alert.severity || 'warning',
                    message: alert.message || '',
                    timestamp: alert.timestamp || Date.now(),
                    location: alert.location,
                });
                this.logger.log(`🚨 New alert pushed via WS: ${alert.alertType} for ${alert.deviceId}`);
            }
            this.lastAlertCount = Object.keys(data).length;
        }
        catch (err) {
            this.logger.warn('Alert poll error: ' + err.message);
        }
    }
};
exports.RtdbListenerService = RtdbListenerService;
exports.RtdbListenerService = RtdbListenerService = RtdbListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway])
], RtdbListenerService);
//# sourceMappingURL=rtdb-listener.service.js.map