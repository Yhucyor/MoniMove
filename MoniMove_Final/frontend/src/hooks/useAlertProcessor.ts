/**
 * Hook to automatically process device data and generate alerts
 */

import { useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../core/config/firebase';
import { processDeviceAlerts, cleanupOldAlerts } from '../services/alertProcessor';

/**
 * Hook tự động xử lý dữ liệu và tạo alerts
 */
export function useAlertProcessor(deviceId: string) {
  const lastProcessedRef = useRef<number>(0);

  useEffect(() => {
    if (!deviceId) return;

    console.log(`🔍 Alert processor started for device: ${deviceId}`);

    // Subscribe to device current_data
    const deviceRef = ref(db, `tracking_system/devices/${deviceId}/current_data`);

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const now = Date.now();

      // Process only if data changed (debounce 5 seconds)
      if (now - lastProcessedRef.current < 5000) {
        return;
      }

      lastProcessedRef.current = now;

      // Process alerts
      processDeviceAlerts(deviceId, {
        gps: data.gps,
        mpu6050: data.mpu6050,
        battery: data.battery,
        temperature: data.temperature,
        humidity: data.humidity,
        timestamp: data.timestamp || now,
      }).catch(error => {
        console.error('Error in alert processor:', error);
      });
    });

    // Cleanup old alerts every hour
    const cleanupInterval = setInterval(() => {
      cleanupOldAlerts().catch(error => {
        console.error('Error in cleanup:', error);
      });
    }, 60 * 60 * 1000); // 1 hour

    // Initial cleanup
    cleanupOldAlerts();

    return () => {
      off(deviceRef);
      clearInterval(cleanupInterval);
      console.log(`🛑 Alert processor stopped for device: ${deviceId}`);
    };
  }, [deviceId]);
}
