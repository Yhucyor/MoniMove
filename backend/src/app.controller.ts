import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RealtimeGateway } from "./realtime/realtime.gateway";

@ApiTags("system")
@Controller()
export class AppController {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  @Get()
  @ApiOperation({
    summary: "Health check",
    description: "Kiểm tra backend đang chạy",
  })
  @ApiResponse({ status: 200, description: "Backend OK" })
  getHealth() {
    return {
      status: "ok",
      service: "MoveMonitor Backend",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get("health")
  @ApiOperation({ summary: "Detailed health + realtime stats" })
  getDetailedHealth() {
    return {
      status: "ok",
      service: "MoveMonitor Backend",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        heapUsed:
          Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        heapTotal:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
      websocket: {
        connectedClients: this.realtimeGateway.getConnectedCount(),
        namespace: "/events",
      },
      features: [
        "REST API",
        "WebSocket Realtime",
        "Firebase RTDB",
        "Firestore Auth",
        "Swagger Docs",
        "Email Alerts (SMTP)",
        "Device Settings",
        "Role-based Access Control",
      ],
    };
  }
}
