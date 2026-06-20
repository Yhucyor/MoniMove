<<<<<<< HEAD
import { db } from "../core/config/firebase";
import { ref, onValue, off, get, set } from "firebase/database";

/**
 * Chuyển timestamp từ Firebase về milliseconds.
 * Hỗ trợ 2 dạng:
 *   - Số (Unix seconds): 1750000000 → nhân 1000
 *   - String datetime: "2026-06-19 18:00:28" → parse bằng Date
 * Trả về null nếu không parse được.
 */
function parseTimestampMs(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "number" && value > 0) {
    // Unix seconds (10 chữ số) → đổi sang ms
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string" && value.trim()) {
    // "2026-06-19 18:00:28" → replace space bằng T để ISO parse
    const normalized = value.trim().replace(" ", "T");
    const ms = new Date(normalized).getTime();
    return isNaN(ms) ? null : ms;
  }
  return null;
}
=======
import { db } from '../core/config/firebase';
import { ref, onValue, off, get } from 'firebase/database';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a

/**
 * Subscribe to a device's position updates.
 * @param deviceId The device identifier.
 * @param callback Called with the latest position.
 * @returns Unsubscribe function.
 */
export function subscribeDevicePosition(
  deviceId: string,
<<<<<<< HEAD
  callback: (pos: {
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
  }) => void,
): () => void {
  const posRef = ref(
    db,
    `tracking_system/devices/${deviceId}/current_data/gps`,
  );
=======
  callback: (pos: { lat: number; lng: number; speed?: number; heading?: number }) => void
): () => void {
  const posRef = ref(db, `tracking_system/devices/${deviceId}/current_data/gps`);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
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
<<<<<<< HEAD
    off(posRef, "value", listener as any);
=======
    off(posRef, 'value', listener as any);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  };
}

/**
 * Subscribe to a device's route data from history.
 */
export function subscribeDeviceRoute(
  deviceId: string,
<<<<<<< HEAD
  callback: (route: {
    waypoints: [number, number][];
    distance?: number;
    duration?: number;
  }) => void,
=======
  callback: (route: { waypoints: [number, number][]; distance?: number; duration?: number }) => void
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
): () => void {
  const historyRef = ref(db, `tracking_system/devices/${deviceId}/history`);
  const listener = onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const waypoints: [number, number][] = [];
      const dates = Object.keys(data);
      const allLogs: { timestamp: number; lat: number; lng: number }[] = [];
<<<<<<< HEAD

      for (const date of dates) {
        const dateLogs = data[date];
        if (dateLogs && typeof dateLogs === "object") {
          for (const tsKey of Object.keys(dateLogs)) {
            const point = dateLogs[tsKey];
            if (!point) continue;
            // Hỗ trợ cả lat/lng (legacy) và latitude/longitude (hardware)
            const lat = point.lat ?? point.latitude;
            const lng = point.lng ?? point.longitude;
            if (typeof lat === "number" && typeof lng === "number") {
              allLogs.push({ timestamp: Number(tsKey), lat, lng });
=======
      
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
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
            }
          }
        }
      }
      allLogs.sort((a, b) => a.timestamp - b.timestamp);
      if (allLogs.length > 0) {
<<<<<<< HEAD
        // Tính khoảng cách thực (Haversine)
        let distanceM = 0;
        for (let i = 1; i < allLogs.length; i++) {
          const p1 = allLogs[i - 1];
          const p2 = allLogs[i];
          const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
          const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((p1.lat * Math.PI) / 180) *
              Math.cos((p2.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          distanceM += 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        const durationSec =
          allLogs.length > 1
            ? allLogs[allLogs.length - 1].timestamp - allLogs[0].timestamp
            : 0;

        callback({
          waypoints: allLogs.map((l) => [l.lat, l.lng] as [number, number]),
          distance: Math.round(distanceM),
          duration: durationSec,
=======
        callback({
          waypoints: allLogs.map(l => [l.lat, l.lng] as [number, number]),
          distance: 6500,
          duration: 600,
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
        });
      }
    }
  });
  return () => {
<<<<<<< HEAD
    off(historyRef, "value", listener as any);
=======
    off(historyRef, 'value', listener as any);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  };
}

/**
 * Subscribe to alerts list.
 * If deviceId is provided, listens to `/tracking_system/alerts` and filters, or just `/tracking_system/alerts`.
 */
export function subscribeAlerts(
  deviceId: string | null,
<<<<<<< HEAD
  callback: (alerts: any[]) => void,
): () => void {
  const alertsRef = ref(db, "tracking_system/alerts");
=======
  callback: (alerts: any[]) => void
): () => void {
  const alertsRef = ref(db, 'tracking_system/alerts');
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  const listener = onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    let arr = data ? Object.values(data) : [];
    if (deviceId) {
      arr = arr.filter((item: any) => item.deviceId === deviceId);
    }
    callback(arr);
  });
  return () => {
<<<<<<< HEAD
    off(alertsRef, "value", listener as any);
=======
    off(alertsRef, 'value', listener as any);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  };
}

