"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const firebase_auth_guard_1 = require("../firebase/firebase-auth.guard");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getSettings(deviceId) {
        return this.settingsService.getSettings(deviceId);
    }
    async saveSettings(deviceId, body) {
        return this.settingsService.saveSettings(deviceId, body);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(':deviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy cài đặt thiết bị', description: 'Đọc cài đặt ngưỡng, SOS email, v.v. từ Firebase RTDB' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', example: 'DEVICE_ESP32_01' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)(':deviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lưu cài đặt thiết bị', description: 'Ghi/merge cài đặt vào Firebase RTDB' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', example: 'DEVICE_ESP32_01' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "saveSettings", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, swagger_1.ApiBearerAuth)('firebase-token'),
    (0, common_1.Controller)('settings'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map