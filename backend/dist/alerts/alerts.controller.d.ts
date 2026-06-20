import { AlertsService } from "./alerts.service";
import { MailService } from "../mail/mail.service";
import { FirebaseService } from "../firebase/firebase.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CreateAlertDto } from "../common/dto/create-alert.dto";
import type { AuthUser } from "../common/types/auth-user.interface";
export declare class AlertsController {
    private readonly alertsService;
    private readonly mailService;
    private readonly firebaseService;
    private readonly realtimeGateway;
    constructor(alertsService: AlertsService, mailService: MailService, firebaseService: FirebaseService, realtimeGateway: RealtimeGateway);
    createAlert(body: CreateAlertDto, user: AuthUser): Promise<{
        success: boolean;
        alertId: any;
    }>;
    getAlerts(deviceId: string | undefined, user: AuthUser): Promise<any[]>;
    testEmail(body: {
        toEmail?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    private inferSeverity;
}
