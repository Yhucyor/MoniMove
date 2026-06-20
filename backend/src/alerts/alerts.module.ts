<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";
import { FirebaseModule } from "../firebase/firebase.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [FirebaseModule, RealtimeModule, MailModule],
  controllers: [AlertsController],
  providers: [AlertsService],
=======
import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
})
export class AlertsModule {}
