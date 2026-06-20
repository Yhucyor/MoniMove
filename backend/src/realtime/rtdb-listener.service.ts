import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { MailService } from "../mail/mail.service";
import { isEmergency } from "../alerts/alerts.service";

const DB_URL =
  process.env.FIREBASE_RTDB_URL ||
  "https://monitoring-d6063-default-rtdb.firebaseio.com";
const DB_SECRET = process.env.FIREBASE_RTDB_SECRET || "";

// ── Trip detection thresholds ────────────────────────────────────────────────
const MOVEMENT_SPEED_KMH = 1; // tốc độ tối thiểu coi là di chuyển
const MIN_DISTANCE_M = 5; // hoặc dịch chuyển ≥ 5m
const SAVE_INTERVAL_MS = 5_000; // lưu điểm liên tục mỗi 5s khi đang đi
const STOP_TIMEOUT_MS = 5 * 60_000; // dừng ≥ 5 phút → kết thúc trip
const MIN_TRIP_POINTS = 2; // số điểm tối thiểu để lưu trip vào lịch sử

/**
 * Haversine distance (metres) giữa 2 toạ độ
 */
function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface DeviceTripState {
  isInTrip: boolean;
  tripId: string | null; // ID của chuyến hiện tại
  tripStartedAt: number; // ms — thời điểm bắt đầu trip
  tripStartLat: number;
  tripStartLng: number;
  tripPoints: { lat: number; lng: number; speed: number; timestamp: number }[];
  tripDistanceM: number; // tổng quãng đường chuyến này
  lastMovedAt: number; // ms — lần cuối phát hiện di chuyển
  lastSavedAt: number; // ms — lần cuối lưu vào history
  lastSavedLat: number;
  lastSavedLng: number;
}

/**
 * RtdbListenerService
 *
 * - Polls Firebase RTDB mỗi 3s → push diff qua WebSocket
 * - Trip detection: khi có chuyển động, lưu GPS vào history
 *   mỗi 60s hoặc khi di chuyển ≥ 30m.
 *   Dừng lại ≥ 5 phút → ngừng lưu cho đến khi có chuyển động tiếp.
 */
