import { Module } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { RtdbListenerService } from "./rtdb-listener.service";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [MailModule],
  providers: [RealtimeGateway, RtdbListenerService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
