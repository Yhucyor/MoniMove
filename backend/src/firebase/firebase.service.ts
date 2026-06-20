<<<<<<< HEAD
import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import * as admin from "firebase-admin";
import * as path from "path";
import { AuthUser, UserProfile } from "../common/types/auth-user.interface";

/**
 * FirebaseService — Merged từ MoveMonitor_v2 + MoveMonitor (v3)
 *
 * v2 thêm: getUserProfile, getAllUsers, updateUserRole, updateUserDevices,
 *           deleteUser, canAccessDevice (RBAC đầy đủ)
 * v3 thêm: logic khởi tạo thông qua service account file
 *
 * Merged: giữ toàn bộ chức năng v2 (phong phú hơn) + cách init của v3
 */
=======
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
<<<<<<< HEAD
      this.logger.log("Initializing Firebase Admin SDK with credentials...");

      try {
        // Ưu tiên sử dụng service account file nếu có
        const serviceAccountPath = path.resolve(
          __dirname,
          "..",
          "config",
          "firebase-service-account.json",
        );

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          databaseURL:
            process.env.FIREBASE_DATABASE_URL ||
            "https://monitoring-d6063-default-rtdb.firebaseio.com",
        });

        this.logger.log(
          "✅ Firebase Admin SDK initialized successfully with service account file",
        );
      } catch (error) {
        this.logger.error("❌ Failed to initialize Firebase Admin SDK:", error);
        throw error;
      }
    } else {
      this.logger.log("Firebase Admin SDK already initialized");
    }

    this.db = admin.firestore();
    this.logger.log("Firestore Database initialized successfully.");
=======
      this.logger.log('Initializing Firebase Admin SDK with credentials...');
      
      try {
        // Ưu tiên sử dụng service account file nếu có
        const serviceAccountPath = path.resolve(__dirname, '..', 'config', 'firebase-service-account.json');
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://monimove-6cd1d-default-rtdb.firebaseio.com',
        });
        
        this.logger.log('✅ Firebase Admin SDK initialized successfully with service account file');
      } catch (error) {
        this.logger.error('❌ Failed to initialize Firebase Admin SDK:', error);
        throw error;
      }
    } else {
      this.logger.log('Firebase Admin SDK already initialized');
    }
    
    this.db = admin.firestore();
    this.logger.log('Firestore Database initialized successfully.');
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

<<<<<<< HEAD
  // ── Token Verification ─────────────────────────────────────────────────────
=======
  // 1. Hàm xác thực ID Token nhận từ Frontend (Bạn đã viết rất tốt, mình giữ nguyên)
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  async verifyIdToken(token: string) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
<<<<<<< HEAD
      this.logger.error("Xác thực Firebase Token thất bại:", error);
=======
      this.logger.error('Xác thực Firebase Token thất bại:', error);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      throw error;
    }
  }

<<<<<<< HEAD
  // ── User Role (Get or create on first login) ───────────────────────────────
  async getUserRole(
    email: string,
    name: string,
    avatar: string,
  ): Promise<string> {
    try {
      const userRef = this.db.collection("users").doc(email);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const role = userData?.role || "user";
        this.logger.log(
          `[DB] Người dùng cũ đăng nhập: ${email}. Quyền: ${role.toUpperCase()}`,
        );
        return role;
      } else {
        // Tài khoản MỚI — tự động tạo với deviceIds rỗng
        const newUserData = {
          email,
          name,
          avatar,
          role: "user",
          deviceIds: [] as string[],
          createdAt: new Date().toISOString(),
        };
        await userRef.set(newUserData);
        this.logger.log(`[DB] Tạo bản ghi mới cho: ${email} — role: USER`);
        return "user";
      }
    } catch (error) {
      this.logger.error(`Lỗi truy xuất User Firestore [${email}]:`, error);
      return "user";
    }
  }

  // ── User Profile ───────────────────────────────────────────────────────────
  async getUserProfile(email: string): Promise<UserProfile | null> {
    if (!email) return null;

    try {
      const userDoc = await this.db.collection("users").doc(email).get();
      if (!userDoc.exists) return null;

      const data = userDoc.data();
      return {
        email: data?.email || email,
        name: data?.name || "Người dùng IoT",
        avatar: data?.avatar || "",
        role: data?.role === "admin" ? "admin" : "user",
        deviceIds: Array.isArray(data?.deviceIds) ? data.deviceIds : [],
        createdAt: data?.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy profile user ${email}:`, error);
      return null;
    }
  }

  // ── All Users (Admin) ──────────────────────────────────────────────────────
  async getAllUsers(): Promise<UserProfile[]> {
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

  // ── Update Role ────────────────────────────────────────────────────────────
  async updateUserRole(
    email: string,
    role: "user" | "admin",
  ): Promise<UserProfile | null> {
    const userRef = this.db.collection("users").doc(email);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return null;
    await userRef.update({ role });
    return this.getUserProfile(email);
  }

  // ── Update Devices ─────────────────────────────────────────────────────────
  async updateUserDevices(
    email: string,
    deviceIds: string[],
  ): Promise<UserProfile | null> {
    const userRef = this.db.collection("users").doc(email);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return null;
    await userRef.update({ deviceIds });
    return this.getUserProfile(email);
  }

  // ── Delete User ────────────────────────────────────────────────────────────
  async deleteUser(email: string): Promise<boolean> {
    const userRef = this.db.collection("users").doc(email);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return false;
    await userRef.delete();
    return true;
  }

  // ── Device Access Control ──────────────────────────────────────────────────
  canAccessDevice(user: AuthUser, deviceId: string): boolean {
    if (user.role === "admin") return true;
    return user.deviceIds.includes(deviceId);
  }
}
=======
  // 2. BỔ SUNG: Hàm kiểm tra tài khoản và lấy Quyền hạn (Role) thực tế từ Firestore
  async getUserRole(email: string, name: string, avatar: string): Promise<string> {
    try {
      // Trỏ đến collection 'users' và tìm tài liệu (document) có tên ID chính là email của user
      const userRef = this.db.collection('users').doc(email);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        // Trường hợp: Người dùng CŨ đăng nhập thông thường
        const userData = userDoc.data();
        const role = userData?.role || 'user';
        this.logger.log(`[DB] Người dùng cũ đăng nhập: ${email}. Quyền lấy từ DB: ${role.toUpperCase()}`);
        return role;
      } else {
        // Trường hợp: Tài khoản MỚI đăng nhập lần đầu (Tự động Đăng ký bản ghi mới)
        const newUserData = {
          email: email,
          name: name,
          avatar: avatar,
          role: 'user', // Tự động gán quyền mặc định ban đầu là 'user'
          createdAt: new Date().toISOString(),
        };

        // Thực hiện ghi dữ liệu mới tinh vào Cloud Firestore Database
        await userRef.set(newUserData);
        this.logger.log(`[DB] Đã tự động tạo bản ghi tài khoản mới cho: ${email} với quyền mặc định: USER`);
        return 'user';
      }
    } catch (error) {
      this.logger.error(`Lỗi khi truy xuất dữ liệu User trên Firestore của email ${email}:`, error);
      return 'user'; // Nếu lỗi DB, trả về quyền cơ bản thấp nhất để an toàn hệ thống
    }
  }
}
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
