import { Injectable } from "@nestjs/common";

export interface DeviceSettings {
  sos_email?: string;
  sos_phone?: string;
  // ── Tên field mới đồng bộ với IoT firmware ──
  impactSensitivity?: number; // 1–5 (cấp độ nhạy va chạm)
  fallAngleThreshold?: number; // 0–90 (góc nghiêng báo ngã, độ)
  speedThreshold?: number; // 0–200 (tốc độ cảnh báo, km/h)
  enable_sms?: boolean;
  enable_audio?: boolean;
}

const DB_URL =
  process.env.FIREBASE_RTDB_URL ||
  "https://monitoring-d6063-default-rtdb.firebaseio.com";
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || "";

/**
 * SettingsService — MoveMonitor
 * Lưu và đọc cài đặt per-device từ Firebase RTDB:
 *   tracking_system/settings/{deviceId}/...
 *
 * Field names:
 *   impactSensitivity   : 1–5   (Cấp 1 = nhạy nhất, Cấp 5 = kém nhạy nhất)
 *   fallAngleThreshold  : 0–90  (độ)
 *   speedThreshold      : 0–200 (km/h)
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

  async saveSettings(
    deviceId: string,
    settings: DeviceSettings,
  ): Promise<{ success: boolean }> {
    // PATCH — merge với settings cũ
    const existing = await this.getSettings(deviceId);
    const merged = { ...existing, ...settings };

    const res = await fetch(
      `${DB_URL}/tracking_system/settings/${deviceId}.json?auth=${DB_SECRET}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true };
  }

  private defaults(): DeviceSettings {
    return {
      impactSensitivity: 3,
      fallAngleThreshold: 45,
      speedThreshold: 80,
      enable_sms: true,
      enable_audio: true,
    };
  }
}
