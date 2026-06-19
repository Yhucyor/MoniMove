/**
 * Alert Processor Service
 * Đọc ngưỡng từ Settings (localStorage) để áp dụng vào các rule
 */

import { ref, set, get } from "firebase/database";
import { db } from "../core/config/firebase";
import { sendAlert } from "./api";

// Hằng số đơn vị — phần cứng ESP32 gửi accel trong m/s²
const G = 9.81;

// ── Đọc ngưỡng từ Settings ─────────────────────────────────────────────────
function getTiltThreshold(): number {
  if (typeof window === "undefined") return 45;
  return Number(localStorage.getItem("settings_tilt") ?? 45);
}

function getSensitivityGForce(): number {
  if (typeof window === "undefined") return 2.5;
  // sensitivity 1–5 → G-force 4.0 (rất nhạy) .. 1.5 (chỉ va chạm mạnh)
  const level = Number(localStorage.getItem("settings_sensitivity") ?? 3);
  const map: Record<number, number> = {
    1: 4.0,
    2: 3.2,
    3: 2.5,
    4: 2.0,
    5: 1.5,
  };
  return map[Math.min(5, Math.max(1, level))] ?? 2.5;
}

interface DeviceData {
  gps?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  };
  mpu6050?: {
    // Nested (hardware thực tế)
    accel?: { x: number; y: number; z: number };
    gyro?: { x: number; y: number; z: number };
    is_tilted?: boolean;
    // Flat legacy
    angle_x?: number;
    angle_y?: number;
    angle_z?: number;
    accel_x?: number;
    accel_y?: number;
    accel_z?: number;
  };
  battery?: number;
  temperature?: number;
  humidity?: number;
  timestamp?: number;
}

interface AlertRule {
  type: string;
  condition: (data: DeviceData) => boolean;
  severity: "critical" | "warning" | "info";
  message: (data: DeviceData) => string;
  cooldown?: number; // seconds
}

// Alert rules configuration
const ALERT_RULES: AlertRule[] = [
  // 1. Ngã đổ (Tilt detection)
  {
    type: "Ngã đổ",
    severity: "critical",
    condition: (data) => {
      const mpu = data.mpu6050;
      if (!mpu) return false;
      if (mpu.is_tilted === true) return true;
      const threshold = getTiltThreshold();
      // Normalize m/s² → G (phần cứng ESP32 gửi m/s²)
      const ax = Math.abs((mpu.accel?.x ?? mpu.accel_x ?? 0) / G);
      const ay = Math.abs((mpu.accel?.y ?? mpu.accel_y ?? 0) / G);
      const az = Math.abs((mpu.accel?.z ?? mpu.accel_z ?? G) / G);
      const total = Math.sqrt(ax * ax + ay * ay + az * az);
      if (
        total > 0 &&
        Math.acos(Math.min(az / total, 1)) * (180 / Math.PI) > threshold
      )
        return true;
      return (
        Math.abs(mpu.angle_x ?? 0) > threshold ||
        Math.abs(mpu.angle_y ?? 0) > threshold
      );
    },
    message: (data) => {
      const mpu = data.mpu6050;
      if (mpu?.is_tilted)
        return "Cảnh báo nghiêm trọng: Cảm biến phát hiện thiết bị bị ngã! Cần hỗ trợ khẩn cấp.";
      const ax = Math.abs((mpu?.accel?.x ?? mpu?.accel_x ?? 0) / G);
      const ay = Math.abs((mpu?.accel?.y ?? mpu?.accel_y ?? 0) / G);
      const az = Math.abs((mpu?.accel?.z ?? mpu?.accel_z ?? G) / G);
      const total = Math.sqrt(ax * ax + ay * ay + az * az);
      const tiltAngle =
        total > 0 ? Math.acos(Math.min(az / total, 1)) * (180 / Math.PI) : 0;
      return `Cảnh báo nghiêm trọng: Thiết bị bị ngã với góc nghiêng ${tiltAngle.toFixed(1)}°! Cần hỗ trợ khẩn cấp.`;
    },
    cooldown: 60,
  },

  // 2. Va chạm mạnh — ngưỡng G-force đọc từ Settings
  {
    type: "Va chạm",
    severity: "critical",
    condition: (data) => {
      const mpu = data.mpu6050;
      if (!mpu) return false;
      // Normalize m/s² → G, rồi trừ 1G trọng lực → lấy phần dynamic
      const ax = (mpu.accel?.x ?? mpu.accel_x ?? 0) / G;
      const ay = (mpu.accel?.y ?? mpu.accel_y ?? 0) / G;
      const az = (mpu.accel?.z ?? mpu.accel_z ?? 0) / G;
      const totalG = Math.sqrt(ax * ax + ay * ay + az * az);
      const dynamicG = Math.abs(totalG - 1.0); // loại bỏ 1G trọng lực
      return dynamicG > getSensitivityGForce() - 1.0;
    },
    message: (data) => {
      const mpu = data.mpu6050;
      const ax = (mpu?.accel?.x ?? mpu?.accel_x ?? 0) / G;
      const ay = (mpu?.accel?.y ?? mpu?.accel_y ?? 0) / G;
      const az = (mpu?.accel?.z ?? mpu?.accel_z ?? 0) / G;
      const totalG = Math.sqrt(ax * ax + ay * ay + az * az);
      return `Phát hiện va chạm mạnh với gia tốc ${totalG.toFixed(2)}G! Có thể xảy ra tai nạn.`;
    },
    cooldown: 30,
  },

  // 3. Tốc độ quá cao
  {
    type: "Cảnh báo tốc độ",
    severity: "warning",
    condition: (data) => (data.gps?.speed || 0) >= 80,
    message: (data) =>
      `Tốc độ hiện tại ${data.gps?.speed?.toFixed(0)} km/h vượt quá giới hạn an toàn (80 km/h)!`,
    cooldown: 120,
  },

  // 6. Nhiệt độ quá cao
  {
    type: "Nhiệt độ cao",
    severity: "warning",
    condition: (data) => (data.temperature || 0) > 60,
    message: (data) =>
      `Nhiệt độ thiết bị ${data.temperature}°C quá cao! Có thể ảnh hưởng hoạt động.`,
    cooldown: 300,
  },

  // 7. Mất tín hiệu GPS
  {
    type: "Mất GPS",
    severity: "info",
    condition: (data) => !data.gps?.latitude || !data.gps?.longitude,
    message: () =>
      "Thiết bị đang mất tín hiệu GPS. Không thể xác định vị trí chính xác.",
    cooldown: 180,
  },

  // 8. Dừng bất thường (Tốc độ = 0 lâu)
  {
    type: "Dừng bất thường",
    severity: "info",
    condition: (data) => {
      const speed = data.gps?.speed || 0;
      const timeDiff = Date.now() - (data.timestamp || Date.now());
      return speed === 0 && timeDiff > 600000; // Dừng > 10 phút
    },
    message: () => "Thiết bị đã dừng lại hơn 10 phút. Kiểm tra tình trạng.",
    cooldown: 600,
  },
];

