import { Module } from "@nestjs/common";
import { SeedService } from "./seed.service";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  providers: [SeedService],
})
export class SeedModule {}