@Injectable()
export class RtdbListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RtdbListenerService.name);
  private pollInterval: NodeJS.Timeout | null = null;
  private lastDeviceSnapshots = new Map<string, string>();
  private lastAlertCount = 0;
  private knownAlertIds = new Set<string>();

  // Trip state per device
  private tripStates = new Map<string, DeviceTripState>();

  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    setTimeout(() => this.startPolling(), 3000);
  }

  onModuleDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  private startPolling() {
    this.logger.log(
      "🔄 RTDB Listener started — polling every 3s | Trip detection: ON",
    );
    this.pollInterval = setInterval(() => this.poll(), 3000);
    this.poll();
  }

  private async poll() {
    await Promise.all([this.pollDevices(), this.pollAlerts()]);
  }

  // ── Poll devices ──────────────────────────────────────────────────────────
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

        // ── WebSocket push ───────────────────────────────────────────────
        const hash = JSON.stringify({
          gps: current.gps,
          mpu: current.mpu6050,
          bat: current.battery,
        });
        const prev = this.lastDeviceSnapshots.get(deviceId);
        if (hash !== prev) {
          this.lastDeviceSnapshots.set(deviceId, hash);

          const gps = current.gps || {};
          const mpu = current.mpu6050 || {};
          const lastPing = info.last_ping as number | undefined;
          const gpsUpdatedAt = gps.updated_at as number | undefined;
          const nowSec = Math.floor(Date.now() / 1000);

          // Online nếu: GPS updated trong 5 phút HOẶC last_ping trong 24h
          const gpsAge = gpsUpdatedAt ? nowSec - gpsUpdatedAt : Infinity;
          const pingAge = lastPing ? nowSec - lastPing : Infinity;
          const isOnline = gpsAge < 300 || pingAge < 86400;

          this.gateway.pushDeviceUpdate({
            deviceId,
            lat: gps.latitude,
            lng: gps.longitude,
            speed: gps.speed,
            battery: current.battery,
            status: isOnline ? "online" : "offline",
            isTilted: mpu.is_tilted ?? false,
            timestamp: gps.updated_at ? gps.updated_at * 1000 : Date.now(),
          });
        }

        // ── Trip detection & history save ────────────────────────────────
        const gps = current.gps || {};
        const lat = gps.latitude ?? gps.lat;
        const lng = gps.longitude ?? gps.lng;
        if (typeof lat !== "number" || typeof lng !== "number") continue;
        if (lat === 0 && lng === 0) continue;

        await this.handleTripDetection(deviceId, lat, lng, gps.speed ?? 0);
      }
    } catch (err: any) {
      this.logger.warn("Device poll error: " + err.message);
    }
  }

  // ── Trip detection logic ──────────────────────────────────────────────────
  private async handleTripDetection(
    deviceId: string,
    lat: number,
    lng: number,
    speed: number,
  ) {
    const now = Date.now();

    // Khởi tạo state nếu chưa có
    if (!this.tripStates.has(deviceId)) {
      this.tripStates.set(deviceId, {
        isInTrip: false,
        tripId: null,
        tripStartedAt: 0,
        tripStartLat: lat,
        tripStartLng: lng,
        tripPoints: [],
        tripDistanceM: 0,
        lastMovedAt: 0,
        lastSavedAt: 0,
        lastSavedLat: lat,
        lastSavedLng: lng,
      });
    }

    const state = this.tripStates.get(deviceId)!;

    // ── Kiểm tra có di chuyển không ─────────────────────────────────────────
    const distFromLastSave = haversineM(
      state.lastSavedLat,
      state.lastSavedLng,
      lat,
      lng,
    );
    const isMoving =
      speed >= MOVEMENT_SPEED_KMH || distFromLastSave >= MIN_DISTANCE_M;

    if (isMoving) {
      state.lastMovedAt = now;

      if (!state.isInTrip) {
        // ── Bắt đầu chuyến mới ───────────────────────────────────────────
        state.isInTrip = true;
        state.tripId = `trip_${now}`;
        state.tripStartedAt = now;
        state.tripStartLat = lat;
        state.tripStartLng = lng;
        state.tripPoints = [];
        state.tripDistanceM = 0;
        this.logger.log(
          `🚴 [${deviceId}] Trip started [${state.tripId}] — speed=${speed} km/h dist=${distFromLastSave.toFixed(0)}m`,
        );
      }

      // ── Cộng dồn khoảng cách trong chuyến ───────────────────────────────
      if (state.tripPoints.length > 0) {
        const prev = state.tripPoints[state.tripPoints.length - 1];
        state.tripDistanceM += haversineM(prev.lat, prev.lng, lat, lng);
      }

      // ── Lưu điểm nếu đủ khoảng thời gian HOẶC đủ khoảng cách ────────────
      const timeSinceLastSave = now - state.lastSavedAt;
      const shouldSaveByTime = timeSinceLastSave >= SAVE_INTERVAL_MS;
      const shouldSaveByDist =
        distFromLastSave >= MIN_DISTANCE_M && timeSinceLastSave >= 10_000;

      if (shouldSaveByTime || shouldSaveByDist) {
        await this.saveHistoryPoint(deviceId, state.tripId!, lat, lng, speed, now);
        state.tripPoints.push({ lat, lng, speed, timestamp: now });
        state.lastSavedAt = now;
        state.lastSavedLat = lat;
        state.lastSavedLng = lng;
      }
    } else {
      // ── Kiểm tra đã dừng đủ 5 phút chưa ────────────────────────────────
      if (state.isInTrip) {
        const stoppedDurationMs = now - state.lastMovedAt;
        if (stoppedDurationMs >= STOP_TIMEOUT_MS) {
          // ── Kết thúc chuyến — lưu tóm tắt vào lịch sử ──────────────────
          const tripId = state.tripId!;
          const durationSec = Math.round((state.lastMovedAt - state.tripStartedAt) / 1000);
          if (state.tripPoints.length >= MIN_TRIP_POINTS) {
            await this.saveTripSummary(deviceId, tripId, {
              startedAt: state.tripStartedAt,
              endedAt: state.lastMovedAt,
              durationSec,
              distanceM: Math.round(state.tripDistanceM),
              pointCount: state.tripPoints.length,
              startLat: state.tripStartLat,
              startLng: state.tripStartLng,
              endLat: state.lastSavedLat,
              endLng: state.lastSavedLng,
            });
          }
          state.isInTrip = false;
          state.tripId = null;
          state.tripPoints = [];
          state.tripDistanceM = 0;
          this.logger.log(
            `🛑 [${deviceId}] Trip ended [${tripId}] — ${Math.round(stoppedDurationMs / 60000)}min stop`,
          );
        }
      }
    }
  }

  private async saveHistoryPoint(
    deviceId: string,
    tripId: string,
    lat: number,
    lng: number,
    speed: number,
    nowMs: number,
  ) {
    const now = new Date(nowMs);
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateKey = `${y}-${mo}-${d}`;
    const timestampSec = Math.floor(nowMs / 1000);

    // Lưu điểm vào history/{dateKey}/{tripId}/{timestamp}
    const url = `${DB_URL}/tracking_system/devices/${deviceId}/history/${dateKey}/${tripId}/${timestampSec}.json${DB_SECRET ? `?auth=${DB_SECRET}` : ""}`;

    try {
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          latitude: lat,
          longitude: lng,
          speed,
        }),
      });

      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      this.logger.log(
        `📍 [${deviceId}] Saved ${dateKey} ${hhmm} — (${lat.toFixed(5)}, ${lng.toFixed(5)}) ${speed} km/h`,
      );
    } catch (err: any) {
      this.logger.warn(`History write error [${deviceId}]: ${err.message}`);
    }
  }

  // ── Lưu tóm tắt chuyến đi hoàn thành ─────────────────────────────────────
  private async saveTripSummary(
    deviceId: string,
    tripId: string,
    summary: {
      startedAt: number;
      endedAt: number;
      durationSec: number;
      distanceM: number;
      pointCount: number;
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
    },
  ) {
    const url = `${DB_URL}/tracking_system/devices/${deviceId}/trips/${tripId}.json${DB_SECRET ? `?auth=${DB_SECRET}` : ""}`;
    try {
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summary),
      });
      const km = (summary.distanceM / 1000).toFixed(2);
      const mins = Math.round(summary.durationSec / 60);
      this.logger.log(`📦 [${deviceId}] Trip summary saved [${tripId}]: ${km}km, ${mins}min, ${summary.pointCount} pts`);
    } catch (err: any) {
      this.logger.warn(`Trip summary write error [${deviceId}]: ${err.message}`);
    }
  }

  private isInitialAlertPoll = true;

  private async pollAlerts() {
    try {
      const res = await fetch(
        `${DB_URL}/tracking_system/alerts.json?auth=${DB_SECRET}`,
      );
      if (!res.ok) return;
      const data: Record<string, any> = await res.json();
      
      if (!data) {
        this.isInitialAlertPoll = false;
        return;
      }

      for (const [alertId, alert] of Object.entries(data)) {
        if (this.knownAlertIds.has(alertId)) continue;
        this.knownAlertIds.add(alertId);
        
        // Skip pushing/emailing if this is the first time we poll
        // (to avoid spamming old alerts on server restart)
        if (this.isInitialAlertPoll) continue;

        this.gateway.pushAlert({
          id: alertId,
          deviceId: alert.deviceId || "",
          alertType: alert.alertType || alert.type || "unknown",
          severity: alert.severity || "warning",
          message: alert.message || "",
          timestamp: alert.timestamp || Date.now(),
          location: alert.location,
        });

        this.logger.log(
          `🚨 New alert pushed via WS: ${alert.alertType} for ${alert.deviceId}`,
        );

        // Gửi email khẩn cấp nếu là loại nguy hiểm
        if (alert.alertType && isEmergency(alert.alertType)) {
          this.processEmergencyEmail({
            id: alertId,
            deviceId: alert.deviceId || "Unknown",
            alertType: alert.alertType,
            message: alert.message || "",
            timestamp: alert.timestamp || Date.now(),
            location: alert.location,
          });
        }
      }

      this.isInitialAlertPoll = false;
    } catch (err: any) {
      this.logger.warn("Alert poll error: " + err.message);
    }
  }

  /**
   * Đọc email SOS từ Firebase settings của device
   * Path: tracking_system/settings/{deviceId}/sos_email
   */
  private async getSosEmail(deviceId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${DB_URL}/tracking_system/settings/${deviceId}/sos_email.json?auth=${DB_SECRET}`,
      );
      if (!response.ok) return null;
      const val = await response.json();
      return typeof val === "string" && val.includes("@") ? val : null;
    } catch {
      return null;
    }
  }

  private async processEmergencyEmail(alertData: any) {
    let sosEmail: string | null = null;
    sosEmail = await this.getSosEmail(alertData.deviceId);

    if (!sosEmail) {
      sosEmail = process.env.SMTP_USER || null;
      if (sosEmail) {
        this.logger.warn(
          `⚠️ No SOS email for ${alertData.deviceId} — fallback to system email: ${sosEmail}`,
        );
      }
    }

    if (sosEmail) {
      this.logger.log(
        `📧 RTDB Listener sending emergency email to: ${sosEmail} (type: ${alertData.alertType})`,
      );
      this.mailService.sendEmergencyEmail(sosEmail, alertData).catch((err) => {
        this.logger.error(`Email failed: ${err.message}`);
      });
    }
  }
}
