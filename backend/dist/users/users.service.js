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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let UsersService = class UsersService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getMe(user) {
        const profile = await this.firebaseService.getUserProfile(user.email);
        return (profile || {
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            deviceIds: user.deviceIds,
            createdAt: '',
        });
    }
    getAllUsers() {
        return this.firebaseService.getAllUsers();
    }
    updateRole(email, role) {
        return this.firebaseService.updateUserRole(email, role);
    }
    updateDevices(email, deviceIds) {
        return this.firebaseService.updateUserDevices(email, deviceIds);
    }
    deleteUser(email) {
        return this.firebaseService.deleteUser(email);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map