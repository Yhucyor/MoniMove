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
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      this.logger.log("Initializing Firebase Admin SDK with credentials...");

      try {
        let credential;
        
        // Priority 1: Render Secret File (recommended for production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
          const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
          this.logger.log(`Using service account from secret file: ${serviceAccountPath}`);
          credential = admin.credential.cert(serviceAccountPath);
        }
        // Priority 2: Base64 encoded (fallback for Render)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
          this.logger.log("Found FIREBASE_SERVICE_ACCOUNT_BASE64. Decoding...");
          const jsonString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
          const serviceAccount = JSON.parse(jsonString);
          credential = admin.credential.cert(serviceAccount);
        }
        // Priority 3: JSON string (original method)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          this.logger.log("Found FIREBASE_SERVICE_ACCOUNT_JSON in environment variables. Parsing...");
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
          credential = admin.credential.cert(serviceAccount);
        }
        // Priority 4: Local file (development)
        else {
          const serviceAccountPath = path.resolve(
            __dirname,
            "..",
            "config",
            "firebase-service-account.json",
          );
          this.logger.log(`Using local service account file at: ${serviceAccountPath}`);
          credential = admin.credential.cert(serviceAccountPath);
        }

        admin.initializeApp({
          credential,
          databaseURL:
            process.env.FIREBASE_DATABASE_URL ||
            "https://monitoring-d6063-default-rtdb.firebaseio.com",
        });

        this.logger.log(
          "✅ Firebase Admin SDK initialized successfully",
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
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  // ── Token Verification ─────────────────────────────────────────────────────
  async verifyIdToken(token: string) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      this.logger.error("Xác thực Firebase Token thất bại:", error);
      throw error;
    }
  }

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
        let role = userData?.role || "user";
        
        // Auto-promote owner email to admin if not already
        if (email === process.env.SMTP_USER && role !== "admin") {
          role = "admin";
          await userRef.update({ role: "admin" });
          this.logger.log(`[DB] Đã tự động cấp quyền ADMIN cho tài khoản chủ: ${email}`);
        }

        this.logger.log(
          `[DB] Người dùng cũ đăng nhập: ${email}. Quyền: ${role.toUpperCase()}`,
        );
        return role;
      } else {
        // Tài khoản MỚI — tự động tạo với deviceIds rỗng
        const role = email === process.env.SMTP_USER ? "admin" : "user";
        const newUserData = {
          email,
          name,
          avatar,
          role,
          deviceIds: [] as string[],
          createdAt: new Date().toISOString(),
        };
        await userRef.set(newUserData);
        this.logger.log(`[DB] Tạo bản ghi mới cho: ${email} — role: ${role.toUpperCase()}`);
        return role;
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
