import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RtdbListenerService } from './rtdb-listener.service';

@Module({
  providers: [RealtimeGateway, RtdbListenerService],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
