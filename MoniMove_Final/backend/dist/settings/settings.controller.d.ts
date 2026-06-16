import { SettingsService } from './settings.service';
import type { DeviceSettings } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(deviceId: string): Promise<DeviceSettings>;
    saveSettings(deviceId: string, body: DeviceSettings): Promise<{
        success: boolean;
    }>;
}
