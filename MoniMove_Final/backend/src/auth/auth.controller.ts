import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FirebaseService } from '../firebase/firebase.service';
import type { Response } from 'express';

class VerifyTokenDto {
  @ApiProperty({ description: 'Firebase ID Token nhận từ client sau khi đăng nhập', example: 'eyJhbGciOiJSUzI1NiIs...' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

/**
 * AuthController — Merged từ MoniMove_v2 + MoniMove (v3)
 *
 * v2: Swagger docs, trả về đầy đủ deviceIds trong response
 * v3: kiểm tra thiếu idToken trước (400 Bad Request)
 *
 * Merged: kết hợp cả hai — validation + đầy đủ user info
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  @ApiOperation({
    summary: 'Xác thực Firebase Token',
    description: 'Nhận Firebase ID Token từ frontend, xác thực với Firebase Admin SDK và trả về thông tin user + role',
  })
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thành công — trả về user info và role',
    schema: {
      example: {
        success: true,
        message: 'Xác thực thành công',
        user: { email: 'user@example.com', name: 'Nguyễn A', role: 'user', deviceIds: ['DEVICE_ESP32_01'] },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Thiếu idToken' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ hoặc đã hết hạn' })
  async verifyToken(@Body() body: VerifyTokenDto, @Res() res: Response) {
    try {
      const { idToken } = body;

      if (!idToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Thiếu ID Token',
        });
      }

      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const email = decodedToken.email || '';
      const name = decodedToken.name || 'Người dùng IoT';
      const avatar = decodedToken.picture || '';

      const finalRole = await this.firebaseService.getUserRole(email, name, avatar);
      const profile = await this.firebaseService.getUserProfile(email);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Xác thực thành công',
        user: {
          email,
          name: profile?.name || name,
          avatar: profile?.avatar || avatar,
          role: finalRole,
          deviceIds: profile?.deviceIds || [],
        },
      });
    } catch (error: any) {
      this.logger.error('Auth error:', error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Xác thực thất bại hoặc lỗi kết nối dữ liệu.',
      });
    }
  }
}
