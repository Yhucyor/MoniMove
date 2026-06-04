import { db } from '../core/config/firebase';
import { ref, onValue, off, get } from 'firebase/database';

/**
 * Subscribe to a device's position updates.
 * @param deviceId The device identifier.
 * @param callback Called with the latest position.
 * @returns Unsubscribe function.
 */
export function subscribeDevicePosition(
  deviceId: string,
  callback: (pos: { lat: number; lng: number; speed?: number; heading?: number }) => void
): () => void {
  const posRef = ref(db, `tracking_system/devices/${deviceId}/current_data/gps`);
  const listener = onValue(posRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({
        lat: data.latitude || 0,
        lng: data.longitude || 0,
        speed: data.speed,
        heading: data.heading,
      });
    }
  });
  // Return unsubscribe function
  return () => {
    off(posRef, 'value', listener as any);
  };
}

/**
 * Subscribe to a device's route data from history.
 */
export function subscribeDeviceRoute(
  deviceId: string,
  callback: (route: { waypoints: [number, number][]; distance?: number; duration?: number }) => void
): () => void {
  const historyRef = ref(db, `tracking_system/devices/${deviceId}/history`);
  const listener = onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const waypoints: [number, number][] = [];
      const dates = Object.keys(data);
      const allLogs: { timestamp: number; lat: number; lng: number }[] = [];
      
      for (const date of dates) {
        const dateLogs = data[date];
        if (dateLogs && typeof dateLogs === 'object') {
          for (const tsKey of Object.keys(dateLogs)) {
            const point = dateLogs[tsKey];
            if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
              allLogs.push({
                timestamp: Number(tsKey),
                lat: point.lat,
                lng: point.lng,
              });
            }
          }
        }
      }
      allLogs.sort((a, b) => a.timestamp - b.timestamp);
      if (allLogs.length > 0) {
        callback({
          waypoints: allLogs.map(l => [l.lat, l.lng] as [number, number]),
          distance: 6500,
          duration: 600,
        });
      }
    }
  });
  return () => {
    off(historyRef, 'value', listener as any);
  };
}

/**
 * Subscribe to alerts list.
 * If deviceId is provided, listens to `/tracking_system/alerts` and filters, or just `/tracking_system/alerts`.
 */
export function subscribeAlerts(
  deviceId: string | null,
  callback: (alerts: any[]) => void
): () => void {
  const alertsRef = ref(db, 'tracking_system/alerts');
  const listener = onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    let arr = data ? Object.values(data) : [];
    if (deviceId) {
      arr = arr.filter((item: any) => item.deviceId === deviceId);
    }
    callback(arr);
  });
  return () => {
    off(alertsRef, 'value', listener as any);
  };
}

/**
 * Subscribe to a device's basic info (name, status, battery, etc.).
 */
export function subscribeDeviceInfo(
  deviceId: string,
  callback: (info: any) => void
): () => void {
  const infoRef = ref(db, `tracking_system/devices/${deviceId}`);
  const listener = onValue(infoRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const info = data.info || {};
      callback({
        id: deviceId,
        name: info.device_name || info.license_plate || deviceId,
        status: info.status || 'active',
        battery: data.current_data?.battery || 85,
        lastUpdate: info.last_ping ? info.last_ping * 1000 : Date.now(),
        current_data: data.current_data || null,
      });
    }
  });
  return () => {
    off(infoRef, 'value', listener as any);
  };
}

/**
 * Get device basic info (one-time read).
 */
export async function getDeviceInfo(deviceId: string): Promise<any> {
  const infoRef = ref(db, `tracking_system/devices/${deviceId}`);
  const snapshot = await get(infoRef);
  const data = snapshot.val();
  if (!data) throw new Error('No device info found');
  const info = data.info || {};
  return {
    id: deviceId,
    name: info.device_name || info.license_plate || deviceId,
    status: info.status || 'active',
    battery: data.current_data?.battery || 85,
    lastUpdate: info.last_ping ? info.last_ping * 1000 : Date.now(),
    current_data: data.current_data || null,
  };
}

/**
 * Get current position of a device (one-time read).
 */
export async function getCurrentPosition(deviceId: string): Promise<{ lat: number; lng: number; speed?: number; heading?: number } | null> {
  const posRef = ref(db, `tracking_system/devices/${deviceId}/current_data/gps`);
  const snapshot = await get(posRef);
  const data = snapshot.val();
  if (!data) return null;
  return {
    lat: data.latitude || 0,
    lng: data.longitude || 0,
    speed: data.speed,
    heading: data.heading,
  };
}

/**
 * Get device route (one-time read).
 */
export async function getDeviceRoute(deviceId: string): Promise<any> {
  const historyRef = ref(db, `tracking_system/devices/${deviceId}/history`);
  const snapshot = await get(historyRef);
  const data = snapshot.val();
  if (!data) return { waypoints: [] };
  
  const waypoints: [number, number][] = [];
  const dates = Object.keys(data);
  const allLogs: { timestamp: number; lat: number; lng: number }[] = [];
  
  for (const date of dates) {
    const dateLogs = data[date];
    if (dateLogs && typeof dateLogs === 'object') {
      for (const tsKey of Object.keys(dateLogs)) {
        const point = dateLogs[tsKey];
        if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
          allLogs.push({
            timestamp: Number(tsKey),
            lat: point.lat,
            lng: point.lng,
          });
        }
      }
    }
  }
  allLogs.sort((a, b) => a.timestamp - b.timestamp);
  return {
    waypoints: allLogs.map(l => [l.lat, l.lng] as [number, number]),
    distance: 6500,
    duration: 600,
  };
}
