import { Injectable } from '@nestjs/common';

export interface DeviceSettings {
  sos_email?: string;
  sos_phone?: string;
  tilt_threshold?: number;    // degrees
  accel_threshold?: number;   // G-force
  speed_threshold?: number;   // km/h
  sensitivity?: number;       // 1-5
  enable_sms?: boolean;
  enable_audio?: boolean;
}

const DB_URL = process.env.FIREBASE_RTDB_URL || 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';

/**
 * SettingsService — từ MoniMove v3
 * Lưu và đọc cài đặt per-device từ Firebase RTDB:
 *   tracking_system/settings/{deviceId}/...
 *
 * Sử dụng env vars thống nhất: FIREBASE_RTDB_URL, FIREBASE_RTDB_SECRET
 */
@Injectable()
export class SettingsService {
  async getSettings(deviceId: string): Promise<DeviceSettings> {
    try {
      const res = await fetch(
        `${DB_URL}/tracking_system/settings/${deviceId}.json?auth=${DB_SECRET}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data || this.defaults();
    } catch {
      return this.defaults();
    }
  }

  async saveSettings(deviceId: string, settings: DeviceSettings): Promise<{ success: boolean }> {
    // PATCH — merge với settings cũ
    const existing = await this.getSettings(deviceId);
    const merged = { ...existing, ...settings };

    const res = await fetch(
      `${DB_URL}/tracking_system/settings/${deviceId}.json?auth=${DB_SECRET}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true };
  }

  private defaults(): DeviceSettings {
    return {
      tilt_threshold: 45,
      accel_threshold: 2.5,
      speed_threshold: 80,
      sensitivity: 3,
      enable_sms: true,
      enable_audio: true,
    };
  }
}
