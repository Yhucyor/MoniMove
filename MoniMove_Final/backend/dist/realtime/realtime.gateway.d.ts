import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: number;
    location?: {
        lat: number;
        lng: number;
    };
}
export interface DeviceStatusEvent {
    deviceId: string;
    status: 'online' | 'offline';
    timestamp: number;
}
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private clientDeviceMap;
    private deviceClientMap;
    private connectedCount;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeDevice(client: Socket, data: {
        deviceId: string;
    }): void;
    handleUnsubscribeDevice(client: Socket, data: {
        deviceId: string;
    }): void;
    pushDeviceUpdate(event: DeviceUpdateEvent): void;
    pushAlert(event: AlertEvent): void;
    pushDeviceStatus(event: DeviceStatusEvent): void;
    getConnectedCount(): number;
    getDeviceSubscriberCount(deviceId: string): number;
}
