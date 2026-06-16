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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const firebase_auth_guard_1 = require("../firebase/firebase-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const update_user_dto_1 = require("../common/dto/update-user.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getMe(user) {
        return this.usersService.getMe(user);
    }
    getAllUsers() {
        return this.usersService.getAllUsers();
    }
    async updateRole(email, body, currentUser) {
        const decodedEmail = decodeURIComponent(email);
        if (decodedEmail === currentUser.email && body.role !== 'admin') {
            throw new common_1.BadRequestException('Admin không thể tự hạ quyền của chính mình');
        }
        const updated = await this.usersService.updateRole(decodedEmail, body.role);
        if (!updated)
            throw new common_1.NotFoundException(`Không tìm thấy user ${email}`);
        return updated;
    }
    async updateDevices(email, body) {
        const updated = await this.usersService.updateDevices(decodeURIComponent(email), body.deviceIds);
        if (!updated)
            throw new common_1.NotFoundException(`Không tìm thấy user ${email}`);
        return updated;
    }
    async deleteUser(email, currentUser) {
        const decodedEmail = decodeURIComponent(email);
        if (decodedEmail === currentUser.email) {
            throw new common_1.BadRequestException('Không thể xóa tài khoản đang đăng nhập');
        }
        const deleted = await this.usersService.deleteUser(decodedEmail);
        if (!deleted)
            throw new common_1.NotFoundException(`Không tìm thấy user ${email}`);
        return { success: true, message: `Đã xóa tài khoản ${decodedEmail}` };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Thông tin người dùng hiện tại' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile của user đang đăng nhập' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Danh sách tất cả users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách users trong hệ thống' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)(':email/role'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Cập nhật quyền user' }),
    (0, swagger_1.ApiParam)({ name: 'email', description: 'Email của user cần cập nhật' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateRoleDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật role thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy user' }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateRoleDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Patch)(':email/devices'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Cấp quyền truy cập thiết bị cho user' }),
    (0, swagger_1.ApiParam)({ name: 'email', description: 'Email của user' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateDevicesDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật danh sách thiết bị thành công' }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateDevicesDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateDevices", null);
__decorate([
    (0, common_1.Delete)(':email'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Xóa tài khoản user' }),
    (0, swagger_1.ApiParam)({ name: 'email', description: 'Email của user cần xóa' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa tài khoản thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không thể xóa tài khoản đang đăng nhập' }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)('firebase-token'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map