// Store last alert times to implement cooldown
const lastAlertTimes = new Map<string, number>();

/**
 * Kiểm tra và tạo alerts cho một device
 */
export async function processDeviceAlerts(
  deviceId: string,
  deviceData: DeviceData,
): Promise<void> {
  try {
    for (const rule of ALERT_RULES) {
      // Check cooldown
      const cooldownKey = `${deviceId}_${rule.type}`;
      const lastTime = lastAlertTimes.get(cooldownKey) || 0;
      const now = Date.now();

      if (rule.cooldown && now - lastTime < rule.cooldown * 1000) {
        continue; // Still in cooldown period
      }

      // Check condition
      if (rule.condition(deviceData)) {
        // Create alert
        await createAlert({
          deviceId,
          type: rule.type,
          severity: rule.severity,
          message: rule.message(deviceData),
          location: deviceData.gps
            ? {
                lat: deviceData.gps.latitude,
                lng: deviceData.gps.longitude,
              }
            : undefined,
        });

        // Update cooldown
        lastAlertTimes.set(cooldownKey, now);
      }
    }
  } catch (error) {
    console.error("Error processing device alerts:", error);
  }
}

/**
 * Tạo alert mới trong Firebase
 */
async function createAlert(alert: {
  deviceId: string;
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  location?: { lat: number; lng: number };
}): Promise<void> {
  try {
    const sosEmail = localStorage.getItem("settings_sos_email") || undefined;

    // Gọi API của backend để backend đảm nhận việc lưu vào DB và gửi Email
    await sendAlert(
      alert.deviceId,
      alert.type,
      alert.message,
      alert.severity,
      alert.location,
      sosEmail,
    );

    console.log(
      `✅ Alert created via Backend API: ${alert.type} for ${alert.deviceId}`,
    );
  } catch (error) {
    console.error("Error creating alert via API:", error);
  }
}

/**
 * Auto-cleanup old alerts (> 7 days)
 */
export async function cleanupOldAlerts(): Promise<void> {
  try {
    const alertsRef = ref(db, "tracking_system/alerts");
    const snapshot = await get(alertsRef);

    if (!snapshot.exists()) return;

    const alerts = snapshot.val();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const alertId in alerts) {
      const alert = alerts[alertId];
      if (alert.timestamp < sevenDaysAgo) {
        // Delete old alert
        await set(ref(db, `tracking_system/alerts/${alertId}`), null);
        console.log(`🗑️ Deleted old alert: ${alertId}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up alerts:", error);
  }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    await set(ref(db, `tracking_system/alerts/${alertId}/read`), true);
  } catch (error) {
    console.error("Error marking alert as read:", error);
  }
}

/**
 * Get unread alerts count
 */
export async function getUnreadAlertsCount(deviceId?: string): Promise<number> {
  try {
    const alertsRef = ref(db, "tracking_system/alerts");
    const snapshot = await get(alertsRef);

    if (!snapshot.exists()) return 0;

    const alerts = snapshot.val();
    let count = 0;

    for (const alertId in alerts) {
      const alert = alerts[alertId];
      if (!alert.read && (!deviceId || alert.deviceId === deviceId)) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error("Error getting unread alerts count:", error);
    return 0;
  }
}
