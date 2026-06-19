export type ConnectionStatus = 'online' | 'offline' | 'unknown';
export declare const OFFLINE_THRESHOLD_MS: number;
export declare function computeConnectionStatus(lastPingSeconds?: number, lastUpdateMs?: number, rawStatus?: string): ConnectionStatus;
