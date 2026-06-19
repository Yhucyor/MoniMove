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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const devices_service_1 = require("./devices.service");
const firebase_auth_guard_1 = require("../firebase/firebase-auth.guard");
const firebase_service_1 = require("../firebase/firebase.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DevicesController = class DevicesController {
    constructor(devicesService, firebaseService) {
        this.devicesService = devicesService;
        this.firebaseService = firebaseService;
    }
    assertDeviceAccess(user, deviceId) {
        if (!this.firebaseService.canAccessDevice(user, deviceId)) {
            throw new common_1.ForbiddenException(`Bạn không có quyền truy cập thiết bị ${deviceId}`);
        }
    }
    async listDevices(user) {
        const allDevices = await this.devicesService.listAllDevices();
        if (user.role === 'admin')
            return allDevices;
        return allDevices.filter((d) => user.deviceIds.includes(d.id));
    }
    async getDevice(deviceId, user) {
        this.assertDeviceAccess(user, deviceId);
        const device = await this.devicesService.getDevice(deviceId);
        if (!device)
            throw new common_1.NotFoundException(`Device ${deviceId} not found`);
        return device;
    }
    async getLatestPosition(deviceId, user) {
        this.assertDeviceAccess(user, deviceId);
        const device = await this.devicesService.getDevice(deviceId);
        if (!device)
            throw new common_1.NotFoundException(`Device ${deviceId} not found`);
        return this.devicesService.getLatestPosition(deviceId);
    }
    async getRoute(deviceId, user) {
        this.assertDeviceAccess(user, deviceId);
        const device = await this.devicesService.getDevice(deviceId);
        if (!device)
            throw new common_1.NotFoundException(`Device ${deviceId} not found`);
        return this.devicesService.getRoute(deviceId);
    }
    async getHistory(deviceId, start, end, user) {
        if (!start || !end)
            throw new common_1.BadRequestException('"start" và "end" là bắt buộc');
        this.assertDeviceAccess(user, deviceId);
        const device = await this.devicesService.getDevice(deviceId);
        if (!device)
            throw new common_1.NotFoundException(`Device ${deviceId} not found`);
        const startTime = Number(start);
        const endTime = Number(end);
        if (isNaN(startTime) || isNaN(endTime))
            throw new common_1.BadRequestException('"start" và "end" phải là số');
        return this.devicesService.getHistory(deviceId, startTime, endTime);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách thiết bị', description: 'Admin thấy tất cả, User thấy thiết bị được cấp quyền' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách thiết bị IoT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "listDevices", null);
__decorate([
    (0, common_1.Get)(':deviceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết thiết bị', description: 'Bao gồm GPS, IMU, battery, trạng thái kết nối' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', example: 'DEVICE_ESP32_01' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin đầy đủ của thiết bị' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy thiết bị' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getDevice", null);
__decorate([
    (0, common_1.Get)(':deviceId/position'),
    (0, swagger_1.ApiOperation)({ summary: 'Vị trí GPS hiện tại', description: 'Tọa độ mới nhất của thiết bị' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', example: 'DEVICE_ESP32_01' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getLatestPosition", null);
__decorate([
    (0, common_1.Get)(':deviceId/route'),
    (0, swagger_1.ApiOperation)({ summary: 'Lộ trình di chuyển', description: 'Tập hợp các waypoints từ lịch sử GPS' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', example: 'DEVICE_ESP32_01' }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getRoute", null);
__decorate([
    (0, common_1.Get)(':deviceId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lịch sử GPS', description: 'Trả về các điểm GPS trong khoảng thời gian' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', example: 'DEVICE_ESP32_01' }),
    (0, swagger_1.ApiQuery)({ name: 'start', description: 'Unix timestamp ms (bắt đầu)', example: 1718000000000 }),
    (0, swagger_1.ApiQuery)({ name: 'end', description: 'Unix timestamp ms (kết thúc)', example: 1718086400000 }),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getHistory", null);
exports.DevicesController = DevicesController = __decorate([
    (0, swagger_1.ApiTags)('devices'),
    (0, swagger_1.ApiBearerAuth)('firebase-token'),
    (0, common_1.Controller)('devices'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:paramtypes", [devices_service_1.DevicesService,
        firebase_service_1.FirebaseService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map