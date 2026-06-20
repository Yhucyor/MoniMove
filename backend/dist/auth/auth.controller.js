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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const firebase_service_1 = require("../firebase/firebase.service");
class VerifyTokenDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        description: "Firebase ID Token nhận từ client sau khi đăng nhập",
        example: "eyJhbGciOiJSUzI1NiIs...",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyTokenDto.prototype, "idToken", void 0);
let AuthController = AuthController_1 = class AuthController {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async verifyToken(body, res) {
        try {
            const { idToken } = body;
            if (!idToken) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Thiếu ID Token",
                });
            }
            const decodedToken = await this.firebaseService.verifyIdToken(idToken);
            const email = decodedToken.email || "";
            const name = decodedToken.name || "Người dùng IoT";
            const avatar = decodedToken.picture || "";
            const finalRole = await this.firebaseService.getUserRole(email, name, avatar);
            const profile = await this.firebaseService.getUserProfile(email);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: "Xác thực thành công",
                user: {
                    email,
                    name: profile?.name || name,
                    avatar: profile?.avatar || avatar,
                    role: finalRole,
                    deviceIds: profile?.deviceIds || [],
                },
            });
        }
        catch (error) {
            this.logger.error("Auth error:", error);
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Xác thực thất bại hoặc lỗi kết nối dữ liệu.",
            });
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Xác thực Firebase Token",
        description: "Nhận Firebase ID Token từ frontend, xác thực với Firebase Admin SDK và trả về thông tin user + role",
    }),
    (0, swagger_1.ApiBody)({ type: VerifyTokenDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Xác thực thành công — trả về user info và role",
        schema: {
            example: {
                success: true,
                message: "Xác thực thành công",
                user: {
                    email: "user@example.com",
                    name: "Nguyễn A",
                    role: "user",
                    deviceIds: ["DEVICE_ESP32_01"],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Thiếu idToken" }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: "Token không hợp lệ hoặc đã hết hạn",
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)("auth"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map