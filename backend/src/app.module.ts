import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { DevicesModule } from './devices/devices.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FirebaseModule, DevicesModule, AlertsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
