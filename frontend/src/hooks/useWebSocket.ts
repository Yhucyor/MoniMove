"use client";

/**
 * useWebSocket — kết nối tới MoveMonitor Realtime WebSocket Gateway
 *
 * Events nhận được:
 *   device:update  — GPS + sensor data mới nhất
 *   device:alert   — Alert mới được tạo
 *   device:status  — Thiết bị online/offline thay đổi
 *   system:ping    — Heartbeat từ server
 *   system:connected — Xác nhận kết nối
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNotifications } from "../contexts/NotificationContext";

export interface WsDeviceUpdate {
  deviceId: string;
  lat?: number;
  lng?: number;
  speed?: number;
  battery?: number;
  status?: string;
  isTilted?: boolean;
  timestamp: number;
}

export interface WsAlertEvent {
  id: string;
  deviceId: string;
  alertType: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: number;
  location?: { lat: number; lng: number };
}

export interface WsDeviceStatus {
  deviceId: string;
  status: "online" | "offline";
  timestamp: number;
}

export type WsConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseWebSocketOptions {
  /** Device IDs to subscribe to */
  deviceIds?: string[];
  onDeviceUpdate?: (update: WsDeviceUpdate) => void;
  onAlert?: (alert: WsAlertEvent) => void;
  onDeviceStatus?: (status: WsDeviceStatus) => void;
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
}

const WS_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_WS_URL ||
      `http://${window.location.hostname}:3001`
    : "http://localhost:3001";

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    deviceIds = [],
    onDeviceUpdate,
    onAlert,
    onDeviceStatus,
    autoConnect = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [connectionState, setConnectionState] =
    useState<WsConnectionState>("disconnected");
  const [lastPing, setLastPing] = useState<number | null>(null);
  const { notify } = useNotifications();

  // Keep callbacks in refs to avoid stale closures
  const onDeviceUpdateRef = useRef(onDeviceUpdate);
  const onAlertRef = useRef(onAlert);
  const onDeviceStatusRef = useRef(onDeviceStatus);
  useEffect(() => {
    onDeviceUpdateRef.current = onDeviceUpdate;
  }, [onDeviceUpdate]);
  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);
  useEffect(() => {
    onDeviceStatusRef.current = onDeviceStatus;
  }, [onDeviceStatus]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setConnectionState("connecting");

    const socket = io(`${WS_URL}/events`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      setConnectionState("connected");
      console.log("⚡ WebSocket connected:", socket.id);

      // Subscribe to all requested devices
      deviceIds.forEach((id) => {
        socket.emit("subscribe:device", { deviceId: id });
      });
    });

    socket.on("disconnect", (reason) => {
      setConnectionState("disconnected");
      console.log("WebSocket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      setConnectionState("error");
      console.warn("WebSocket error:", err.message);
    });

    socket.on("system:connected", (data: any) => {
      console.log("✅ WS Server ack:", data.message);
    });

    socket.on("system:ping", (data: { ts: number }) => {
      setLastPing(data.ts);
    });

    socket.on("device:update", (data: WsDeviceUpdate) => {
      onDeviceUpdateRef.current?.(data);
    });

    socket.on("device:alert", (data: WsAlertEvent) => {
      onAlertRef.current?.(data);

      // Auto-show notification for critical/warning alerts
      if (data.severity === "critical" || data.severity === "warning") {
        notify({
          type: data.severity === "critical" ? "error" : "warning",
          title: `🚨 ${data.alertType}`,
          message: data.message,
          deviceId: data.deviceId,
        });
      }
    });

    socket.on("device:status", (data: WsDeviceStatus) => {
      onDeviceStatusRef.current?.(data);

      // Auto notify on offline
      if (data.status === "offline") {
        notify({
          type: "offline",
          title: "Thiết bị ngoại tuyến",
          message: `${data.deviceId} mất kết nối lúc ${new Date(data.timestamp).toLocaleTimeString("vi-VN")}`,
          deviceId: data.deviceId,
        });
      } else if (data.status === "online") {
        notify({
          type: "success",
          title: "Thiết bị kết nối lại",
          message: `${data.deviceId} đã trực tuyến trở lại`,
          deviceId: data.deviceId,
        });
      }
    });

    socketRef.current = socket;
  }, []); // eslint-disable-line

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnectionState("disconnected");
  }, []);

  const subscribeDevice = useCallback((deviceId: string) => {
    socketRef.current?.emit("subscribe:device", { deviceId });
  }, []);

  const unsubscribeDevice = useCallback((deviceId: string) => {
    socketRef.current?.emit("unsubscribe:device", { deviceId });
  }, []);

  // Auto connect/disconnect
  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line

  // Re-subscribe when deviceIds change
  useEffect(() => {
    if (connectionState !== "connected") return;
    deviceIds.forEach((id) => subscribeDevice(id));
  }, [deviceIds.join(","), connectionState]); // eslint-disable-line

  return {
    connectionState,
    isConnected: connectionState === "connected",
    lastPing,
    connect,
    disconnect,
    subscribeDevice,
    unsubscribeDevice,
  };
}
