"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    const frontendUrl = process.env.FRONTEND_URL;
    const origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ];
    if (frontendUrl)
        origins.push(frontendUrl.replace(/\/$/, ""));
    app.enableCors({
        origin: origins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("MoveMonitor API")
        .setDescription("Hệ thống IoT giám sát hành trình, phát hiện va chạm và cảnh báo thời gian thực.\n\n" +
        "**Authentication:** Sử dụng Firebase ID Token trong header `Authorization: Bearer <token>`")
        .setVersion("2.0.0")
        .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Firebase ID Token",
    }, "firebase-token")
        .addTag("auth", "Xác thực Firebase và quản lý phiên đăng nhập")
        .addTag("devices", "Quản lý và giám sát thiết bị IoT")
        .addTag("alerts", "Nhật ký cảnh báo và sự cố")
        .addTag("users", "Quản lý người dùng và phân quyền")
        .addTag("settings", "Cài đặt thiết bị (ngưỡng cảnh báo, SOS email...)")
        .addTag("realtime", "WebSocket events realtime")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "list",
            filter: true,
            tagsSorter: "alpha",
        },
        customSiteTitle: "MoveMonitor API Docs",
    });
    const port = process.env.PORT ?? 3001;
    await app.listen(port, "0.0.0.0");
    console.log(`\n🚀 MoveMonitor Backend running at: http://localhost:${port}`);
    console.log(`📡 REST API: http://localhost:${port}/api`);
    console.log(`📖 Swagger Docs: http://localhost:${port}/api/docs`);
    console.log(`⚡ WebSocket: ws://localhost:${port}/events`);
    console.log(`📧 Email alerts: ${process.env.SMTP_USER ? "✅ Configured" : "⚠️ Not configured"}\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map