/**
 * Subscribe to a device's basic info (name, status, battery, etc.).
 */
export function subscribeDeviceInfo(
  deviceId: string,
<<<<<<< HEAD
  callback: (info: any) => void,
=======
  callback: (info: any) => void
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
): () => void {
  const infoRef = ref(db, `tracking_system/devices/${deviceId}`);
  const listener = onValue(infoRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const info = data.info || {};
<<<<<<< HEAD
      const gps = data.current_data?.gps || {};

      // lastUpdate: uu tien gps.updated_at (realtime nhat), sau do last_ping
      // KHONG dung Date.now() fallback vi se lam thiet bi offline thanh online
      const gpsUpdatedAtMs = parseTimestampMs(gps.updated_at);
      const lastPingMs = parseTimestampMs(info.last_ping);
      const lastUpdate = gpsUpdatedAtMs || lastPingMs || null;

      // Tinh connectionStatus ngay tai nguon:
      // Truc tuyen neu lastUpdate trong vong 30 giay
      let connectionStatus: "online" | "offline" | "unknown" = "unknown";
      if (lastUpdate) {
        // Fix: Use Math.abs to prevent negative age (future timestamp) from evaluating to true
        connectionStatus =
          Math.abs(Date.now() - lastUpdate) <= 30_000 ? "online" : "offline";
      } else {
        // Khong co lastUpdate nao => phu thuoc vao rawStatus
        const rawStatus = info.status || "";
        if (rawStatus === "online" || rawStatus === "active")
          connectionStatus = "online";
        else if (rawStatus === "offline" || rawStatus === "inactive")
          connectionStatus = "offline";
      }

      callback({
        id: deviceId,
        name: info.device_name || info.license_plate || deviceId,
        licensePlate: info.license_plate || null,
        status: info.status || "active",
        connectionStatus,
        battery: data.current_data?.battery ?? null,
        lastUpdate,
=======
      callback({
        id: deviceId,
        name: info.device_name || info.license_plate || deviceId,
        status: info.status || 'active',
        battery: data.current_data?.battery || 85,
        lastUpdate: info.last_ping ? info.last_ping * 1000 : Date.now(),
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
        current_data: data.current_data || null,
      });
    }
  });
  return () => {
<<<<<<< HEAD
    off(infoRef, "value", listener as any);
=======
    off(infoRef, 'value', listener as any);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  };
}

/**
 * Get device basic info (one-time read).
 */
