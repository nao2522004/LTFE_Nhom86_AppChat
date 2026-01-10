/**
 * WebSocketConnection - Lớp hạ tầng quản lý kết nối WebSocket và phân phối responses.
 *
 * @description
 * Chịu trách nhiệm duy trì kết nối và định tuyến responses từ server:
 *
 * 1. **Auto-Reconnect**:
 *    - Tự động kết nối lại khi mất kết nối (trừ khi disconnect thủ công)
 *    - Thuật toán: Exponential Backoff + Jitter
 *    - Tối đa 5 lần thử, delay từ 1s → 30s
 *
 * 2. **Response Dispatcher (Event Bus)**:
 *    - Nhận TẤT CẢ responses từ server qua `ws.onmessage`
 *    - Phân loại theo `event` field trong response
 *    - Trigger handlers tương ứng thông qua Pub/Sub pattern:
 *      - Request-Response handlers: Đăng ký bởi `sendAndWaitForResponse()`
 *      - Broadcast handlers: Đăng ký bởi `useWebSocketSetup`
 *
 * 3. **Connection Safety**:
 *    - Quản lý readyState (CONNECTING, OPEN, CLOSING, CLOSED)
 *    - Đợi kết nối OPEN trước khi gửi data (tránh mất message)
 *    - Queue messages khi đang reconnecting (optional future enhancement)
 *
 * @note
 * - Lớp này KHÔNG biết về business logic (Chat, Auth, User...)
 * - Lớp này CHỈ quan tâm: Kết nối có sống không? Responses được gửi đúng chỗ chưa?
 *
 */

export interface ReconnectionConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

export class SocketConnection {
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
            // console.log('%c[WebSocket] Already connected, triggering open event',
            //     'background: #2ecc71; color: white; padding: 2px 6px; border-radius: 3px;'
            // );

            // Trigger open handler asynchronously
            setTimeout(() => {
                this.triggerHandlers('open', {
                    connected: true,
                    alreadyConnected: true
                });
            }, 0);

            return this.ws;
        }

        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            // console.log('%c[WebSocket] Already connecting, waiting...',
            //     'background: #3498db; color: white; padding: 2px 6px; border-radius: 3px;'
            // );
            return this.ws;
        }

        console.log('%c[WebSocket] Creating new socket...',
            'background: #9b59b6; color: white; padding: 2px 6px; border-radius: 3px;'
        );

        this.isManualClose = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('%c[WebSocket] onopen fired',
                'background: #27ae60; color: white; padding: 2px 6px; border-radius: 3px;'
            );
            this.reconnectAttempts = 0;
            this.triggerHandlers('open', {
                connected: true,
                timestamp: new Date().toISOString()
            });
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('%c[WebSocket] Message received',
                    'background: #34495e; color: white; padding: 2px 6px; border-radius: 3px;',
                    {
                        event: message.event,
                        status: message.status,
                        fullMessage: message,
                        timestamp: new Date().toISOString()
                    }
                );

                if (message.event) {
                    this.triggerHandlers(message.event, message);
                }

                this.triggerHandlers('message', message);
            } catch (error) {
                console.error('[WebSocket] Parse error:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('%c[WebSocket] Error',
                'background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px;',
                error
            );
            this.triggerHandlers('error', error);
        };

        this.ws.onclose = (event) => {
            console.log('%c[WebSocket] Closed',
                'background: #95a5a6; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                }
            );

            this.triggerHandlers('close', {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean
            });

            this.handleReconnection();
        };

        return this.ws;
    }

    disconnect() {
        console.log('%c[WebSocket] Manual disconnect',
            'background: #e67e22; color: white; padding: 2px 6px; border-radius: 3px;'
        );

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
                console.log('%c[SEND] WebSocket Message',
                    'background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold',
                    {
                        event: data.data?.event,
                        payload: data.data?.data,
                        fullMessage: data,
                        timestamp: new Date().toISOString()
                    }
                );
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

    waitForConnection(timeout = 5000): Promise<void> {
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