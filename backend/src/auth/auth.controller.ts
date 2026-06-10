import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  async verifyToken(@Body() body: { idToken: string }, @Res() res: Response) {
    try {
      const { idToken } = body;

      if (!idToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu ID Token',
        });
      }

      // 1. Xác thực ID Token gửi từ Frontend bằng Firebase Admin SDK
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      
      const email = decodedToken.email || '';
      const name = decodedToken.name || 'Người dùng IoT';
      const avatar = decodedToken.picture || '';

      // 2. Lấy hoặc tạo tài khoản và quyền hạn (Role) thực tế từ Firestore
      const finalRole = await this.firebaseService.getUserRole(email, name, avatar);

      // 3. Trả kết quả về cho Frontend
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Xác thực thành công',
        user: {
          email: email,
          name: name,
          avatar: avatar,
          role: finalRole,
        },
      });
    } catch (error: any) {
      this.logger.error('Lỗi xử lý xác thực & Database:', error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Xác thực thất bại hoặc lỗi kết nối dữ liệu.',
      });
    }
  }
}
