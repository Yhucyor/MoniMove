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
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../mail/mail.service");
const DB_URL = process.env.FIREBASE_RTDB_URL || 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';
const EMERGENCY_ALERT_TYPES = [
    'ngã đổ',
    'ngã đổ xe',
    'va chạm',
    'chấn động mạnh',
    'pin cực thấp',
    'fall detected',
    'strong impact',
    'crash',
    'emergency',
];
function isEmergency(alertType) {
    const lower = alertType.toLowerCase();
    return EMERGENCY_ALERT_TYPES.some((t) => lower.includes(t));
}
let AlertsService = AlertsService_1 = class AlertsService {
    constructor(mailService) {
        this.mailService = mailService;
        this.logger = new common_1.Logger(AlertsService_1.name);
    }
    async createAlert(alertData) {
        const timestamp = alertData.timestamp || Date.now();
        try {
            const payload = {
                deviceId: alertData.deviceId,
                alertType: alertData.alertType,
                message: alertData.message,
                timestamp,
                ...(alertData.location ? { location: alertData.location } : {}),
            };
            const response = await fetch(`${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            const data = await response.json();
            const alertId = data.name;
            this.logger.log(`Alert created: ${alertId} (${alertData.alertType})`);
            if (isEmergency(alertData.alertType)) {
                let sosEmail = alertData.sosEmail || null;
                if (!sosEmail) {
                    sosEmail = await this.getSosEmail(alertData.deviceId);
                }
                if (!sosEmail) {
                    sosEmail = process.env.SMTP_USER || null;
                    if (sosEmail) {
                        this.logger.warn(`⚠️ No SOS email for ${alertData.deviceId} — fallback to system email: ${sosEmail}`);
                    }
                }
                if (sosEmail) {
                    this.logger.log(`📧 Sending emergency email to: ${sosEmail} (type: ${alertData.alertType})`);
                    this.mailService.sendEmergencyEmail(sosEmail, {
                        alertType: alertData.alertType,
                        message: alertData.message,
                        deviceId: alertData.deviceId,
                        timestamp,
                        location: alertData.location,
                    }).catch((err) => {
                        this.logger.error(`Email failed: ${err.message}`);
                    });
                }
            }
            return { success: true, alertId };
        }
        catch (error) {
            this.logger.error('Error saving alert:', error);
            throw error;
        }
    }
    async getSosEmail(deviceId) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/settings/${deviceId}/sos_email.json?auth=${DB_SECRET}`);
            if (!response.ok)
                return null;
            const val = await response.json();
            return typeof val === 'string' && val.includes('@') ? val : null;
        }
        catch {
            return null;
        }
    }
    async getAlerts(deviceId) {
        try {
            const response = await fetch(`${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`);
            if (!response.ok)
                throw new Error(`HTTP error ${response.status}`);
            const data = await response.json();
            if (!data)
                return [];
            const alerts = Object.keys(data)
                .map((key) => {
                const item = data[key];
                if (!item || typeof item !== 'object')
                    return null;
                return {
                    id: key,
                    deviceId: item.deviceId,
                    alertType: item.alertType,
                    message: item.message,
                    timestamp: item.timestamp,
                    location: item.location || null,
                };
            })
                .filter(Boolean);
            alerts.sort((a, b) => b.timestamp - a.timestamp);
            return deviceId ? alerts.filter((a) => a.deviceId === deviceId) : alerts;
        }
        catch (error) {
            this.logger.error('Error fetching alerts:', error instanceof Error ? error.message : String(error));
        }
        const now = Date.now();
        return [
            {
                id: 'mock-alert-1',
                deviceId: 'DEVICE_ESP32_01',
                alertType: 'Ngã đổ xe',
                message: 'Cảnh báo: Thiết bị bị ngã nghiêng quá góc 45°!',
                timestamp: now - 3600000 * 2,
                location: null,
            },
            {
                id: 'mock-alert-2',
                deviceId: 'DEVICE_ESP32_01',
                alertType: 'Chấn động mạnh',
                message: 'Cảnh báo: Phát hiện va chạm mạnh bất thường (Gia tốc > 4.5G)!',
                timestamp: now - 3600000 * 24,
                location: null,
            },
            {
                id: 'mock-alert-3',
                deviceId: 'DEVICE_ESP32_01',
                alertType: 'Ngã đổ xe',
                message: 'Cảnh báo: Thiết bị bị ngã nghiêng quá góc 45°!',
                timestamp: now - 3600000 * 48,
                location: null,
            },
        ];
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map