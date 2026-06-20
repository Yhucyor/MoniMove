<<<<<<< HEAD
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { FirebaseService } from "../firebase/firebase.service";
import type { Response } from "express";

class VerifyTokenDto {
  @ApiProperty({
    description: "Firebase ID Token nhận từ client sau khi đăng nhập",
    example: "eyJhbGciOiJSUzI1NiIs...",
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

/**
 * AuthController — Merged từ MoveMonitor_v2 + MoveMonitor (v3)
 *
 * v2: Swagger docs, trả về đầy đủ deviceIds trong response
 * v3: kiểm tra thiếu idToken trước (400 Bad Request)
 *
 * Merged: kết hợp cả hai — validation + đầy đủ user info
 */
@ApiTags("auth")
@Controller("auth")
=======
import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import type { Response } from 'express';

@Controller('auth')
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
<<<<<<< HEAD
  @ApiOperation({
    summary: "Xác thực Firebase Token",
    description:
      "Nhận Firebase ID Token từ frontend, xác thực với Firebase Admin SDK và trả về thông tin user + role",
  })
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({
    status: 200,
    description: "Xác thực thành công — trả về user info và role",
    schema: {
      example: {
        success: true,
        message: "Xác thực thành công",
        user: {
          email: "user@example.com",
          name: "Nguyễn A",
          role: "user",
          deviceIds: ["DEVICE_ESP32_01"],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Thiếu idToken" })
  @ApiResponse({
    status: 401,
    description: "Token không hợp lệ hoặc đã hết hạn",
  })
  async verifyToken(@Body() body: VerifyTokenDto, @Res() res: Response) {
=======
  async verifyToken(@Body() body: { idToken: string }, @Res() res: Response) {
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    try {
      const { idToken } = body;

      if (!idToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
<<<<<<< HEAD
          message: "Thiếu ID Token",
        });
      }

      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const email = decodedToken.email || "";
      const name = decodedToken.name || "Người dùng IoT";
      const avatar = decodedToken.picture || "";

      const finalRole = await this.firebaseService.getUserRole(
        email,
        name,
        avatar,
      );
      const profile = await this.firebaseService.getUserProfile(email);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Xác thực thành công",
        user: {
          email,
          name: profile?.name || name,
          avatar: profile?.avatar || avatar,
          role: finalRole,
          deviceIds: profile?.deviceIds || [],
        },
      });
    } catch (error: any) {
      this.logger.error("Auth error:", error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Xác thực thất bại hoặc lỗi kết nối dữ liệu.",
=======
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
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      });
    }
  }
}
