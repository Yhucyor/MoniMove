"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DevicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const device_status_util_1 = require("../common/utils/device-status.util");
const DB_URL = process.env.FIREBASE_RTDB_URL ||
    "https://monitoring-d6063-default-rtdb.firebaseio.com";
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || "";
let DevicesService = DevicesService_1 = class DevicesService {
    constructor() {
        this.logger = new common_1.Logger(DevicesService_1.name);
    }
    async onModuleInit() {
        await this.seedMockData();
    }
    async listAllDevices() {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            const devicesVal = await response.json();
            if (!devicesVal)
                return [];
            return Object.keys(devicesVal).map((id) => {
                const info = devicesVal[id]?.info || {};
                const gps = devicesVal[id]?.current_data?.gps || {};
                const lastPing = info.last_ping;
                const gpsUpdatedAt = gps.updated_at;
                const rawStatus = info.status || "active";
                return {
                    id,
                    name: info.device_name || info.license_plate || id,
                    status: rawStatus,
                    connectionStatus: (0, device_status_util_1.computeConnectionStatus)(lastPing, undefined, rawStatus, gpsUpdatedAt),
                    lastPing: lastPing ? lastPing * 1000 : null,
                };
            });
        }
        catch (error) {
            this.logger.error("Error listing devices: " +
                (error instanceof Error ? error.message : String(error)));
            return [];
        }
    }
    async getDevice(deviceId) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}.json?auth=${DB_SECRET}`);
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            let data = await response.json();
            if (!data) {
                this.logger.warn(`Device "${deviceId}" not found in database, fetching fallback device...`);
                const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
                if (allResponse.ok) {
                    const devicesVal = await allResponse.json();
                    if (devicesVal) {
                        const keys = Object.keys(devicesVal);
                        if (keys.length > 0) {
                            deviceId = keys[0];
                            data = devicesVal[deviceId];
                            this.logger.log(`Fallback mapped successfully to device ID: "${deviceId}"`);
                        }
                    }
                }
            }
            if (data) {
                const info = data.info || {};
                const gps = data.current_data?.gps || {};
                const lastPing = info.last_ping;
                const gpsUpdatedAt = gps.updated_at;
                const rawStatus = info.status || "active";
                const lastUpdate = gpsUpdatedAt
                    ? gpsUpdatedAt * 1000
                    : lastPing
                        ? lastPing * 1000
                        : Date.now();
                const battery = data.current_data?.battery ?? gps?.battery ?? null;
                return {
                    id: deviceId,
                    name: info.device_name || deviceId,
                    licensePlate: info.license_plate || null,
                    status: rawStatus,
                    connectionStatus: (0, device_status_util_1.computeConnectionStatus)(lastPing, undefined, rawStatus, gpsUpdatedAt),
                    battery,
                    lastUpdate,
                    lastPing: lastUpdate,
                    current_data: data.current_data || null,
                };
            }
        }
        catch (error) {
            this.logger.error("Error fetching device from Realtime Database REST API: " +
                (error instanceof Error ? error.message : String(error)));
        }
        return null;
    }
    async getLatestPosition(deviceId) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}/current_data/gps.json?auth=${DB_SECRET}`);
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            let data = await response.json();
            if (!data) {
                const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
                if (allResponse.ok) {
                    const devicesVal = await allResponse.json();
                    if (devicesVal) {
                        const keys = Object.keys(devicesVal);
                        if (keys.length > 0) {
                            const fallbackId = keys[0];
                            const gpsResponse = await fetch(`${DB_URL}/tracking_system/devices/${fallbackId}/current_data/gps.json?auth=${DB_SECRET}`);
                            if (gpsResponse.ok) {
                                data = await gpsResponse.json();
                            }
                        }
                    }
                }
            }
            if (data) {
                return {
                    lat: data.latitude ?? 0,
                    lng: data.longitude ?? 0,
                    timestamp: data.updated_at ? data.updated_at * 1000 : Date.now(),
                    speed: data.speed || 0,
                    heading: data.heading || 0,
                };
            }
        }
        catch (error) {
            this.logger.error("Error fetching position from Realtime Database REST API: " +
                (error instanceof Error ? error.message : String(error)));
        }
        return null;
    }
    async getRoute(deviceId) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}.json?auth=${DB_SECRET}`);
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            let deviceData = await response.json();
            if (!deviceData) {
                const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
                if (allResponse.ok) {
                    const devicesVal = await allResponse.json();
                    if (devicesVal) {
                        const keys = Object.keys(devicesVal);
                        if (keys.length > 0) {
                            const fallbackId = keys[0];
                            deviceId = fallbackId;
                            deviceData = devicesVal[fallbackId];
                        }
                    }
                }
            }
            if (deviceData && deviceData.history) {
                const dates = Object.keys(deviceData.history);
                const allLogs = [];
                for (const date of dates) {
                    const dateLogs = deviceData.history[date];
                    if (dateLogs && typeof dateLogs === "object") {
                        for (const tsKey of Object.keys(dateLogs)) {
                            const point = dateLogs[tsKey];
                            const lat = point?.lat ?? point?.latitude;
                            const lng = point?.lng ?? point?.longitude;
                            if (typeof lat === "number" && typeof lng === "number") {
                                allLogs.push({ timestamp: Number(tsKey), lat, lng });
                            }
                        }
                    }
                }
                allLogs.sort((a, b) => a.timestamp - b.timestamp);
                if (allLogs.length > 0) {
                    let distanceM = 0;
                    for (let i = 1; i < allLogs.length; i++) {
                        const p1 = allLogs[i - 1];
                        const p2 = allLogs[i];
                        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
                        const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
                        const a = Math.sin(dLat / 2) ** 2 +
                            Math.cos((p1.lat * Math.PI) / 180) *
                                Math.cos((p2.lat * Math.PI) / 180) *
                                Math.sin(dLng / 2) ** 2;
                        distanceM +=
                            6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    }
                    const durationSec = allLogs.length > 1
                        ? allLogs[allLogs.length - 1].timestamp - allLogs[0].timestamp
                        : 0;
                    return {
                        deviceId,
                        waypoints: allLogs.map((l) => [l.lat, l.lng]),
                        distance: Math.round(distanceM),
                        duration: durationSec,
                    };
                }
            }
        }
        catch (error) {
            this.logger.error("Error fetching route from Realtime Database REST API: " +
                (error instanceof Error ? error.message : String(error)));
        }
        return { deviceId, waypoints: [], distance: 0, duration: 0 };
    }
    async getHistory(deviceId, start, end) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}/history.json?auth=${DB_SECRET}`);
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            let historyData = await response.json();
            if (!historyData) {
                const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
                if (allResponse.ok) {
                    const devicesVal = await allResponse.json();
                    if (devicesVal) {
                        const keys = Object.keys(devicesVal);
                        if (keys.length > 0) {
                            const fallbackId = keys[0];
                            historyData = devicesVal[fallbackId].history;
                        }
                    }
                }
            }
            if (historyData) {
                const startNum = Number(start);
                const endNum = Number(end);
                const logs = [];
                const dates = Object.keys(historyData);
                for (const date of dates) {
                    const dateLogs = historyData[date];
                    if (dateLogs && typeof dateLogs === "object") {
                        for (const tsKey of Object.keys(dateLogs)) {
                            const point = dateLogs[tsKey];
                            let timestamp = Number(tsKey);
                            let timestampMs = timestamp;
                            if (timestamp.toString().length === 10) {
                                timestampMs = timestamp * 1000;
                            }
                            if (timestampMs >= startNum && timestampMs <= endNum) {
                                const lat = point?.lat ?? point?.latitude ?? 0;
                                const lng = point?.lng ?? point?.longitude ?? 0;
                                logs.push({
                                    lat,
                                    lng,
                                    timestamp: timestampMs,
                                    speed: point?.speed || 0,
                                });
                            }
                        }
                    }
                }
                logs.sort((a, b) => a.timestamp - b.timestamp);
                return logs;
            }
        }
        catch (error) {
            this.logger.error("Error fetching history from Realtime Database REST API: " +
                (error instanceof Error ? error.message : String(error)));
        }
        return [];
    }
    async seedMockData() {
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = DevicesService_1 = __decorate([
    (0, common_1.Injectable)()
], DevicesService);
//# sourceMappingURL=devices.service.js.map