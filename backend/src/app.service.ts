import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "MoveMonitor Backend is running!";
  }
}
