<<<<<<< HEAD
import { Injectable, Logger } from "@nestjs/common";
import { MailService } from "../mail/mail.service";

/**
 * AlertsService — Merged từ MoveMonitor_v2 + MoveMonitor (v3)
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

const DB_URL =
  process.env.FIREBASE_RTDB_URL ||
  "https://monitoring-d6063-default-rtdb.firebaseio.com";
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || "";

// Các loại cảnh báo khẩn cấp sẽ trigger gửi email
const EMERGENCY_ALERT_TYPES = [
  "ngã đổ",
  "ngã đổ xe",
  "va chạm",
  "chấn động mạnh",
  "pin cực thấp",
  "fall detected",
  "strong impact",
  "crash",
  "emergency",
];

export function isEmergency(alertType: string): boolean {
  const lower = alertType.toLowerCase();
  return EMERGENCY_ALERT_TYPES.some((t) => lower.includes(t));
}
=======
import { Injectable, Logger } from '@nestjs/common';

const DB_URL = 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = 'VjYAN6Ps3JLWEBSDGrZyoooncME4ggMQx5hU7kTb';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

<<<<<<< HEAD
  constructor(private readonly mailService: MailService) {}

  async processEmergencyEmail(alertData: {
    deviceId: string;
    alertType: string;
    message: string;
    timestamp: number;
    location?: { lat: number; lng: number };
    sosEmail?: string;
  }) {
    if (!isEmergency(alertData.alertType)) return;

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
        this.logger.warn(
          `⚠️ No SOS email for ${alertData.deviceId} — fallback to system email: ${sosEmail}`,
        );
      }
    }

    if (sosEmail) {
      this.logger.log(
        `📧 Sending emergency email to: ${sosEmail} (type: ${alertData.alertType})`,
      );
      // fire-and-forget — không await để không block
      this.mailService
        .sendEmergencyEmail(sosEmail, {
          alertType: alertData.alertType,
          message: alertData.message,
          deviceId: alertData.deviceId,
          timestamp: alertData.timestamp,
          location: alertData.location,
        })
        .catch((err) => {
          this.logger.error(`Email failed: ${err.message}`);
        });
    }
  }

=======
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  async createAlert(alertData: {
    deviceId: string;
    alertType: string;
    message: string;
    timestamp?: number;
<<<<<<< HEAD
    location?: { lat: number; lng: number };
    sosEmail?: string;
  }) {
    const timestamp = alertData.timestamp || Date.now();

=======
  }) {
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    try {
      const payload = {
        deviceId: alertData.deviceId,
        alertType: alertData.alertType,
        message: alertData.message,
<<<<<<< HEAD
        timestamp,
        ...(alertData.location ? { location: alertData.location } : {}),
      };

      const response = await fetch(
        `${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const alertId = data.name;

      this.logger.log(`Alert created: ${alertId} (${alertData.alertType})`);

      // Tái sử dụng logic gửi email
      this.processEmergencyEmail({
        deviceId: alertData.deviceId,
        alertType: alertData.alertType,
        message: alertData.message,
        timestamp,
        location: alertData.location,
        sosEmail: alertData.sosEmail,
      });

      return { success: true, alertId };
    } catch (error) {
      this.logger.error("Error saving alert:", error);
=======
        timestamp: alertData.timestamp || Date.now(),
      };
      
      const response = await fetch(`${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const alertId = data.name; // POST returns { name: "-N..." }
      
      this.logger.log(`Alert created successfully in Realtime Database REST API: ${alertId}`);
      return { success: true, alertId };
    } catch (error) {
      this.logger.error('Error saving alert in Realtime Database:', error);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      throw error;
    }
  }

<<<<<<< HEAD
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
      return typeof val === "string" && val.includes("@") ? val : null;
    } catch {
      return null;
    }
  }

  async getAlerts(deviceId?: string) {
    try {
      const response = await fetch(
        `${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`,
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();

      if (!data) return [];

      const alerts: any[] = Object.keys(data)
        .map((key) => {
          const item = data[key];
          if (!item || typeof item !== "object") return null;
          return {
=======
  async getAlerts(deviceId?: string) {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      
      if (!data) return [];

      const alerts: any[] = [];
      Object.keys(data).forEach((key) => {
        const item = data[key];
        if (item && typeof item === 'object') {
          alerts.push({
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
            id: key,
            deviceId: item.deviceId,
            alertType: item.alertType,
            message: item.message,
            timestamp: item.timestamp,
<<<<<<< HEAD
            location: item.location || null,
          };
        })
        .filter(Boolean);

      // Sort newest first
      alerts.sort((a, b) => b.timestamp - a.timestamp);
      return deviceId ? alerts.filter((a) => a.deviceId === deviceId) : alerts;
    } catch (error) {
      this.logger.error(
        "Error fetching alerts:",
        error instanceof Error ? error.message : String(error),
      );
      return [];
    }
=======
          });
        }
      });

      // Sort newest first
      alerts.sort((a, b) => b.timestamp - a.timestamp);

      if (deviceId) {
        return alerts.filter(a => a.deviceId === deviceId);
      }
      return alerts;
    } catch (error) {
      this.logger.error('Error fetching alerts from Realtime Database:', error.message || error);
    }

    // Fallback mock history if database fails
    const now = Date.now();
    return [
      {
        id: 'mock-alert-1',
        deviceId: 'DEVICE_ESP32_01',
        alertType: 'Ngã đổ xe',
        message: 'Cảnh báo: Thiết bị bị ngã nghiêng quá góc 45°!',
        timestamp: now - 3600000 * 2, // 2 hours ago
      },
      {
        id: 'mock-alert-2',
        deviceId: 'DEVICE_ESP32_01',
        alertType: 'Chấn động mạnh',
        message: 'Cảnh báo: Phát hiện va chạm mạnh bất thường (Gia tốc > 4.5G)!',
        timestamp: now - 3600000 * 24, // 1 day ago
      },
      {
        id: 'mock-alert-3',
        deviceId: 'DEVICE_ESP32_01',
        alertType: 'Ngã đổ xe',
        message: 'Cảnh báo: Thiết bị bị ngã nghiêng quá góc 45°!',
        timestamp: now - 3600000 * 48, // 2 days ago
      }
    ];
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}
