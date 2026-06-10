import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Không tìm thấy token xác thực hoặc sai định dạng');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      request.user = decodedToken; // Lưu thông tin user để các controller sử dụng nếu cần
      return true;
    } catch (error) {
      this.logger.error(`Xác thực token thất bại: ${error.message || error}`);
      throw new UnauthorizedException('Token xác thực không hợp lệ hoặc đã hết hạn');
    }
  }
}
