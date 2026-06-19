"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const DB_URL = process.env.FIREBASE_RTDB_URL || 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';
let SettingsService = class SettingsService {
    async getSettings(deviceId) {
        try {
            const res = await fetch(`${DB_URL}/tracking_system/settings/${deviceId}.json?auth=${DB_SECRET}`);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data || this.defaults();
        }
        catch {
            return this.defaults();
        }
    }
    async saveSettings(deviceId, settings) {
        const existing = await this.getSettings(deviceId);
        const merged = { ...existing, ...settings };
        const res = await fetch(`${DB_URL}/tracking_system/settings/${deviceId}.json?auth=${DB_SECRET}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged),
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        return { success: true };
    }
    defaults() {
        return {
            tilt_threshold: 45,
            accel_threshold: 2.5,
            speed_threshold: 80,
            sensitivity: 3,
            enable_sms: true,
            enable_audio: true,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)()
], SettingsService);
//# sourceMappingURL=settings.service.js.map