import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

export interface DeviceUpdateEvent {
  deviceId: string;
  lat?: number;
  lng?: number;
  speed?: number;
  battery?: number;
  status?: string;
  isTilted?: boolean;
  timestamp: number;
}

export interface AlertEvent {
  id: string;
  deviceId: string;
  alertType: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: number;
  location?: { lat: number; lng: number };
}

export interface DeviceStatusEvent {
  deviceId: string;
  status: "online" | "offline";
  timestamp: number;
}

/**
 * MoveMonitor Realtime Gateway — từ MoveMonitor_v2
 * Namespace: /events
 *
 * Events pushed to clients:
 *   device:update    — GPS + sensor data update
 *   device:alert     — New alert fired
 *   device:status    — Online/offline state change
 *   system:ping      — Keepalive heartbeat (every 30s)
 *   system:connected — Welcome message on connection
 *
 * Events from clients:
 *   subscribe:device   — Watch a specific device
 *   unsubscribe:device — Stop watching a device
 */
@WebSocketGateway({
  namespace: "/events",
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  // Track connected clients and their subscriptions
  private clientDeviceMap = new Map<string, Set<string>>(); // socketId → Set<deviceId>
  private deviceClientMap = new Map<string, Set<string>>(); // deviceId → Set<socketId>
  private connectedCount = 0;

  afterInit(server: Server) {
    this.logger.log("⚡ WebSocket Gateway initialized at /events");

    // Heartbeat every 30s
    setInterval(() => {
      server.emit("system:ping", {
        ts: Date.now(),
        clients: this.connectedCount,
      });
    }, 30_000);
  }

  handleConnection(client: Socket) {
    this.connectedCount++;
    this.clientDeviceMap.set(client.id, new Set());
    this.logger.log(
      `Client connected: ${client.id} | Total: ${this.connectedCount}`,
    );

    // Send welcome + current stats
    client.emit("system:connected", {
      socketId: client.id,
      ts: Date.now(),
      message: "Connected to MoveMonitor Realtime",
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedCount = Math.max(0, this.connectedCount - 1);

    // Clean up device subscriptions
    const devices = this.clientDeviceMap.get(client.id) ?? new Set();
    devices.forEach((deviceId) => {
      const clients = this.deviceClientMap.get(deviceId);
      clients?.delete(client.id);
      if (clients?.size === 0) this.deviceClientMap.delete(deviceId);
    });
    this.clientDeviceMap.delete(client.id);

    this.logger.log(
      `Client disconnected: ${client.id} | Total: ${this.connectedCount}`,
    );
  }

  // ── Client subscribes to a device ─────────────────────────────────────────
  @SubscribeMessage("subscribe:device")
  handleSubscribeDevice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    const { deviceId } = data;
    if (!deviceId) return;

    this.clientDeviceMap.get(client.id)?.add(deviceId);
    if (!this.deviceClientMap.has(deviceId)) {
      this.deviceClientMap.set(deviceId, new Set());
    }
    this.deviceClientMap.get(deviceId)!.add(client.id);

    // Join room for this device
    client.join(`device:${deviceId}`);
    this.logger.log(`Client ${client.id} subscribed to device ${deviceId}`);
    client.emit("subscribe:ack", {
      deviceId,
      status: "subscribed",
      ts: Date.now(),
    });
  }

  // ── Client unsubscribes ────────────────────────────────────────────────────
  @SubscribeMessage("unsubscribe:device")
  handleUnsubscribeDevice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    const { deviceId } = data;
    this.clientDeviceMap.get(client.id)?.delete(deviceId);
    this.deviceClientMap.get(deviceId)?.delete(client.id);
    client.leave(`device:${deviceId}`);
    client.emit("unsubscribe:ack", {
      deviceId,
      status: "unsubscribed",
      ts: Date.now(),
    });
  }

  // ── Server-side push methods (called by services) ─────────────────────────

  /** Push device GPS + sensor update to subscribers */
  pushDeviceUpdate(event: DeviceUpdateEvent) {
    this.server.to(`device:${event.deviceId}`).emit("device:update", event);
  }

  /** Push a new alert to ALL connected clients + device-specific room */
  pushAlert(event: AlertEvent) {
    // Broadcast to everyone (notifications panel)
    this.server.emit("device:alert", event);
    // Also to device-specific room
    this.server.to(`device:${event.deviceId}`).emit("device:alert", event);
  }

  /** Push device online/offline status change */
  pushDeviceStatus(event: DeviceStatusEvent) {
    this.server.emit("device:status", event);
  }

  /** Get number of connected clients */
  getConnectedCount(): number {
    return this.connectedCount;
  }

  /** Get subscribers for a device */
  getDeviceSubscriberCount(deviceId: string): number {
    return this.deviceClientMap.get(deviceId)?.size ?? 0;
  }
}
