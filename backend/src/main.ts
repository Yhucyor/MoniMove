<<<<<<< HEAD
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix("api");

  // ── CORS ─────────────────────────────────────────────────────────────────
  const frontendUrl = process.env.FRONTEND_URL;
  const origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
  ];
  if (frontendUrl) origins.push(frontendUrl.replace(/\/$/, ""));
=======
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Firebase Admin được khởi tạo trong FirebaseService.onModuleInit()
  // Không cần khởi tạo ở đây nữa để tránh duplicate initialization
  
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix to api
  app.setGlobalPrefix('api');
  
  // Bật CORS để Frontend Next.js có thể gọi API sang đây
  const frontendUrl = process.env.FRONTEND_URL;
  const origins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  if (frontendUrl) {
    origins.push(frontendUrl);
    origins.push(frontendUrl.replace(/\/$/, ''));
  }
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a

  app.enableCors({
    origin: origins,
    credentials: true,
<<<<<<< HEAD
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // ── Global Validation Pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger API Documentation ─────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle("MoveMonitor API")
    .setDescription(
      "Hệ thống IoT giám sát hành trình, phát hiện va chạm và cảnh báo thời gian thực.\n\n" +
        "**Authentication:** Sử dụng Firebase ID Token trong header `Authorization: Bearer <token>`",
    )
    .setVersion("2.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Firebase ID Token",
      },
      "firebase-token",
    )
    .addTag("auth", "Xác thực Firebase và quản lý phiên đăng nhập")
    .addTag("devices", "Quản lý và giám sát thiết bị IoT")
    .addTag("alerts", "Nhật ký cảnh báo và sự cố")
    .addTag("users", "Quản lý người dùng và phân quyền")
    .addTag("settings", "Cài đặt thiết bị (ngưỡng cảnh báo, SOS email...)")
    .addTag("realtime", "WebSocket events realtime")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      tagsSorter: "alpha",
    },
    customSiteTitle: "MoveMonitor API Docs",
  });

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3001;
  await app.listen(port, "0.0.0.0");

  console.log(`\n🚀 MoveMonitor Backend running at: http://localhost:${port}`);
  console.log(`📡 REST API: http://localhost:${port}/api`);
  console.log(`📖 Swagger Docs: http://localhost:${port}/api/docs`);
  console.log(`⚡ WebSocket: ws://localhost:${port}/events`);
  console.log(
    `📧 Email alerts: ${process.env.SMTP_USER ? "✅ Configured" : "⚠️ Not configured"}\n`,
  );
}
bootstrap();
=======
  });

  // Đổi cổng thành 3001 để không bị đụng hàng với Next.js (cổng 3000)
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend đang chạy tại: http://localhost:${port}`);
  console.log(`📡 API endpoint: http://localhost:${port}/api`);
}
bootstrap();
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
