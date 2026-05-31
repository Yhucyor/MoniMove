import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
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
}
