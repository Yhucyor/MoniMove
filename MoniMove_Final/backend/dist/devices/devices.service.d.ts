import { OnModuleInit } from '@nestjs/common';
export declare class DevicesService implements OnModuleInit {
    private readonly logger;
    onModuleInit(): Promise<void>;
    listAllDevices(): Promise<{
        id: string;
        name: string;
        status: string;
        connectionStatus: string;
        lastPing: number | null;
    }[]>;
    getDevice(deviceId: string): Promise<{
        id: string;
        name: any;
        licensePlate: any;
        status: any;
        connectionStatus: import("../common/utils/device-status.util").ConnectionStatus;
        battery: any;
        lastUpdate: number;
        lastPing: number;
        current_data: any;
    } | {
        id: string;
        name: string;
        licensePlate: any;
        status: string;
        connectionStatus: string;
        battery: number;
        lastUpdate: number;
        lastPing: number;
        current_data: {
            gps: {
                latitude: number;
                longitude: number;
                speed: number;
                satellites: number;
                updated_at: number;
            };
            mpu6050: {
                accel: {
                    x: number;
                    y: number;
                    z: number;
                };
                gyro: {
                    x: number;
                    y: number;
                    z: number;
                };
                is_tilted: boolean;
            };
        };
    }>;
    getLatestPosition(deviceId: string): Promise<{
        lat: any;
        lng: any;
        timestamp: number;
        speed: any;
        heading: any;
    }>;
    getRoute(deviceId: string): Promise<{
        deviceId: string;
        waypoints: number[][];
        distance: number;
        duration: number;
    }>;
    getHistory(deviceId: string, start: number, end: number): Promise<{
        lat: number;
        lng: number;
        timestamp: number;
        speed: number;
    }[]>;
    private seedMockData;
}
