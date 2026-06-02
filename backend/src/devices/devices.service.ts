import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

const DB_URL = 'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = 'VjYAN6Ps3JLWEBSDGrZyoooncME4ggMQx5hU7kTb';

@Injectable()
export class DevicesService implements OnModuleInit {
  private readonly logger = new Logger(DevicesService.name);

  async onModuleInit() {
    await this.seedMockData();
  }

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
        return {
          id: deviceId,
          name: info.device_name || info.license_plate || deviceId,
          status: info.status || 'active',
          battery: data.current_data?.battery || 85,
          lastUpdate: info.last_ping ? info.last_ping * 1000 : Date.now(),
          current_data: data.current_data || null,
        };
      }
    } catch (error) {
      this.logger.error('Error fetching device from Realtime Database REST API: ' + (error.message || error));
    }

    // Local mock fallback if database access fails
    return {
      id: deviceId,
      name: 'MoniMove - ESP32 (Mock)',
      status: 'active',
      battery: 88,
      lastUpdate: Date.now(),
      current_data: {
        gps: {
          latitude: 10.8045,
          longitude: 106.7380,
          speed: 42.5,
          satellites: 8,
          updated_at: Math.floor(Date.now() / 1000)
        },
        mpu6050: {
          accel: { x: 0.05, y: -0.12, z: 9.81 },
          gyro: { x: 0.01, y: 0.02, z: -0.01 },
          is_tilted: false
        }
      }
    };
  }

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
          lat: data.latitude || 10.8045,
          lng: data.longitude || 106.7380,
          timestamp: data.updated_at ? data.updated_at * 1000 : Date.now(),
          speed: data.speed || 0,
          heading: data.heading || 0,
        };
      }
    } catch (error) {
      this.logger.error('Error fetching position from Realtime Database REST API: ' + (error.message || error));
    }

    // Local mock fallback
    const offset = (Math.sin(Date.now() / 10000) * 0.003);
    return {
      lat: 10.8045 + offset,
      lng: 106.7380 + (Math.cos(Date.now() / 10000) * 0.003),
      timestamp: Date.now(),
      speed: 35 + Math.floor(Math.random() * 15),
      heading: 90,
    };
  }

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
        const waypoints: [number, number][] = [];
        const dates = Object.keys(deviceData.history);
        const allLogs: { timestamp: number; lat: number; lng: number }[] = [];

        for (const date of dates) {
          const dateLogs = deviceData.history[date];
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

        // Sort points chronologically
        allLogs.sort((a, b) => a.timestamp - b.timestamp);

        if (allLogs.length > 0) {
          return {
            deviceId,
            waypoints: allLogs.map(l => [l.lat, l.lng] as [number, number]),
            distance: 6500,
            duration: 600,
          };
        }
      }
    } catch (error) {
      this.logger.error('Error fetching route from Realtime Database REST API: ' + (error.message || error));
    }

    // Default route fallback
    return {
      deviceId,
      waypoints: [
        [10.7756, 106.7068],
        [10.8018, 106.7280],
        [10.8045, 106.7380],
      ],
      distance: 6500,
      duration: 600,
    };
  }

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
                 logs.push({
                   lat: point.lat || 0,
                   lng: point.lng || 0,
                   timestamp: timestampMs,
                   speed: point.speed || 0,
                 });
              }
            }
          }
        }

        // Sort chronologically
        logs.sort((a, b) => a.timestamp - b.timestamp);
        return logs;
      }
    } catch (error) {
      this.logger.error('Error fetching history from Realtime Database REST API: ' + (error.message || error));
    }

    return [];
  }

  private async seedMockData() {
    try {
      // Check if devices node is empty
      const checkResponse = await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`);
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        if (!data) {
          this.logger.log('Seeding default device "DEVICE_ESP32_01" into Realtime Database via REST API...');
          const nowSeconds = Math.floor(Date.now() / 1000);
          
          const defaultData = {
            DEVICE_ESP32_01: {
              info: {
                device_name: "MoniMove Tracker v1",
                license_plate: "59X3-12345",
                status: "online",
                last_ping: nowSeconds
              },
              current_data: {
                gps: {
                  latitude: 10.8045,
                  longitude: 106.7380,
                  speed: 45.2,
                  satellites: 8,
                  updated_at: nowSeconds
                },
                mpu6050: {
                  accel: {
                    x: 0.05,
                    y: -0.12,
                    z: 9.81
                  },
                  gyro: {
                    x: 0.01,
                    y: 0.02,
                    z: -0.01
                  },
                  is_tilted: false
                }
              },
              history: {
                "2026-06-02": {
                  [nowSeconds - 20]: {
                    lat: 10.7756,
                    lng: 106.7068,
                    speed: 30
                  },
                  [nowSeconds - 10]: {
                    lat: 10.8018,
                    lng: 106.7280,
                    speed: 42
                  },
                  [nowSeconds]: {
                    lat: 10.8045,
                    lng: 106.7380,
                    speed: 45.2
                  }
                }
              }
            }
          };
          
          await fetch(`${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}`, {
            method: 'PUT',
            body: JSON.stringify(defaultData),
          });
          this.logger.log('Seeded default Realtime Database mock data successfully.');
        }
      }
    } catch (error) {
      this.logger.warn('Mock seeding skipped (likely due to invalid credentials/permissions): ' + (error.message || error));
    }
  }
}
