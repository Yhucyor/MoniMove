import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { DevicesService } from "./devices.service";
import { FirebaseAuthGuard } from "../firebase/firebase-auth.guard";
import { FirebaseService } from "../firebase/firebase.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthUser } from "../common/types/auth-user.interface";

/**
 * DevicesController — Merged từ MoveMonitor_v2 + MoveMonitor (v3)
 *
 * v2: Swagger docs, RBAC (canAccessDevice), GET /devices (list all), assertDeviceAccess helper
 * v3: cơ bản — chỉ có GET :deviceId, position, route, history
 *
 * Merged: giữ toàn bộ v2 (đầy đủ nhất)
 */
@ApiTags("devices")
@ApiBearerAuth("firebase-token")
@Controller("devices")
@UseGuards(FirebaseAuthGuard)
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly firebaseService: FirebaseService,
  ) {}

  private assertDeviceAccess(user: AuthUser, deviceId: string) {
    if (!this.firebaseService.canAccessDevice(user, deviceId)) {
      throw new ForbiddenException(
        `Bạn không có quyền truy cập thiết bị ${deviceId}`,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: "Danh sách thiết bị",
    description: "Admin thấy tất cả, User thấy thiết bị được cấp quyền",
  })
  @ApiResponse({ status: 200, description: "Danh sách thiết bị IoT" })
  async listDevices(@CurrentUser() user: AuthUser) {
    const allDevices = await this.devicesService.listAllDevices();
    if (user.role === "admin") return allDevices;
    return allDevices.filter((d) => user.deviceIds.includes(d.id));
  }

  @Get(":deviceId")
  @ApiOperation({
    summary: "Chi tiết thiết bị",
    description: "Bao gồm GPS, IMU, battery, trạng thái kết nối",
  })
  @ApiParam({ name: "deviceId", example: "DEVICE_ESP32_01" })
  @ApiResponse({ status: 200, description: "Thông tin đầy đủ của thiết bị" })
  @ApiResponse({ status: 404, description: "Không tìm thấy thiết bị" })
  async getDevice(
    @Param("deviceId") deviceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.assertDeviceAccess(user, deviceId);
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) throw new NotFoundException(`Device ${deviceId} not found`);
    return device;
  }

  @Get(":deviceId/position")
  @ApiOperation({
    summary: "Vị trí GPS hiện tại",
    description: "Tọa độ mới nhất của thiết bị",
  })
  @ApiParam({ name: "deviceId", example: "DEVICE_ESP32_01" })
  async getLatestPosition(
    @Param("deviceId") deviceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.assertDeviceAccess(user, deviceId);
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) throw new NotFoundException(`Device ${deviceId} not found`);
    return this.devicesService.getLatestPosition(deviceId);
  }

  @Get(":deviceId/route")
  @ApiOperation({
    summary: "Lộ trình di chuyển",
    description: "Tập hợp các waypoints từ lịch sử GPS",
  })
  @ApiParam({ name: "deviceId", example: "DEVICE_ESP32_01" })
  async getRoute(
    @Param("deviceId") deviceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.assertDeviceAccess(user, deviceId);
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) throw new NotFoundException(`Device ${deviceId} not found`);
    return this.devicesService.getRoute(deviceId);
  }

  @Get(":deviceId/history")
  @ApiOperation({
    summary: "Lịch sử GPS",
    description: "Trả về các điểm GPS trong khoảng thời gian",
  })
  @ApiParam({ name: "deviceId", example: "DEVICE_ESP32_01" })
  @ApiQuery({
    name: "start",
    description: "Unix timestamp ms (bắt đầu)",
    example: 1718000000000,
  })
  @ApiQuery({
    name: "end",
    description: "Unix timestamp ms (kết thúc)",
    example: 1718086400000,
  })
  async getHistory(
    @Param("deviceId") deviceId: string,
    @Query("start") start?: string,
    @Query("end") end?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    if (!start || !end)
      throw new BadRequestException('"start" và "end" là bắt buộc');

    this.assertDeviceAccess(user!, deviceId);
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) throw new NotFoundException(`Device ${deviceId} not found`);

    const startTime = Number(start);
    const endTime = Number(end);
    if (isNaN(startTime) || isNaN(endTime))
      throw new BadRequestException('"start" và "end" phải là số');

    return this.devicesService.getHistory(deviceId, startTime, endTime);
  }
}
