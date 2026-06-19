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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const realtime_gateway_1 = require("./realtime/realtime.gateway");
let AppController = class AppController {
    constructor(realtimeGateway) {
        this.realtimeGateway = realtimeGateway;
    }
    getHealth() {
        return {
            status: 'ok',
            service: 'MoniMove Backend',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
        };
    }
    getDetailedHealth() {
        return {
            status: 'ok',
            service: 'MoniMove Backend',
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            memory: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            },
            websocket: {
                connectedClients: this.realtimeGateway.getConnectedCount(),
                namespace: '/events',
            },
            features: [
                'REST API',
                'WebSocket Realtime',
                'Firebase RTDB',
                'Firestore Auth',
                'Swagger Docs',
                'Email Alerts (SMTP)',
                'Device Settings',
                'Role-based Access Control',
            ],
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check', description: 'Kiểm tra backend đang chạy' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backend OK' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('api/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Detailed health + realtime stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getDetailedHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('system'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway])
], AppController);
//# sourceMappingURL=app.controller.js.map