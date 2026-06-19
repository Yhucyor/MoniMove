export interface DeviceSettings {
    sos_email?: string;
    sos_phone?: string;
    tilt_threshold?: number;
    accel_threshold?: number;
    speed_threshold?: number;
    sensitivity?: number;
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
