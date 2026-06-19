"use client";

/**
 * useRealtimeDashboard
 *
 * Single hook cung cấp toàn bộ realtime data cho Dashboard:
 * - Kết nối WebSocket (primary, từ backend push)
 * - Firebase RTDB subscription (fallback, direct)
 * - Motion state classification
 * - Alert history
 * - Connection quality metrics
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  subscribeDevicePosition,
  subscribeDeviceInfo,
} from "../services/firebaseRealtime";
import {
  classifyMotion,
  type MotionClassification,
} from "../services/motionClassifier";
import {
  useWebSocket,
  type WsDeviceUpdate,
  type WsAlertEvent,
} from "./useWebSocket";

export interface LiveDeviceData {
  deviceId: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  status: "online" | "offline" | "unknown";
  isTilted: boolean;
  timestamp: number;
  // Raw sensor for classifier
  accel?: { x: number; y: number; z: number };
  gyro?: { x: number; y: number; z: number };
}

export interface DashboardMetrics {
  updateCount: number; // total data points received
  updatesPerMinute: number; // data rate
  lastAlerts: WsAlertEvent[]; // recent 10 alerts
  connectionQuality: "excellent" | "good" | "poor" | "offline";
}

export function useRealtimeDashboard(deviceId: string | null) {
  const [liveData, setLiveData] = useState<LiveDeviceData | null>(null);
  const [motionState, setMotionState] = useState<MotionClassification | null>(
    null,
  );
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<WsAlertEvent[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    updateCount: 0,
    updatesPerMinute: 0,
    lastAlerts: [],
    connectionQuality: "offline",
  });

  // Sliding window for data rate calculation (last 60s)
  const updateTimestamps = useRef<number[]>([]);

  const handleDeviceUpdate = useCallback(
    (update: WsDeviceUpdate) => {
      if (!deviceId || update.deviceId !== deviceId) return;

      const now = Date.now();
      setLastUpdateAt(now);

      setLiveData((prev) => ({
        deviceId: update.deviceId,
        lat: update.lat ?? prev?.lat ?? 0,
        lng: update.lng ?? prev?.lng ?? 0,
        speed: update.speed ?? prev?.speed ?? 0,
        // Battery: ưu tiên giá trị từ WS nếu có, giữ giá trị cũ nếu không
        battery: update.battery != null ? update.battery : (prev?.battery ?? 0),
        status: (update.status as any) ?? prev?.status ?? "unknown",
        isTilted: update.isTilted ?? prev?.isTilted ?? false,
        timestamp: update.timestamp,
        accel: prev?.accel,
        gyro: prev?.gyro,
      }));

      // Classify motion
      setMotionState(
        classifyMotion({
          gpsSpeed: update.speed,
          is_tilted: update.isTilted,
          timestamp: update.timestamp,
        }),
      );

      // Update data rate
      updateTimestamps.current.push(now);
      updateTimestamps.current = updateTimestamps.current.filter(
        (t) => now - t < 60_000,
      );
      const rate = updateTimestamps.current.length;

      setMetrics((prev) => ({
        ...prev,
        updateCount: prev.updateCount + 1,
        updatesPerMinute: rate,
        connectionQuality:
          rate > 10
            ? "excellent"
            : rate > 4
              ? "good"
              : rate > 1
                ? "poor"
                : "offline",
      }));
    },
    [deviceId],
  );

  const handleAlert = useCallback((alert: WsAlertEvent) => {
    setAlerts((prev) => [alert, ...prev].slice(0, 10));
    setMetrics((prev) => ({
      ...prev,
      lastAlerts: [alert, ...prev.lastAlerts].slice(0, 10),
    }));
  }, []);

  // WebSocket connection
  const ws = useWebSocket({
    deviceIds: deviceId ? [deviceId] : [],
    onDeviceUpdate: handleDeviceUpdate,
    onAlert: handleAlert,
  });

  // Firebase RTDB fallback — enriches liveData with full sensor snapshot
  useEffect(() => {
    if (!deviceId) return;

    const unsubInfo = subscribeDeviceInfo(deviceId, (info: any) => {
      const mpu = info.current_data?.mpu6050;
      const gps = info.current_data?.gps;

      setLiveData((prev) => {
        // Nếu chưa có data, khởi tạo từ Firebase info
        if (!prev && gps) {
          return {
            deviceId,
            lat: gps.latitude ?? gps.lat ?? 0,
            lng: gps.longitude ?? gps.lng ?? 0,
            speed: gps.speed ?? 0,
            battery: info.battery ?? info.current_data?.battery ?? 0,
            status: info.status === "online" ? "online" : "offline",
            isTilted: mpu?.is_tilted ?? false,
            timestamp: gps.updated_at ? gps.updated_at * 1000 : Date.now(),
            accel: mpu?.accel,
            gyro: mpu?.gyro,
          };
        }
        if (!prev) return prev;
        return {
          ...prev,
          battery:
            info.battery != null
              ? info.battery
              : info.current_data?.battery != null
                ? info.current_data.battery
                : prev.battery,
          accel: mpu?.accel ?? prev.accel,
          gyro: mpu?.gyro ?? prev.gyro,
          isTilted: mpu?.is_tilted ?? prev.isTilted,
        };
      });

      setLastUpdateAt(Date.now());

      // Reclassify with full sensor data
      const mpu_data = info.current_data?.mpu6050;
      if (mpu_data) {
        setMotionState(
          classifyMotion({
            accel: mpu_data.accel,
            gyro: mpu_data.gyro,
            is_tilted: mpu_data.is_tilted,
            gpsSpeed: info.current_data?.gps?.speed,
          }),
        );
      }
    });

    const unsubPos = subscribeDevicePosition(deviceId, (pos) => {
      setLiveData((prev) => {
        if (!prev) {
          return {
            deviceId,
            lat: pos.lat,
            lng: pos.lng,
            speed: pos.speed ?? 0,
            battery: 0,
            status: "online",
            isTilted: false,
            timestamp: Date.now(),
          };
        }
        return {
          ...prev,
          lat: pos.lat,
          lng: pos.lng,
          speed: pos.speed ?? prev.speed,
        };
      });
      setLastUpdateAt(Date.now());
    });

    return () => {
      unsubInfo();
      unsubPos();
    };
  }, [deviceId]);

  return {
    liveData,
    motionState,
    lastUpdateAt,
    alerts,
    metrics,
    // WebSocket state
    wsConnectionState: ws.connectionState,
    isWsConnected: ws.isConnected,
    lastPing: ws.lastPing,
  };
}
