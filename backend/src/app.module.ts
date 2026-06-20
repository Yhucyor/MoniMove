<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FirebaseModule } from "./firebase/firebase.module";
import { DevicesModule } from "./devices/devices.module";
import { AlertsModule } from "./alerts/alerts.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SeedModule } from "./seed/seed.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { MailModule } from "./mail/mail.module";
import { SettingsModule } from "./settings/settings.module";

/**
 * AppModule — Root module của MoveMonitor Backend (Merged v2 + v3)
 *
 * Modules:
 *  - FirebaseModule   : Firebase Admin SDK, Firestore, Auth Guard
 *  - DevicesModule    : Quản lý thiết bị IoT (GPS, IMU, history)
 *  - AlertsModule     : Cảnh báo sự cố (ngã đổ, va chạm, pin thấp...)
 *  - AuthModule       : Xác thực Firebase ID Token
 *  - UsersModule      : Quản lý người dùng & phân quyền (admin only)
 *  - SeedModule       : Tự động tạo tài khoản test khi khởi động
 *  - RealtimeModule   : WebSocket Gateway + RTDB poller
 *  - MailModule       : Gửi email khẩn cấp qua SMTP (từ v3)
 *  - SettingsModule   : Cài đặt thiết bị per-device (từ v3)
 */
@Module({
  imports: [
    FirebaseModule,
    MailModule,
    DevicesModule,
    AlertsModule,
    AuthModule,
    UsersModule,
    SeedModule,
    RealtimeModule,
    SettingsModule,
  ],
=======
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { DevicesModule } from './devices/devices.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FirebaseModule, DevicesModule, AlertsModule, AuthModule],
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
