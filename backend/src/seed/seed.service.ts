import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

/**
 * SeedService — đã xóa test accounts
 * Không còn tạo tài khoản giả khi khởi động
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  async onModuleInit() {
    this.logger.log("SeedService: no seed data configured.");
  }
}
