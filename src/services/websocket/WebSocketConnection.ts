export interface ReconnectionConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

export class WebSocketConnection {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isManualClose = false;
    private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();

    private config: ReconnectionConfig = {
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffFactor: 2
    };

    constructor(
        private url: string,
        config?: Partial<ReconnectionConfig>
    ) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }

    // ===== KẾT NỐI =====
    connect(): WebSocket {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket đã kết nối');
            return this.ws;
        }

        this.isManualClose = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('WebSocket Connected');
            this.reconnectAttempts = 0;
            this.triggerHandlers('open', { connected: true });
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Received:', message);

                if (message.event) {
                    this.triggerHandlers(message.event, message);
                }

                this.triggerHandlers('message', message);
            } catch (error) {
                console.error('Parse error:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.triggerHandlers('error', error);
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket Closed:', event.code);
            this.triggerHandlers('close', {
                code: event.code,
                reason: event.reason
            });
            this.handleReconnection();
        };

        return this.ws;
    }

    disconnect() {
        this.isManualClose = true;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.reconnectAttempts = 0;

        if (this.ws) {
            this.ws.close(1000, 'Client disconnecting');
            this.ws = null;
        }
    }

    // ===== GỬI MESSAGE =====
    async send(data: any): Promise<void> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            await this.waitForConnection();
        }

        return new Promise((resolve, reject) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(data));
                resolve();
            } else {
                reject(new Error('WebSocket not connected'));
            }
        });
    }

    // ===== EVENT HANDLERS =====
    on(event: string, handler: (data: any) => void) {
        if (!this.messageHandlers.has(event)) {
            this.messageHandlers.set(event, new Set());
        }
        this.messageHandlers.get(event)?.add(handler);
    }

    off(event: string, handler?: (data: any) => void) {
        if (handler) {
            this.messageHandlers.get(event)?.delete(handler);
        } else {
            this.messageHandlers.delete(event);
        }
    }

    private triggerHandlers(event: string, data: any) {
        this.messageHandlers.get(event)?.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in handler for ${event}:`, error);
            }
        });
    }

    // ===== RECONNECTION LOGIC =====
    private handleReconnection() {
        if (this.isManualClose) return;

        if (this.reconnectAttempts >= this.config.maxAttempts) {
            console.error('Max reconnection attempts reached');
            this.triggerHandlers('reconnection_failed', {
                attempts: this.reconnectAttempts
            });
            return;
        }

        const delay = this.calculateReconnectDelay();
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms...`);

        this.triggerHandlers('reconnecting', {
            attempt: this.reconnectAttempts,
            delay
        });

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    private calculateReconnectDelay(): number {
        const { initialDelay, maxDelay, backoffFactor } = this.config;
        const exponentialDelay = initialDelay * Math.pow(backoffFactor, this.reconnectAttempts);
        const jitter = Math.random() * 1000;
        return Math.min(exponentialDelay + jitter, maxDelay);
    }

    private waitForConnection(timeout = 5000): Promise<void> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const check = () => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Connection timeout'));
                } else {
                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    // ===== GETTERS =====
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    getState(): string {
        if (!this.ws) return 'DISCONNECTED';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }
}