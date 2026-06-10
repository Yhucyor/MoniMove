import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Firebase Admin được khởi tạo trong FirebaseService.onModuleInit()
  // Không cần khởi tạo ở đây nữa để tránh duplicate initialization
  
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix to api
  app.setGlobalPrefix('api');
  
  // Bật CORS để Frontend Next.js (cổng 3000) có thể thoải mái gọi API sang đây
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Đổi cổng thành 3001 để không bị đụng hàng với Next.js (cổng 3000)
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend đang chạy tại: http://localhost:${port}`);
  console.log(`📡 API endpoint: http://localhost:${port}/api`);
}
bootstrap();