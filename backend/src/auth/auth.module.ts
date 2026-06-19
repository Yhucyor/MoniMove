import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  controllers: [AuthController],
})
export class AuthModule {}
