import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { computeConnectionStatus } from '../common/utils/device-status.util';

/**
 * DevicesService — Merged từ MoniMove_v2 + MoniMove (v3)
 *
 * Env vars (unified):
 *   FIREBASE_RTDB_URL    — URL Firebase Realtime Database
 *   FIREBASE_RTDB_SECRET — Legacy secret để REST API
 *
 * v2 thêm: listAllDevices (GET /devices), connectionStatus, licensePlate, Haversine distance trong getRoute
 * v3: cơ bản — getDevice, getLatestPosition, getRoute, getHistory
 *
 * Merged: giữ tất cả chức năng v2 (đầy đủ nhất)
 */

const DB_URL = process.env.FIREBASE_RTDB_URL || 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';

@Injectable()
export class DevicesService implements OnModuleInit {
  private readonly logger = new Logger(DevicesService.name);

  async onModuleInit() {
    await this.seedMockData();
  }

  // ── List All Devices ───────────────────────────────────────────────────────
  async listAllDevices(): Promise<{ id: string; name: string; status: string; connectionStatus: string; lastPing: number | null }[]> {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const devicesVal = await response.json();

      if (!devicesVal) return [];

      return Object.keys(devicesVal).map((id) => {
        const info = devicesVal[id]?.info || {};
        const gps = devicesVal[id]?.current_data?.gps || {};
        const lastPing = info.last_ping as number | undefined;
        const gpsUpdatedAt = gps.updated_at as number | undefined;
        const rawStatus = info.status || 'active';
        return {
          id,
          name: info.device_name || info.license_plate || id,
          status: rawStatus,
          connectionStatus: computeConnectionStatus(lastPing, undefined, rawStatus, gpsUpdatedAt),
          lastPing: lastPing ? lastPing * 1000 : null,
        };
      });
    } catch (error) {
      this.logger.error('Error listing devices: ' + (error instanceof Error ? error.message : String(error)));
      return [];
    }
  }

  // ── Get Single Device ──────────────────────────────────────────────────────
  async getDevice(deviceId: string) {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      let data = await response.json();

      // Fallback: if deviceId does not exist, get the first device
      if (!data) {
        this.logger.warn(`Device "${deviceId}" not found in database, fetching fallback device...`);
        const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
        if (allResponse.ok) {
          const devicesVal = await allResponse.json();
          if (devicesVal) {
            const keys = Object.keys(devicesVal);
            if (keys.length > 0) {
              deviceId = keys[0];
              data = devicesVal[deviceId];
              this.logger.log(`Fallback mapped successfully to device ID: "${deviceId}"`);
            }
          }
        }
      }

      if (data) {
        const info = data.info || {};
        const gps = data.current_data?.gps || {};
        const lastPing = info.last_ping as number | undefined;
        const gpsUpdatedAt = gps.updated_at as number | undefined;
        const rawStatus = info.status || 'active';
        // lastUpdate: ưu tiên gps.updated_at, fallback last_ping, fallback now
        const lastUpdate = gpsUpdatedAt ? gpsUpdatedAt * 1000 : (lastPing ? lastPing * 1000 : Date.now());
        const battery = data.current_data?.battery ?? gps?.battery ?? null;
        return {
          id: deviceId,
          name: info.device_name || deviceId,
          licensePlate: info.license_plate || null,
          status: rawStatus,
          connectionStatus: computeConnectionStatus(lastPing, undefined, rawStatus, gpsUpdatedAt),
          battery,
          lastUpdate,
          lastPing: lastUpdate,
          current_data: data.current_data || null,
        };
      }
    } catch (error) {
      this.logger.error('Error fetching device from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
    }
    return null;
  }

  // ── Latest Position ────────────────────────────────────────────────────────
  async getLatestPosition(deviceId: string) {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}/current_data/gps.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      let data = await response.json();

      // Fallback: check first device
      if (!data) {
        const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
        if (allResponse.ok) {
          const devicesVal = await allResponse.json();
          if (devicesVal) {
            const keys = Object.keys(devicesVal);
            if (keys.length > 0) {
              const fallbackId = keys[0];
              const gpsResponse = await fetch(`${DB_URL}/tracking_system/devices/${fallbackId}/current_data/gps.json?auth=${DB_SECRET}`);
              if (gpsResponse.ok) {
                data = await gpsResponse.json();
              }
            }
          }
        }
      }

      if (data) {
        return {
          lat: data.latitude ?? 0,
          lng: data.longitude ?? 0,
          timestamp: data.updated_at ? data.updated_at * 1000 : Date.now(),
          speed: data.speed || 0,
          heading: data.heading || 0,
        };
      }
    } catch (error) {
      this.logger.error('Error fetching position from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
    }
    return null;
  }

  // ── Route (Haversine distance calculation) ─────────────────────────────────
  async getRoute(deviceId: string) {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      let deviceData = await response.json();

      // Fallback: check first device
      if (!deviceData) {
        const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
        if (allResponse.ok) {
          const devicesVal = await allResponse.json();
          if (devicesVal) {
            const keys = Object.keys(devicesVal);
            if (keys.length > 0) {
              const fallbackId = keys[0];
              deviceId = fallbackId;
              deviceData = devicesVal[fallbackId];
            }
          }
        }
      }

      if (deviceData && deviceData.history) {
        const dates = Object.keys(deviceData.history);
        const allLogs: { timestamp: number; lat: number; lng: number }[] = [];

        for (const date of dates) {
          const dateLogs = deviceData.history[date];
          if (dateLogs && typeof dateLogs === 'object') {
            for (const tsKey of Object.keys(dateLogs)) {
              const point = dateLogs[tsKey];
              // Hỗ trợ cả lat/lng (legacy) và latitude/longitude (hardware ESP32)
              const lat = point?.lat ?? point?.latitude;
              const lng = point?.lng ?? point?.longitude;
              if (typeof lat === 'number' && typeof lng === 'number') {
                allLogs.push({ timestamp: Number(tsKey), lat, lng });
              }
            }
          }
        }

        allLogs.sort((a, b) => a.timestamp - b.timestamp);

        if (allLogs.length > 0) {
          // Tính khoảng cách thực (Haversine formula)
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
          // Thời gian di chuyển (giây)
          const durationSec =
            allLogs.length > 1
              ? allLogs[allLogs.length - 1].timestamp - allLogs[0].timestamp
              : 0;

          return {
            deviceId,
            waypoints: allLogs.map((l) => [l.lat, l.lng] as [number, number]),
            distance: Math.round(distanceM),
            duration: durationSec,
          };
        }
      }
    } catch (error) {
      this.logger.error('Error fetching route from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
    }

    return { deviceId, waypoints: [], distance: 0, duration: 0 };
  }

  // ── History ────────────────────────────────────────────────────────────────
  async getHistory(deviceId: string, start: number, end: number) {
    try {
      const response = await fetch(`${DB_URL}/tracking_system/devices/${deviceId}/history.json?auth=${DB_SECRET}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      let historyData = await response.json();

      // Fallback: check first device
      if (!historyData) {
        const allResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
        if (allResponse.ok) {
          const devicesVal = await allResponse.json();
          if (devicesVal) {
            const keys = Object.keys(devicesVal);
            if (keys.length > 0) {
              const fallbackId = keys[0];
              historyData = devicesVal[fallbackId].history;
            }
          }
        }
      }

      if (historyData) {
        const startNum = Number(start);
        const endNum = Number(end);
        const logs: { lat: number; lng: number; timestamp: number; speed: number }[] = [];

        const dates = Object.keys(historyData);
        for (const date of dates) {
          const dateLogs = historyData[date];
          if (dateLogs && typeof dateLogs === 'object') {
            for (const tsKey of Object.keys(dateLogs)) {
              const point = dateLogs[tsKey];
              let timestamp = Number(tsKey);

              // Normalize to milliseconds if stored as seconds (10 digits)
              let timestampMs = timestamp;
              if (timestamp.toString().length === 10) {
                timestampMs = timestamp * 1000;
              }

              if (timestampMs >= startNum && timestampMs <= endNum) {
                // Hỗ trợ cả lat/lng (legacy) và latitude/longitude (ESP32)
                const lat = point?.lat ?? point?.latitude ?? 0;
                const lng = point?.lng ?? point?.longitude ?? 0;
                logs.push({ lat, lng, timestamp: timestampMs, speed: point?.speed || 0 });
              }
            }
          }
        }

        logs.sort((a, b) => a.timestamp - b.timestamp);
        return logs;
      }
    } catch (error) {
      this.logger.error('Error fetching history from Realtime Database REST API: ' + (error instanceof Error ? error.message : String(error)));
    }

    return [];
  }

  // ── Seed Mock Data on First Run ────────────────────────────────────────────
  private async seedMockData() {
    // Đã xóa — không seed data giả vào RTDB
  }
}
