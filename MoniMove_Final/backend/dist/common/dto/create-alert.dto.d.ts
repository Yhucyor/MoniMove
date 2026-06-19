export declare class CreateAlertDto {
    deviceId: string;
    alertType: string;
    message: string;
    severity?: 'critical' | 'warning' | 'info';
    timestamp?: number;
    location?: {
        lat: number;
        lng: number;
    };
    sosEmail?: string;
}
