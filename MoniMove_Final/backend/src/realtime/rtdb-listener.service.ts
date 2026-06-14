import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

const DB_URL =
  process.env.FIREBASE_RTDB_URL ||
  'https://monitoring-d6063-default-rtdb.firebaseio.com';
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || '';

/**
 * RtdbListenerService — từ MoniMove_v2
 *
 * Polls Firebase RTDB every 3 seconds và pushes diffs via WebSocket.
 * Sử dụng change-detection bằng JSON hash để chỉ emit khi có thay đổi thực sự.
 *
 * Sử dụng env vars thống nhất: FIREBASE_RTDB_URL, FIREBASE_RTDB_SECRET
 */
@Injectable()
export class RtdbListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RtdbListenerService.name);
  private pollInterval: NodeJS.Timeout | null = null;
  private lastDeviceSnapshots = new Map<string, string>(); // deviceId → JSON hash
  private lastAlertCount = 0;
  private knownAlertIds = new Set<string>();

  constructor(private readonly gateway: RealtimeGateway) {}

  onModuleInit() {
    // Start polling after 3s (let gateway initialize)
    setTimeout(() => this.startPolling(), 3000);
  }

  onModuleDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  private startPolling() {
    this.logger.log('🔄 RTDB Listener started — polling every 3s');
    this.pollInterval = setInterval(() => this.poll(), 3000);
    this.poll(); // immediate first run
  }

  private async poll() {
    await Promise.all([this.pollDevices(), this.pollAlerts()]);
  }

  // ── Poll device current_data ───────────────────────────────────────────────
  private async pollDevices() {
    try {
      const res = await fetch(
        `${DB_URL}/tracking_system/devices.json?auth=${DB_SECRET}&shallow=false`,
      );
      if (!res.ok) return;
      const devices: Record<string, any> = await res.json();
      if (!devices) return;

      for (const [deviceId, deviceData] of Object.entries(devices)) {
        const current = deviceData?.current_data;
        const info = deviceData?.info || {};
        if (!current) continue;

        const hash = JSON.stringify({ gps: current.gps, mpu: current.mpu6050, bat: current.battery });
        const prev = this.lastDeviceSnapshots.get(deviceId);

        if (hash !== prev) {
          this.lastDeviceSnapshots.set(deviceId, hash);

          const gps = current.gps || {};
          const mpu = current.mpu6050 || {};

          // Determine connection status
          const lastPing = info.last_ping as number | undefined;
          const nowSec = Math.floor(Date.now() / 1000);
          // 24h threshold — phù hợp khi test với data không update liên tục
          const isOnline = lastPing ? nowSec - lastPing < 86400 : info.status === 'online';

          this.gateway.pushDeviceUpdate({
            deviceId,
            lat: gps.latitude,
            lng: gps.longitude,
            speed: gps.speed,
            battery: current.battery,
            status: isOnline ? 'online' : 'offline',
            isTilted: mpu.is_tilted ?? false,
            timestamp: gps.updated_at ? gps.updated_at * 1000 : Date.now(),
          });
        }
      }
    } catch (err: any) {
      this.logger.warn('Device poll error: ' + err.message);
    }
  }

  // ── Poll alerts — emit new ones via WebSocket ─────────────────────────────
  private async pollAlerts() {
    try {
      const res = await fetch(
        `${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`,
      );
      if (!res.ok) return;
      const data: Record<string, any> = await res.json();
      if (!data) return;

      for (const [alertId, alert] of Object.entries(data)) {
        if (this.knownAlertIds.has(alertId)) continue;

        // New alert detected
        this.knownAlertIds.add(alertId);

        // Don't emit on first run (we'd spam all existing alerts)
        if (this.lastAlertCount === 0) continue;

        this.gateway.pushAlert({
          id: alertId,
          deviceId: alert.deviceId || '',
          alertType: alert.alertType || alert.type || 'unknown',
          severity: alert.severity || 'warning',
          message: alert.message || '',
          timestamp: alert.timestamp || Date.now(),
          location: alert.location,
        });

        this.logger.log(`🚨 New alert pushed via WS: ${alert.alertType} for ${alert.deviceId}`);
      }

      this.lastAlertCount = Object.keys(data).length;
    } catch (err: any) {
      this.logger.warn('Alert poll error: ' + err.message);
    }
  }
}
