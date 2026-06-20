<<<<<<< HEAD
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ForbiddenException,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { AlertsService } from "./alerts.service";
import { MailService } from "../mail/mail.service";
import { FirebaseAuthGuard } from "../firebase/firebase-auth.guard";
import { FirebaseService } from "../firebase/firebase.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateAlertDto } from "../common/dto/create-alert.dto";
import type { AuthUser } from "../common/types/auth-user.interface";

/**
 * AlertsController — Merged từ MoveMonitor_v2 + MoveMonitor (v3)
 *
 * v2: Swagger docs, RBAC (canAccessDevice), WebSocket push, inferSeverity
 * v3: POST /test-email endpoint để test SMTP
 *
 * Merged: kết hợp đầy đủ tất cả chức năng
 */
@ApiTags("alerts")
@ApiBearerAuth("firebase-token")
@Controller("alerts")
@UseGuards(FirebaseAuthGuard)
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly mailService: MailService,
    private readonly firebaseService: FirebaseService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Tạo cảnh báo mới",
    description:
      "Lưu alert vào Firebase RTDB, push realtime qua WebSocket và gửi email SOS nếu khẩn cấp",
  })
  @ApiBody({ type: CreateAlertDto })
  @ApiResponse({ status: 201, description: "Alert tạo thành công" })
  @ApiResponse({
    status: 403,
    description: "Không có quyền truy cập thiết bị này",
  })
  async createAlert(
    @Body() body: CreateAlertDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!this.firebaseService.canAccessDevice(user, body.deviceId)) {
      throw new ForbiddenException(
        `Bạn không có quyền gửi cảnh báo cho thiết bị ${body.deviceId}`,
      );
    }

    const result = await this.alertsService.createAlert(body);

    // Push realtime via WebSocket ngay lập tức
    this.realtimeGateway.pushAlert({
      id: result.alertId || `alert_${Date.now()}`,
      deviceId: body.deviceId,
      alertType: body.alertType,
      severity: body.severity || this.inferSeverity(body.alertType),
      message: body.message,
      timestamp: body.timestamp || Date.now(),
      location: body.location,
    });

    return result;
  }

  @Get()
  @ApiOperation({
    summary: "Lấy danh sách cảnh báo",
    description: "Admin thấy tất cả, User chỉ thấy thiết bị được cấp quyền",
  })
  @ApiQuery({
    name: "deviceId",
    required: false,
    description: "Lọc theo thiết bị cụ thể",
  })
  @ApiResponse({ status: 200, description: "Danh sách alerts" })
  async getAlerts(
    @Query("deviceId") deviceId: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    if (deviceId) {
      if (!this.firebaseService.canAccessDevice(user, deviceId)) {
        throw new ForbiddenException(
          `Bạn không có quyền xem cảnh báo của thiết bị ${deviceId}`,
        );
      }
      return this.alertsService.getAlerts(deviceId);
    }

    const alerts = await this.alertsService.getAlerts();
    if (user.role === "admin") return alerts;
    return alerts.filter((a) => user.deviceIds.includes(a.deviceId));
  }

  /**
   * POST /api/alerts/test-email
   * Không cần auth — dùng để verify SMTP từ terminal hoặc frontend
   * Body: { toEmail?: string }
   */
  @Post("test-email")
  @ApiOperation({
    summary: "Test SMTP email",
    description:
      "Gửi email kiểm tra — không cần auth. Body: { toEmail?: string }",
  })
  async testEmail(@Body() body: { toEmail?: string }) {
    const target = body.toEmail || process.env.SMTP_USER || "";
    if (!target || !target.includes("@")) {
      throw new BadRequestException("toEmail phải là địa chỉ email hợp lệ");
    }
    await this.mailService.sendEmergencyEmail(target, {
      alertType: "Kiểm tra hệ thống",
      message:
        "🧪 Email kiểm tra từ MoveMonitor. Nếu nhận được email này, SMTP đang hoạt động bình thường! ✅",
      deviceId: "TEST",
      timestamp: Date.now(),
    });
    return { success: true, message: `✅ Email kiểm tra đã gửi tới ${target}` };
  }

  private inferSeverity(alertType: string): "critical" | "warning" | "info" {
    const lower = (alertType || "").toLowerCase();
    if (
      lower.includes("ngã") ||
      lower.includes("va chạm") ||
      lower.includes("tilt") ||
      lower.includes("crash")
    )
      return "critical";
    if (
      lower.includes("cảnh báo") ||
      lower.includes("pin") ||
      lower.includes("tốc độ")
    )
      return "warning";
    return "info";
=======
import { Controller, Post, Get, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';

@Controller('alerts')
@UseGuards(FirebaseAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  async createAlert(
    @Body() body: {
      deviceId: string;
      alertType: string;
      message: string;
      timestamp?: number;
    },
  ) {
    if (!body.deviceId || !body.alertType || !body.message) {
      throw new BadRequestException('deviceId, alertType, and message are required fields');
    }
    return this.alertsService.createAlert(body);
  }

  @Get()
  async getAlerts(@Query('deviceId') deviceId?: string) {
    return this.alertsService.getAlerts(deviceId);
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
  }
}
