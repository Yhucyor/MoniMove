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
var FirebaseAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("./firebase.service");
let FirebaseAuthGuard = FirebaseAuthGuard_1 = class FirebaseAuthGuard {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.logger = new common_1.Logger(FirebaseAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new common_1.UnauthorizedException("Không tìm thấy token xác thực hoặc sai định dạng");
        }
        const token = authHeader.split(" ")[1];
        try {
            const decodedToken = await this.firebaseService.verifyIdToken(token);
            const email = decodedToken.email || "";
            const profile = await this.firebaseService.getUserProfile(email);
            const authUser = {
                uid: decodedToken.uid,
                email,
                name: profile?.name || decodedToken.name || "Người dùng IoT",
                avatar: profile?.avatar || decodedToken.picture || "",
                role: profile?.role || "user",
                deviceIds: profile?.deviceIds || [],
            };
            request.user = authUser;
            return true;
        }
        catch (error) {
            this.logger.error(`Xác thực token thất bại: ${error instanceof Error ? error.message : String(error)}`);
            throw new common_1.UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = FirebaseAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map