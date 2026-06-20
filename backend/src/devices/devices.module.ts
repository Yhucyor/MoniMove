<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { DevicesController } from "./devices.controller";
import { DevicesService } from "./devices.service";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  controllers: [DevicesController],
  providers: [DevicesService],
=======
import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
})
export class DevicesModule {}
