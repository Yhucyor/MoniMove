import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { AuthUser } from "../common/types/auth-user.interface";

/**
 * FirebaseAuthGuard — Merged từ v2 + v3
 *
 * v2: Đầy đủ — lấy AuthUser với role + deviceIds từ Firestore profile
 * v3: Đơn giản — chỉ lưu decodedToken thô
 *
 * Merged: dùng logic v2 (đầy đủ thông tin user)
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Không tìm thấy token xác thực hoặc sai định dạng",
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const email = decodedToken.email || "";
      const profile = await this.firebaseService.getUserProfile(email);

      const authUser: AuthUser = {
        uid: decodedToken.uid,
        email,
        name: profile?.name || decodedToken.name || "Người dùng IoT",
        avatar: profile?.avatar || decodedToken.picture || "",
        role: (profile?.role as AuthUser["role"]) || "user",
        deviceIds: profile?.deviceIds || [],
      };

      request.user = authUser;
      return true;
    } catch (error) {
      this.logger.error(
        `Xác thực token thất bại: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
    }
  }
}
