<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseAuthGuard } from "./firebase-auth.guard";

@Module({
  providers: [FirebaseService, FirebaseAuthGuard],
  exports: [FirebaseService, FirebaseAuthGuard],
=======
import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
})
export class FirebaseModule {}
