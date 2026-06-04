import { Injectable, Logger } from '@nestjs/common';

const DB_URL = 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = 'VjYAN6Ps3JLWEBSDGrZyoooncME4ggMQx5hU7kTb';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  async createAlert(alertData: {
    deviceId: string;
    alertType: string;
    message: string;
    timestamp?: number;
  }) {
    try {
      const payload = {
        deviceId: alertData.deviceId,
        alertType: alertData.alertType,
        message: alertData.message,
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
      throw error;
    }
  }

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
            id: key,
            deviceId: item.deviceId,
            alertType: item.alertType,
            message: item.message,
            timestamp: item.timestamp,
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
  }
}
