<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { FirebaseModule } from "../firebase/firebase.module";
=======
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../firebase/firebase.module';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a

@Module({
  imports: [FirebaseModule],
  controllers: [AuthController],
})
export class AuthModule {}
