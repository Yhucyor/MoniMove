/**
 * Alert Processor Service
 * Tự động phân tích dữ liệu thiết bị và tạo alerts
 */

import { ref, push, set, get } from 'firebase/database';
import { db } from '../core/config/firebase';

interface DeviceData {
  gps?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  };
  mpu6050?: {
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
  severity: 'critical' | 'warning' | 'info';
  message: (data: DeviceData) => string;
  cooldown?: number; // seconds
}

// Alert rules configuration
const ALERT_RULES: AlertRule[] = [
  // 1. Ngã đổ (Tilt detection)
  {
    type: 'Ngã đổ',
    severity: 'critical',
    condition: (data) => {
      const angleX = Math.abs(data.mpu6050?.angle_x || 0);
      const angleY = Math.abs(data.mpu6050?.angle_y || 0);
      return angleX > 45 || angleY > 45; // Nghiêng quá 45 độ
    },
    message: (data) => {
      const angleX = Math.abs(data.mpu6050?.angle_x || 0);
      const angleY = Math.abs(data.mpu6050?.angle_y || 0);
      const maxAngle = Math.max(angleX, angleY);
      return `Cảnh báo nghiêm trọng: Thiết bị bị ngã với góc nghiêng ${maxAngle.toFixed(1)}°! Cần hỗ trợ khẩn cấp.`;
    },
    cooldown: 60, // Không spam alerts liên tục
  },

  // 2. Va chạm mạnh (Strong acceleration)
  {
    type: 'Va chạm',
    severity: 'critical',
    condition: (data) => {
      const accelX = Math.abs(data.mpu6050?.accel_x || 0);
      const accelY = Math.abs(data.mpu6050?.accel_y || 0);
      const accelZ = Math.abs(data.mpu6050?.accel_z || 0);
      const totalAccel = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);
      return totalAccel > 2.5; // G-force > 2.5G
    },
    message: (data) => {
      const accelX = Math.abs(data.mpu6050?.accel_x || 0);
      const accelY = Math.abs(data.mpu6050?.accel_y || 0);
      const accelZ = Math.abs(data.mpu6050?.accel_z || 0);
      const totalAccel = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);
      return `Phát hiện va chạm mạnh với gia tốc ${totalAccel.toFixed(2)}G! Có thể xảy ra tai nạn.`;
    },
    cooldown: 30,
  },

  // 3. Tốc độ quá cao
  {
    type: 'Cảnh báo tốc độ',
    severity: 'warning',
    condition: (data) => (data.gps?.speed || 0) > 80,
    message: (data) => 
      `Tốc độ hiện tại ${data.gps?.speed?.toFixed(0)} km/h vượt quá giới hạn an toàn (80 km/h)!`,
    cooldown: 120,
  },

  // 4. Pin yếu
  {
    type: 'Pin yếu',
    severity: 'warning',
    condition: (data) => (data.battery || 100) < 20,
    message: (data) => 
      `Pin thiết bị còn ${data.battery}%. Cần sạc pin để tránh mất kết nối.`,
    cooldown: 300, // 5 phút
  },

  // 5. Pin sắp hết
  {
    type: 'Pin cực thấp',
    severity: 'critical',
    condition: (data) => (data.battery || 100) < 10,
    message: (data) => 
      `Pin thiết bị chỉ còn ${data.battery}%! Sắp mất kết nối.`,
    cooldown: 180,
  },

  // 6. Nhiệt độ quá cao
  {
    type: 'Nhiệt độ cao',
    severity: 'warning',
    condition: (data) => (data.temperature || 0) > 60,
    message: (data) => 
      `Nhiệt độ thiết bị ${data.temperature}°C quá cao! Có thể ảnh hưởng hoạt động.`,
    cooldown: 300,
  },

  // 7. Mất tín hiệu GPS
  {
    type: 'Mất GPS',
    severity: 'info',
    condition: (data) => !data.gps?.latitude || !data.gps?.longitude,
    message: () => 
      'Thiết bị đang mất tín hiệu GPS. Không thể xác định vị trí chính xác.',
    cooldown: 180,
  },

  // 8. Dừng bất thường (Tốc độ = 0 lâu)
  {
    type: 'Dừng bất thường',
    severity: 'info',
    condition: (data) => {
      const speed = data.gps?.speed || 0;
      const timeDiff = Date.now() - (data.timestamp || Date.now());
      return speed === 0 && timeDiff > 600000; // Dừng > 10 phút
    },
    message: () => 
      'Thiết bị đã dừng lại hơn 10 phút. Kiểm tra tình trạng.',
    cooldown: 600,
  },
];

// Store last alert times to implement cooldown
const lastAlertTimes = new Map<string, number>();

/**
 * Kiểm tra và tạo alerts cho một device
 */
export async function processDeviceAlerts(deviceId: string, deviceData: DeviceData): Promise<void> {
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
          location: deviceData.gps ? {
            lat: deviceData.gps.latitude,
            lng: deviceData.gps.longitude,
          } : undefined,
        });

        // Update cooldown
        lastAlertTimes.set(cooldownKey, now);
      }
    }
  } catch (error) {
    console.error('Error processing device alerts:', error);
  }
}

/**
 * Tạo alert mới trong Firebase
 */
async function createAlert(alert: {
  deviceId: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  location?: { lat: number; lng: number };
}): Promise<void> {
  try {
    const alertsRef = ref(db, 'tracking_system/alerts');
    const newAlertRef = push(alertsRef);
    
    await set(newAlertRef, {
      id: newAlertRef.key,
      deviceId: alert.deviceId,
      type: alert.type,
      alertType: alert.type,
      message: alert.message,
      severity: alert.severity,
      timestamp: Date.now(),
      location: alert.location,
      read: false,
    });

    console.log(`✅ Alert created: ${alert.type} for ${alert.deviceId}`);
  } catch (error) {
    console.error('Error creating alert:', error);
  }
}

/**
 * Auto-cleanup old alerts (> 7 days)
 */
export async function cleanupOldAlerts(): Promise<void> {
  try {
    const alertsRef = ref(db, 'tracking_system/alerts');
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
    console.error('Error cleaning up alerts:', error);
  }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    await set(ref(db, `tracking_system/alerts/${alertId}/read`), true);
  } catch (error) {
    console.error('Error marking alert as read:', error);
  }
}

/**
 * Get unread alerts count
 */
export async function getUnreadAlertsCount(deviceId?: string): Promise<number> {
  try {
    const alertsRef = ref(db, 'tracking_system/alerts');
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
    console.error('Error getting unread alerts count:', error);
    return 0;
  }
}
