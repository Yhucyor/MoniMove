export interface DeviceSettings {
    sos_email?: string;
    sos_phone?: string;
    impactSensitivity?: number;
    fallAngleThreshold?: number;
    speedThreshold?: number;
    enable_sms?: boolean;
    enable_audio?: boolean;
}
export declare class SettingsService {
    getSettings(deviceId: string): Promise<DeviceSettings>;
    saveSettings(deviceId: string, settings: DeviceSettings): Promise<{
        success: boolean;
    }>;
    private defaults;
}
