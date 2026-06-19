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

/**
 * Subscribe to a device's position updates.
 * @param deviceId The device identifier.
 * @param callback Called with the latest position.
 * @returns Unsubscribe function.
 */
export function subscribeDevicePosition(
  deviceId: string,
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
    off(posRef, "value", listener as any);
  };
}

/**
 * Subscribe to a device's route data from history.
 */
export function subscribeDeviceRoute(
  deviceId: string,
  callback: (route: {
    waypoints: [number, number][];
    distance?: number;
    duration?: number;
  }) => void,
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
        if (dateLogs && typeof dateLogs === "object") {
          for (const tsKey of Object.keys(dateLogs)) {
            const point = dateLogs[tsKey];
            if (!point) continue;
            // Hỗ trợ cả lat/lng (legacy) và latitude/longitude (hardware)
            const lat = point.lat ?? point.latitude;
            const lng = point.lng ?? point.longitude;
            if (typeof lat === "number" && typeof lng === "number") {
              allLogs.push({ timestamp: Number(tsKey), lat, lng });
            }
          }
        }
      }
      allLogs.sort((a, b) => a.timestamp - b.timestamp);
      if (allLogs.length > 0) {
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
        });
      }
    }
  });
  return () => {
    off(historyRef, "value", listener as any);
  };
}

/**
 * Subscribe to alerts list.
 * If deviceId is provided, listens to `/tracking_system/alerts` and filters, or just `/tracking_system/alerts`.
 */
export function subscribeAlerts(
  deviceId: string | null,
  callback: (alerts: any[]) => void,
): () => void {
  const alertsRef = ref(db, "tracking_system/alerts");
  const listener = onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();
    let arr = data ? Object.values(data) : [];
    if (deviceId) {
      arr = arr.filter((item: any) => item.deviceId === deviceId);
    }
    callback(arr);
  });
  return () => {
    off(alertsRef, "value", listener as any);
  };
}

/**
 * Subscribe to a device's basic info (name, status, battery, etc.).
 */
export function subscribeDeviceInfo(
  deviceId: string,
  callback: (info: any) => void,
): () => void {
  const infoRef = ref(db, `tracking_system/devices/${deviceId}`);
  const listener = onValue(infoRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const info = data.info || {};
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
        current_data: data.current_data || null,
      });
    }
  });
  return () => {
    off(infoRef, "value", listener as any);
  };
}

/**
 * Get device basic info (one-time read).
 */
export async function getDeviceInfo(deviceId: string): Promise<any> {
  const infoRef = ref(db, `tracking_system/devices/${deviceId}`);
  const snapshot = await get(infoRef);
  const data = snapshot.val();
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
    current_data: data.current_data || null,
  };
}

/**
 * Get current position of a device (one-time read).
 */
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
    if (dateLogs && typeof dateLogs === "object") {
      for (const tsKey of Object.keys(dateLogs)) {
        const point = dateLogs[tsKey];
        if (!point) continue;
        const lat = point.lat ?? point.latitude;
        const lng = point.lng ?? point.longitude;
        if (typeof lat === "number" && typeof lng === "number") {
          allLogs.push({ timestamp: Number(tsKey), lat, lng });
        }
      }
    }
  }
  allLogs.sort((a, b) => a.timestamp - b.timestamp);
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
