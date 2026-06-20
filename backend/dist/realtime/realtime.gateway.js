"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor() {
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
        this.clientDeviceMap = new Map();
        this.deviceClientMap = new Map();
        this.connectedCount = 0;
    }
    afterInit(server) {
        this.logger.log("⚡ WebSocket Gateway initialized at /events");
        setInterval(() => {
            server.emit("system:ping", {
                ts: Date.now(),
                clients: this.connectedCount,
            });
        }, 30_000);
    }
    handleConnection(client) {
        this.connectedCount++;
        this.clientDeviceMap.set(client.id, new Set());
        this.logger.log(`Client connected: ${client.id} | Total: ${this.connectedCount}`);
        client.emit("system:connected", {
            socketId: client.id,
            ts: Date.now(),
            message: "Connected to MoveMonitor Realtime",
        });
    }
    handleDisconnect(client) {
        this.connectedCount = Math.max(0, this.connectedCount - 1);
        const devices = this.clientDeviceMap.get(client.id) ?? new Set();
        devices.forEach((deviceId) => {
            const clients = this.deviceClientMap.get(deviceId);
            clients?.delete(client.id);
            if (clients?.size === 0)
                this.deviceClientMap.delete(deviceId);
        });
        this.clientDeviceMap.delete(client.id);
        this.logger.log(`Client disconnected: ${client.id} | Total: ${this.connectedCount}`);
    }
    handleSubscribeDevice(client, data) {
        const { deviceId } = data;
        if (!deviceId)
            return;
        this.clientDeviceMap.get(client.id)?.add(deviceId);
        if (!this.deviceClientMap.has(deviceId)) {
            this.deviceClientMap.set(deviceId, new Set());
        }
        this.deviceClientMap.get(deviceId).add(client.id);
        client.join(`device:${deviceId}`);
        this.logger.log(`Client ${client.id} subscribed to device ${deviceId}`);
        client.emit("subscribe:ack", {
            deviceId,
            status: "subscribed",
            ts: Date.now(),
        });
    }
    handleUnsubscribeDevice(client, data) {
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
    pushDeviceUpdate(event) {
        this.server.to(`device:${event.deviceId}`).emit("device:update", event);
    }
    pushAlert(event) {
        this.server.emit("device:alert", event);
        this.server.to(`device:${event.deviceId}`).emit("device:alert", event);
    }
    pushDeviceStatus(event) {
        this.server.emit("device:status", event);
    }
    getConnectedCount() {
        return this.connectedCount;
    }
    getDeviceSubscriberCount(deviceId) {
        return this.deviceClientMap.get(deviceId)?.size ?? 0;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("subscribe:device"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleSubscribeDevice", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("unsubscribe:device"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUnsubscribeDevice", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
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
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map