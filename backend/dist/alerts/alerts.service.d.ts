import { MailService } from "../mail/mail.service";
export declare function isEmergency(alertType: string): boolean;
export declare class AlertsService {
    private readonly mailService;
    private readonly logger;
    constructor(mailService: MailService);
    processEmergencyEmail(alertData: {
        deviceId: string;
        alertType: string;
        message: string;
        timestamp: number;
        location?: {
            lat: number;
            lng: number;
        };
        sosEmail?: string;
    }): Promise<void>;
    createAlert(alertData: {
        deviceId: string;
        alertType: string;
        message: string;
        timestamp?: number;
        location?: {
            lat: number;
            lng: number;
        };
        sosEmail?: string;
    }): Promise<{
        success: boolean;
        alertId: any;
    }>;
    private getSosEmail;
    getAlerts(deviceId?: string): Promise<any[]>;
}
