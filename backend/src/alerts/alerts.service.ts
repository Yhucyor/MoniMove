import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

/**
 * AlertsService — Merged từ MoniMove_v2 + MoniMove (v3)
 *
 * Env vars (unified):
 *   FIREBASE_RTDB_URL    — URL Firebase Realtime Database
 *   FIREBASE_RTDB_SECRET — Legacy secret để REST API
 *
 * v2: getAlerts với fallback mock data
 * v3: createAlert với email khẩn cấp qua MailService + getSosEmail từ RTDB
 *
 * Merged: kết hợp đầy đủ — createAlert gửi email + getAlerts giữ mock fallback
 */

const DB_URL = process.env.FIREBASE_RTDB_URL || 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';

// Các loại cảnh báo khẩn cấp sẽ trigger gửi email
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

function isEmergency(alertType: string): boolean {
  const lower = alertType.toLowerCase();
  return EMERGENCY_ALERT_TYPES.some((t) => lower.includes(t));
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly mailService: MailService) {}

  async createAlert(alertData: {
    deviceId: string;
    alertType: string;
    message: string;
    timestamp?: number;
    location?: { lat: number; lng: number };
    sosEmail?: string;
  }) {
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

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const alertId = data.name; // Firebase POST returns { name: "-N..." }

      this.logger.log(`Alert created: ${alertId} (${alertData.alertType})`);

      // Gửi email khẩn cấp nếu là loại nguy hiểm
      if (isEmergency(alertData.alertType)) {
        // Thứ tự ưu tiên tìm SOS email:
        // 1. Email truyền thẳng từ frontend (sosEmail field)
        // 2. Đọc từ Firebase RTDB (tracking_system/settings/{deviceId}/sos_email)
        // 3. Fallback: gửi về chính SMTP_USER (chủ hệ thống) để không bỏ sót
        let sosEmail: string | null = alertData.sosEmail || null;

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
          // fire-and-forget — không await để không block response
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
    } catch (error) {
      this.logger.error('Error saving alert:', error);
      throw error;
    }
  }

  /**
   * Đọc email SOS từ Firebase settings của device
   * Path: tracking_system/settings/{deviceId}/sos_email
   */
  private async getSosEmail(deviceId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${DB_URL}/tracking_system/settings/${deviceId}/sos_email.json?auth=${DB_SECRET}`,
      );
      if (!response.ok) return null;
      const val = await response.json();
      return typeof val === 'string' && val.includes('@') ? val : null;
    } catch {
      return null;
    }
  }

  async getAlerts(deviceId?: string) {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (!data) return [];

      const alerts: any[] = Object.keys(data)
        .map((key) => {
          const item = data[key];
          if (!item || typeof item !== 'object') return null;
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

      // Sort newest first
      alerts.sort((a, b) => b.timestamp - a.timestamp);
      return deviceId ? alerts.filter((a) => a.deviceId === deviceId) : alerts;
    } catch (error) {
      this.logger.error('Error fetching alerts:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }
}
