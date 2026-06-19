"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const path = require("path");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    onModuleInit() {
        if (admin.apps.length === 0) {
            this.logger.log("Initializing Firebase Admin SDK with credentials...");
            try {
                const serviceAccountPath = path.resolve(__dirname, "..", "config", "firebase-service-account.json");
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccountPath),
                    databaseURL: process.env.FIREBASE_DATABASE_URL ||
                        "https://monitoring-d6063-default-rtdb.firebaseio.com",
                });
                this.logger.log("✅ Firebase Admin SDK initialized successfully with service account file");
            }
            catch (error) {
                this.logger.error("❌ Failed to initialize Firebase Admin SDK:", error);
                throw error;
            }
        }
        else {
            this.logger.log("Firebase Admin SDK already initialized");
        }
        this.db = admin.firestore();
        this.logger.log("Firestore Database initialized successfully.");
    }
    getFirestore() {
        return this.db;
    }
    async verifyIdToken(token) {
        try {
            return await admin.auth().verifyIdToken(token);
        }
        catch (error) {
            this.logger.error("Xác thực Firebase Token thất bại:", error);
            throw error;
        }
    }
    async getUserRole(email, name, avatar) {
        try {
            const userRef = this.db.collection("users").doc(email);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const role = userData?.role || "user";
                this.logger.log(`[DB] Người dùng cũ đăng nhập: ${email}. Quyền: ${role.toUpperCase()}`);
                return role;
            }
            else {
                const newUserData = {
                    email,
                    name,
                    avatar,
                    role: "user",
                    deviceIds: [],
                    createdAt: new Date().toISOString(),
                };
                await userRef.set(newUserData);
                this.logger.log(`[DB] Tạo bản ghi mới cho: ${email} — role: USER`);
                return "user";
            }
        }
        catch (error) {
            this.logger.error(`Lỗi truy xuất User Firestore [${email}]:`, error);
            return "user";
        }
    }
    async getUserProfile(email) {
        if (!email)
            return null;
        try {
            const userDoc = await this.db.collection("users").doc(email).get();
            if (!userDoc.exists)
                return null;
            const data = userDoc.data();
            return {
                email: data?.email || email,
                name: data?.name || "Người dùng IoT",
                avatar: data?.avatar || "",
                role: data?.role === "admin" ? "admin" : "user",
                deviceIds: Array.isArray(data?.deviceIds) ? data.deviceIds : [],
                createdAt: data?.createdAt || new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Lỗi khi lấy profile user ${email}:`, error);
            return null;
        }
    }
    async getAllUsers() {
        const snapshot = await this.db.collection("users").get();
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                email: data.email || doc.id,
                name: data.name || "Người dùng IoT",
                avatar: data.avatar || "",
                role: data.role === "admin" ? "admin" : "user",
                deviceIds: Array.isArray(data.deviceIds) ? data.deviceIds : [],
                createdAt: data.createdAt || "",
            };
        });
    }
    async updateUserRole(email, role) {
        const userRef = this.db.collection("users").doc(email);
        const userDoc = await userRef.get();
        if (!userDoc.exists)
            return null;
        await userRef.update({ role });
        return this.getUserProfile(email);
    }
    async updateUserDevices(email, deviceIds) {
        const userRef = this.db.collection("users").doc(email);
        const userDoc = await userRef.get();
        if (!userDoc.exists)
            return null;
        await userRef.update({ deviceIds });
        return this.getUserProfile(email);
    }
    async deleteUser(email) {
        const userRef = this.db.collection("users").doc(email);
        const userDoc = await userRef.get();
        if (!userDoc.exists)
            return false;
        await userRef.delete();
        return true;
    }
    canAccessDevice(user, deviceId) {
        if (user.role === "admin")
            return true;
        return user.deviceIds.includes(deviceId);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map