export type ConnectionStatus = "online" | "offline" | "unknown";
export declare function computeConnectionStatus(lastPingSeconds?: number, lastUpdateMs?: number, rawStatus?: string, gpsUpdatedAtSeconds?: number): ConnectionStatus;
