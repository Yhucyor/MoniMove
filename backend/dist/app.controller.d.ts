import { RealtimeGateway } from "./realtime/realtime.gateway";
export declare class AppController {
    private readonly realtimeGateway;
    constructor(realtimeGateway: RealtimeGateway);
    getHealth(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
        uptime: number;
    };
    getDetailedHealth(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
        uptime: number;
        memory: {
            heapUsed: string;
            heapTotal: string;
        };
        websocket: {
            connectedClients: number;
            namespace: string;
        };
        features: string[];
    };
}
