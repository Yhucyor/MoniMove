import { Controller, Get, Param, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get(':deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }
    return device;
  }

  @Get(':deviceId/position')
  async getLatestPosition(@Param('deviceId') deviceId: string) {
    // Verify device exists first
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }
    return this.devicesService.getLatestPosition(deviceId);
  }

  @Get(':deviceId/route')
  async getRoute(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.getDevice(deviceId);
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }
    return this.devicesService.getRoute(deviceId);
  }

  @Get(':deviceId/history')
  async getHistory(
    @Param('deviceId') deviceId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    if (!start || !end) {
      throw new BadRequestException('Query parameters "start" and "end" are required');
    }

    const device = await this.devicesService.getDevice(deviceId);
    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    const startTime = Number(start);
    const endTime = Number(end);
    if (isNaN(startTime) || isNaN(endTime)) {
      throw new BadRequestException('"start" and "end" must be valid numbers');
    }

    return this.devicesService.getHistory(deviceId, startTime, endTime);
  }
}
