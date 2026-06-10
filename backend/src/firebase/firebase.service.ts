import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
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
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  // 1. Hàm xác thực ID Token nhận từ Frontend (Bạn đã viết rất tốt, mình giữ nguyên)
  async verifyIdToken(token: string) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      this.logger.error('Xác thực Firebase Token thất bại:', error);
      throw error;
    }
  }

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