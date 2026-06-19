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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDevicesDto = exports.UpdateRoleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateRoleDto {
}
exports.UpdateRoleDto = UpdateRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "admin", enum: ["user", "admin"] }),
    (0, class_validator_1.IsIn)(["user", "admin"]),
    __metadata("design:type", String)
], UpdateRoleDto.prototype, "role", void 0);
class UpdateDevicesDto {
}
exports.UpdateDevicesDto = UpdateDevicesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ["DEVICE_ESP32_01", "DEVICE_ESP32_02"],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateDevicesDto.prototype, "deviceIds", void 0);
//# sourceMappingURL=update-user.dto.js.map