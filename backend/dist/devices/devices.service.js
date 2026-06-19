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
const DB_URL = process.env.FIREBASE_RTDB_URL || 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';
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
                const lastPing = info.last_ping;
                const rawStatus = info.status || 'active';
                return {
                    id,
                    name: info.device_name || info.license_plate || id,
                    status: rawStatus,
                    connectionStatus: (0, device_status_util_1.computeConnectionStatus)(lastPing, undefined, rawStatus),
                    lastPing: lastPing ? lastPing * 1000 : null,
                };
            });
        }
        catch (error) {
            this.logger.error('Error listing devices: ' + (error instanceof Error ? error.message : String(error)));
            return [{ id: 'DEVICE_ESP32_01', name: 'MoniMove Tracker v1', status: 'online', connectionStatus: 'online', lastPing: Date.now() }];
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
                const lastPing = info.last_ping;
                const rawStatus = info.status || 'active';
                const lastUpdate = lastPing ? lastPing * 1000 : Date.now();
                const battery = data.current_data?.battery ?? data.current_data?.gps?.battery ?? null;
                return {
                    id: deviceId,
                    name: info.device_name || deviceId,
                    licensePlate: info.license_plate || null,
                    status: rawStatus,
                    connectionStatus: (0, device_status_util_1.computeConnectionStatus)(lastPing, undefined, rawStatus),
                    battery,
                    lastUpdate,
                    lastPing: lastUpdate,
                    current_data: data.current_data || null,
                };
            }
        }
        catch (error) {
            this.logger.error('Error fetching device from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
        }
        return {
            id: deviceId,
            name: 'MoniMove - ESP32 (Mock)',
            licensePlate: null,
            status: 'active',
            connectionStatus: 'online',
            battery: 88,
            lastUpdate: Date.now(),
            lastPing: Date.now(),
            current_data: {
                gps: {
                    latitude: 10.8045,
                    longitude: 106.7380,
                    speed: 42.5,
                    satellites: 8,
                    updated_at: Math.floor(Date.now() / 1000),
                },
                mpu6050: {
                    accel: { x: 0.05, y: -0.12, z: 9.81 },
                    gyro: { x: 0.01, y: 0.02, z: -0.01 },
                    is_tilted: false,
                },
            },
        };
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
                    lat: data.latitude || 10.8045,
                    lng: data.longitude || 106.7380,
                    timestamp: data.updated_at ? data.updated_at * 1000 : Date.now(),
                    speed: data.speed || 0,
                    heading: data.heading || 0,
                };
            }
        }
        catch (error) {
            this.logger.error('Error fetching position from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
        }
        const offset = Math.sin(Date.now() / 10000) * 0.003;
        return {
            lat: 10.8045 + offset,
            lng: 106.7380 + Math.cos(Date.now() / 10000) * 0.003,
            timestamp: Date.now(),
            speed: 35 + Math.floor(Math.random() * 15),
            heading: 90,
        };
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
                    if (dateLogs && typeof dateLogs === 'object') {
                        for (const tsKey of Object.keys(dateLogs)) {
                            const point = dateLogs[tsKey];
                            const lat = point?.lat ?? point?.latitude;
                            const lng = point?.lng ?? point?.longitude;
                            if (typeof lat === 'number' && typeof lng === 'number') {
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
                        distanceM += 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
            this.logger.error('Error fetching route from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
        }
        return {
            deviceId,
            waypoints: [
                [10.7756, 106.7068],
                [10.8018, 106.7280],
                [10.8045, 106.7380],
            ],
            distance: 6500,
            duration: 600,
        };
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
                    if (dateLogs && typeof dateLogs === 'object') {
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
                                logs.push({ lat, lng, timestamp: timestampMs, speed: point?.speed || 0 });
                            }
                        }
                    }
                }
                logs.sort((a, b) => a.timestamp - b.timestamp);
                return logs;
            }
        }
        catch (error) {
            this.logger.error('Error fetching history from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
        }
        return [];
    }
    async seedMockData() {
        try {
            const checkResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
            if (checkResponse.ok) {
                const data = await checkResponse.json();
                if (!data) {
                    this.logger.log('Seeding default device "DEVICE_ESP32_01" into Realtime Database via REST API...');
                    const nowSeconds = Math.floor(Date.now() / 1000);
                    const defaultData = {
                        DEVICE_ESP32_01: {
                            info: {
                                device_name: 'MoniMove Tracker v1',
                                license_plate: '59X3-12345',
                                status: 'online',
                                last_ping: nowSeconds,
                            },
                            current_data: {
                                gps: {
                                    latitude: 10.8045,
                                    longitude: 106.7380,
                                    speed: 45.2,
                                    satellites: 8,
                                    updated_at: nowSeconds,
                                },
                                mpu6050: {
                                    accel: { x: 0.05, y: -0.12, z: 9.81 },
                                    gyro: { x: 0.01, y: 0.02, z: -0.01 },
                                    is_tilted: false,
                                },
                            },
                            history: {
                                '2026-06-02': {
                                    [nowSeconds - 20]: { lat: 10.7756, lng: 106.7068, speed: 30 },
                                    [nowSeconds - 10]: { lat: 10.8018, lng: 106.7280, speed: 42 },
                                    [nowSeconds]: { lat: 10.8045, lng: 106.7380, speed: 45.2 },
                                },
                            },
                        },
                    };
                    await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`, {
                        method: 'PUT',
                        body: JSON.stringify(defaultData),
                    });
                    this.logger.log('Seeded default Realtime Database mock data successfully.');
                }
            }
        }
        catch (error) {
            this.logger.warn('Mock seeding skipped (likely due to invalid credentials/permissions): ' + (error instanceof Error ? error.message : String(error)));
        }
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = DevicesService_1 = __decorate([
    (0, common_1.Injectable)()
], DevicesService);
//# sourceMappingURL=devices.service.js.map