import * as admin from 'firebase-admin';

// Kiểm tra nếu Firebase Admin chưa được khởi tạo thì mới tiến hành cấu hình
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Thay thế ký tự xuống dòng \n để chuỗi Private Key không bị lỗi cấu trúc khi đọc file .env
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('>> [Backend] Firebase Admin SDK đã khởi tạo thành công!');
  } catch (error) {
    console.error('>> [Backend] Lỗi khởi tạo Firebase Admin:', error);
  }
}

// Xuất bản (Export) 2 công cụ chính để các API khác gọi tới sử dụng
export const adminAuth = admin.auth(); // Dùng để xác thực token Google
export const adminDb = admin.firestore(); // Dùng để đọc/ghi vào Database Firestore