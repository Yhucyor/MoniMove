export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendEmergencyEmail(toEmail: string, alertData: {
        alertType: string;
        message: string;
        deviceId: string;
        timestamp: number;
        location?: {
            lat: number;
            lng: number;
        };
    }): Promise<void>;
}
