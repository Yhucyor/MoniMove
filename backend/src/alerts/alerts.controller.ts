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
  }
}