export async function getDeviceInfo(deviceId: string): Promise<any> {
  const infoRef = ref(db, `tracking_system/devices/${deviceId}`);
  const snapshot = await get(infoRef);
  const data = snapshot.val();
<<<<<<< HEAD
  if (!data) throw new Error("No device info found");
  const info = data.info || {};
  const gps = data.current_data?.gps || {};

  // lastUpdate: uu tien gps.updated_at, sau do last_ping
  // KHONG dung Date.now() fallback
  const gpsUpdatedAtMs = gps.updated_at ? gps.updated_at * 1000 : null;
  const lastPingMs = info.last_ping ? info.last_ping * 1000 : null;
  const lastUpdate = gpsUpdatedAtMs || lastPingMs || null;

  // Tinh connectionStatus ngay tai nguon
  let connectionStatus: "online" | "offline" | "unknown" = "unknown";
  if (lastUpdate) {
    connectionStatus =
      Math.abs(Date.now() - lastUpdate) <= 30_000 ? "online" : "offline";
  } else {
    const rawStatus = info.status || "";
    if (rawStatus === "online" || rawStatus === "active")
      connectionStatus = "online";
    else if (rawStatus === "offline" || rawStatus === "inactive")
      connectionStatus = "offline";
  }

  return {
    id: deviceId,
    name: info.device_name || info.license_plate || deviceId,
    licensePlate: info.license_plate || null,
    status: info.status || "active",
    connectionStatus,
    battery: data.current_data?.battery ?? null,
    lastUpdate,
=======
  if (!data) throw new Error('No device info found');
  const info = data.info || {};
  return {
    id: deviceId,
    name: info.device_name || info.license_plate || deviceId,
    status: info.status || 'active',
    battery: data.current_data?.battery || 85,
    lastUpdate: info.last_ping ? info.last_ping * 1000 : Date.now(),
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    current_data: data.current_data || null,
  };
}

/**
 * Get current position of a device (one-time read).
 */
<<<<<<< HEAD
export async function getCurrentPosition(
  deviceId: string,
): Promise<{
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
} | null> {
  const posRef = ref(
    db,
    `tracking_system/devices/${deviceId}/current_data/gps`,
  );
=======
export async function getCurrentPosition(deviceId: string): Promise<{ lat: number; lng: number; speed?: number; heading?: number } | null> {
  const posRef = ref(db, `tracking_system/devices/${deviceId}/current_data/gps`);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
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
<<<<<<< HEAD

  const waypoints: [number, number][] = [];
  const dates = Object.keys(data);
  const allLogs: { timestamp: number; lat: number; lng: number }[] = [];

  for (const date of dates) {
    const dateLogs = data[date];
    if (dateLogs && typeof dateLogs === "object") {
      for (const tsKey of Object.keys(dateLogs)) {
        const point = dateLogs[tsKey];
        if (!point) continue;
        const lat = point.lat ?? point.latitude;
        const lng = point.lng ?? point.longitude;
        if (typeof lat === "number" && typeof lng === "number") {
          allLogs.push({ timestamp: Number(tsKey), lat, lng });
=======
  
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
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
        }
      }
    }
  }
  allLogs.sort((a, b) => a.timestamp - b.timestamp);
<<<<<<< HEAD
  let distanceM = 0;
  for (let i = 1; i < allLogs.length; i++) {
    const p1 = allLogs[i - 1],
      p2 = allLogs[i];
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    distanceM += 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const durationSec =
    allLogs.length > 1
      ? allLogs[allLogs.length - 1].timestamp - allLogs[0].timestamp
      : 0;
  return {
    waypoints: allLogs.map((l) => [l.lat, l.lng] as [number, number]),
    distance: Math.round(distanceM),
    duration: durationSec,
  };
}

/**
 * Write device settings to Firebase RTDB
 */
export async function writeDeviceSettings(
  deviceId: string,
  settings: any,
): Promise<void> {
  const settingsRef = ref(db, `tracking_system/settings/${deviceId}`);
  await set(settingsRef, settings);
}
=======
  return {
    waypoints: allLogs.map(l => [l.lat, l.lng] as [number, number]),
    distance: 6500,
    duration: 600,
  };
}
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
