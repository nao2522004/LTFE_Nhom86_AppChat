// ===== CONNECTION STATE TYPES =====
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'connecting';

export interface ConnectionState {
    status: ConnectionStatus;
    error: string | null;
    reconnectAttempts: number;
    lastConnected: Date | null;
}
