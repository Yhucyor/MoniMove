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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alerts_service_1 = require("./alerts.service");
const mail_service_1 = require("../mail/mail.service");
const firebase_auth_guard_1 = require("../firebase/firebase-auth.guard");
const firebase_service_1 = require("../firebase/firebase.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const create_alert_dto_1 = require("../common/dto/create-alert.dto");
let AlertsController = class AlertsController {
    constructor(alertsService, mailService, firebaseService, realtimeGateway) {
        this.alertsService = alertsService;
        this.mailService = mailService;
        this.firebaseService = firebaseService;
        this.realtimeGateway = realtimeGateway;
    }
    async createAlert(body, user) {
        if (!this.firebaseService.canAccessDevice(user, body.deviceId)) {
            throw new common_1.ForbiddenException(`Bạn không có quyền gửi cảnh báo cho thiết bị ${body.deviceId}`);
        }
        const result = await this.alertsService.createAlert(body);
        this.realtimeGateway.pushAlert({
            id: result.alertId || `alert_${Date.now()}`,
            deviceId: body.deviceId,
            alertType: body.alertType,
            severity: body.severity || this.inferSeverity(body.alertType),
            message: body.message,
            timestamp: body.timestamp || Date.now(),
            location: body.location,
        });
        return result;
    }
    async getAlerts(deviceId, user) {
        if (deviceId) {
            if (!this.firebaseService.canAccessDevice(user, deviceId)) {
                throw new common_1.ForbiddenException(`Bạn không có quyền xem cảnh báo của thiết bị ${deviceId}`);
            }
            return this.alertsService.getAlerts(deviceId);
        }
        const alerts = await this.alertsService.getAlerts();
        if (user.role === "admin")
            return alerts;
        return alerts.filter((a) => user.deviceIds.includes(a.deviceId));
    }
    async testEmail(body) {
        const target = body.toEmail || process.env.SMTP_USER || "";
        if (!target || !target.includes("@")) {
            throw new common_1.BadRequestException("toEmail phải là địa chỉ email hợp lệ");
        }
        await this.mailService.sendEmergencyEmail(target, {
            alertType: "Kiểm tra hệ thống",
            message: "🧪 Email kiểm tra từ MoveMonitor. Nếu nhận được email này, SMTP đang hoạt động bình thường! ✅",
            deviceId: "TEST",
            timestamp: Date.now(),
        });
        return { success: true, message: `✅ Email kiểm tra đã gửi tới ${target}` };
    }
    inferSeverity(alertType) {
        const lower = (alertType || "").toLowerCase();
        if (lower.includes("ngã") ||
            lower.includes("va chạm") ||
            lower.includes("tilt") ||
            lower.includes("crash"))
            return "critical";
        if (lower.includes("cảnh báo") ||
            lower.includes("pin") ||
            lower.includes("tốc độ"))
            return "warning";
        return "info";
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Tạo cảnh báo mới",
        description: "Lưu alert vào Firebase RTDB, push realtime qua WebSocket và gửi email SOS nếu khẩn cấp",
    }),
    (0, swagger_1.ApiBody)({ type: create_alert_dto_1.CreateAlertDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Alert tạo thành công" }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: "Không có quyền truy cập thiết bị này",
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_alert_dto_1.CreateAlertDto, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: "Lấy danh sách cảnh báo",
        description: "Admin thấy tất cả, User chỉ thấy thiết bị được cấp quyền",
    }),
    (0, swagger_1.ApiQuery)({
        name: "deviceId",
        required: false,
        description: "Lọc theo thiết bị cụ thể",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Danh sách alerts" }),
    __param(0, (0, common_1.Query)("deviceId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Post)("test-email"),
    (0, swagger_1.ApiOperation)({
        summary: "Test SMTP email",
        description: "Gửi email kiểm tra — không cần auth. Body: { toEmail?: string }",
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "testEmail", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)("alerts"),
    (0, swagger_1.ApiBearerAuth)("firebase-token"),
    (0, common_1.Controller)("alerts"),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService,
        mail_service_1.MailService,
        firebase_service_1.FirebaseService,
        realtime_gateway_1.RealtimeGateway])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map