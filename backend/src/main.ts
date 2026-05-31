import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as path from 'path';

async function bootstrap() {
  // 1. Cấu hình đường dẫn tìm đến file chìa khóa json của bạn
  const serviceAccountPath = path.resolve(__dirname, 'config', 'firebase-service-account.json');

  // 2. Khởi tạo Firebase Admin
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('🎉 Firebase Admin đã khởi tạo thành công!');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Firebase Admin:', error);
  }

  const app = await NestFactory.create(AppModule);
  
  // Set global prefix to api
  app.setGlobalPrefix('api');
  
  // Bật CORS để Frontend Next.js (cổng 3000) có thể thoải mái gọi API sang đây
  app.enableCors();

  // Đổi cổng thành 3001 để không bị đụng hàng với Next.js (cổng 3000)
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Backend đang chạy tại: http://localhost:3001`);
}
bootstrap();