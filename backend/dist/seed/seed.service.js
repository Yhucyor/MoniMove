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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const firebase_service_1 = require("../firebase/firebase.service");
const TEST_ACCOUNTS = [
    {
        email: 'admin@test.monimove.com',
        password: 'Admin@123456',
        name: 'Admin Test',
        role: 'admin',
        deviceIds: [],
    },
    {
        email: 'user@test.monimove.com',
        password: 'User@123456',
        name: 'User Test',
        role: 'user',
        deviceIds: ['DEVICE_ESP32_01'],
    },
];
let SeedService = SeedService_1 = class SeedService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        if (process.env.SEED_TEST_ACCOUNTS === 'false')
            return;
        for (const account of TEST_ACCOUNTS) {
            await this.ensureTestAccount(account);
        }
    }
    async ensureTestAccount(account) {
        try {
            let userRecord;
            try {
                userRecord = await admin.auth().getUserByEmail(account.email);
                this.logger.log(`Test account exists: ${account.email}`);
            }
            catch {
                userRecord = await admin.auth().createUser({
                    email: account.email,
                    password: account.password,
                    displayName: account.name,
                    emailVerified: true,
                });
                this.logger.log(`Created test account: ${account.email}`);
            }
            const db = this.firebaseService.getFirestore();
            const userRef = db.collection('users').doc(account.email);
            const doc = await userRef.get();
            if (!doc.exists) {
                await userRef.set({
                    email: account.email,
                    name: account.name,
                    avatar: '',
                    role: account.role,
                    deviceIds: account.deviceIds,
                    createdAt: new Date().toISOString(),
                });
                this.logger.log(`Seeded Firestore profile: ${account.email} (${account.role})`);
            }
            else {
                const data = doc.data();
                if (!data?.role || (account.role === 'admin' && data.role !== 'admin')) {
                    await userRef.update({
                        role: account.role,
                        deviceIds: account.deviceIds,
                    });
                }
            }
        }
        catch (error) {
            this.logger.warn(`Could not seed ${account.email}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], SeedService);
//# sourceMappingURL=seed.service.js.map