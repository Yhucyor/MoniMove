import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { MailService } from "../mail/mail.service";
export declare class RtdbListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly gateway;
    private readonly mailService;
    private readonly logger;
    private pollInterval;
    private lastDeviceSnapshots;
    private lastAlertCount;
    private knownAlertIds;
    private tripStates;
    constructor(gateway: RealtimeGateway, mailService: MailService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private startPolling;
    private poll;
    private pollDevices;
    private handleTripDetection;
    private saveHistoryPoint;
    private saveTripSummary;
    private isInitialAlertPoll;
    private pollAlerts;
    private getSosEmail;
    private processEmergencyEmail;
}
