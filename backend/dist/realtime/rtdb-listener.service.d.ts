import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
export declare class RtdbListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly gateway;
    private readonly logger;
    private pollInterval;
    private lastDeviceSnapshots;
    private lastAlertCount;
    private knownAlertIds;
    private tripStates;
    constructor(gateway: RealtimeGateway);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private startPolling;
    private poll;
    private pollDevices;
    private handleTripDetection;
    private saveHistoryPoint;
    private pollAlerts;
}
