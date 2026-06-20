import { Controller, Get, Put, Body, Param, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import type { DeviceSettings } from "./settings.service";
import { FirebaseAuthGuard } from "../firebase/firebase-auth.guard";

@ApiTags("settings")
@ApiBearerAuth("firebase-token")
@Controller("settings")
@UseGuards(FirebaseAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(":deviceId")
  @ApiOperation({
    summary: "Lấy cài đặt thiết bị",
    description: "Đọc cài đặt ngưỡng, SOS email, v.v. từ Firebase RTDB",
  })
  @ApiParam({ name: "deviceId", example: "DEVICE_ESP32_01" })
  async getSettings(@Param("deviceId") deviceId: string) {
    return this.settingsService.getSettings(deviceId);
  }

  @Put(":deviceId")
  @ApiOperation({
    summary: "Lưu cài đặt thiết bị",
    description: "Ghi/merge cài đặt vào Firebase RTDB",
  })
  @ApiParam({ name: "deviceId", example: "DEVICE_ESP32_01" })
  async saveSettings(
    @Param("deviceId") deviceId: string,
    @Body() body: DeviceSettings,
  ) {
    return this.settingsService.saveSettings(deviceId, body);
  }
}
