const WS_URL = process.env.REACT_APP_SOCKET_URL || 'wss://chat.longapp.site';

export interface WebSocketMessage {
    action: string;
    data: {
        event: string;
        data: any;
    };
}

export interface LoginData {
    user: string;
    pass: string;
}

export interface RegisterData {
    user: string;
    pass: string;
    name?: string;
}

export interface ReconnectionConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

class WebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
    private reconnectAttempts = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isManualClose = false;

    // Reconnection configuration
    private reconnectionConfig: ReconnectionConfig = {
        maxAttempts: 5,
        initialDelay: 1000,      // Start at 1s
        maxDelay: 30000,         // Max 30s
        backoffFactor: 2         // Exponential factor
    };

    constructor(config?: Partial<ReconnectionConfig>) {
        if (config) {
            this.reconnectionConfig = { ...this.reconnectionConfig, ...config };
        }
    }

    connect(): WebSocket {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return this.ws;
        }

        this.isManualClose = false;
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
            console.log('WebSocket Connected');
            this.reconnectAttempts = 0; // Reset on successful connection
            this.triggerHandlers('open', { connected: true });
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Server message:', message);

                // Server trả về event
                if (message.event) {
                    this.triggerHandlers(message.event, message);
                } 
                // Fallback: nếu server đổi ý trả về kiểu lồng nhau
                else if (message.data && message.data.event) {
                    this.triggerHandlers(message.data.event, message.data);
                }
                
                // Trigger generic message handler
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
            console.log('WebSocket Closed:', {
                code: event.code,
                reason: event.reason || 'No reason provided',
                wasClean: event.wasClean
            });
            
            this.triggerHandlers('close', { 
                code: event.code, 
                reason: event.reason,
                wasClean: event.wasClean 
            });
            
            // Auto reconnect logic
            this.handleReconnection();
        };

        return this.ws;
    }

    private handleReconnection() {
        // Don't reconnect if manually closed or max attempts reached
        if (this.isManualClose) {
            console.log('Manual close - no reconnection');
            return;
        }

        if (this.reconnectAttempts >= this.reconnectionConfig.maxAttempts) {
            console.error(`Max reconnection attempts (${this.reconnectionConfig.maxAttempts}) reached`);
            this.triggerHandlers('reconnection_failed', { 
                attempts: this.reconnectAttempts 
            });
            return;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateReconnectDelay();
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts}/${this.reconnectionConfig.maxAttempts})`);
        
        this.triggerHandlers('reconnecting', { 
            attempt: this.reconnectAttempts,
            maxAttempts: this.reconnectionConfig.maxAttempts,
            delay 
        });

        this.reconnectTimeout = setTimeout(() => {
            console.log(`Attempting reconnection #${this.reconnectAttempts}...`);
            this.connect();
        }, delay);
    }

    private calculateReconnectDelay(): number {
        // Exponential backoff: initialDelay * (backoffFactor ^ attempts)
        // Example with initialDelay=1000, backoffFactor=2:
        // Attempt 0: 1000ms (1s)
        // Attempt 1: 2000ms (2s)
        // Attempt 2: 4000ms (4s)
        // Attempt 3: 8000ms (8s)
        // Attempt 4: 16000ms (16s)
        const { initialDelay, maxDelay, backoffFactor } = this.reconnectionConfig;
        const exponentialDelay = initialDelay * Math.pow(backoffFactor, this.reconnectAttempts);
        
        // Add jitter (randomness) to prevent thundering herd
        const jitter = Math.random() * 1000; // 0-1000ms random jitter
        
        return Math.min(exponentialDelay + jitter, maxDelay);
    }

    disconnect() {
        this.isManualClose = true;
        
        // Clear any pending reconnection
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        // Reset reconnection counter
        this.reconnectAttempts = 0;
        
        if (this.ws) {
            console.log('Manually disconnecting WebSocket...');
            this.ws.close(1000, 'Client disconnecting');
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    getConnectionState(): string {
        if (!this.ws) return 'DISCONNECTED';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }

    getReconnectionInfo() {
        return {
            attempts: this.reconnectAttempts,
            maxAttempts: this.reconnectionConfig.maxAttempts,
            isReconnecting: !!this.reconnectTimeout,
            config: this.reconnectionConfig
        };
    }

    private waitForConnection(timeout = 5000): Promise<void> {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const check = () => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for WebSocket connection'));
                } else {
                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    async send(message: WebSocketMessage): Promise<void> {
        // Nếu chưa có socket hoặc đã đóng, thử connect lại
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            console.log('Socket closed, attempting to reconnect before sending...');
            this.connect();
        }

        // Nếu đang kết nối, chờ
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            try {
                await this.waitForConnection();
            } catch (err) {
                throw new Error('WebSocket is not connected (Timeout)');
            }
        }

        return new Promise((resolve, reject) => {
            try {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify(message));
                    console.log('Sent:', message);
                    resolve();
                } else {
                    reject(new Error('WebSocket connection lost during send'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Event handlers
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

    // Auth methods
    async login(credentials: LoginData): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.off('LOGIN', handleResponse);
                reject(new Error('Login timeout - Server did not respond'));
            }, 10000);

            const handleResponse = (response: any) => {
                clearTimeout(timeoutId);
                this.off('LOGIN', handleResponse);

                if (response.status === 'success') {
                    console.log("Login Success!");
                    resolve(response.data);
                } else {
                    reject(new Error(response.mes || 'Login failed'));
                }
            };

            this.on('LOGIN', handleResponse);

            this.send({
                action: 'onchat',
                data: {
                    event: 'LOGIN',
                    data: credentials
                }
            }).catch((err) => {
                clearTimeout(timeoutId);
                this.off('LOGIN', handleResponse);
                reject(err);
            });
        });
    }

    async register(credentials: RegisterData): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.off('REGISTER', handleResponse);
                reject(new Error('Register timeout'));
            }, 10000);

            const handleResponse = (response: any) => {
                clearTimeout(timeoutId);
                this.off('REGISTER', handleResponse);
                
                if (response.status === "success") {
                    resolve(response.data)
                } else {
                    reject(new Error(response.mes || "Register failed"))
                }
            };

            this.on('REGISTER', handleResponse);

            this.send({
                action: 'onchat',
                data: {
                    event: 'REGISTER',
                    data: credentials
                }
            }).catch((err) => {
                clearTimeout(timeoutId);
                this.off('REGISTER', handleResponse);
                reject(err);
            });
        });
    }

    async logout(): Promise<void> {
        await this.send({
            action: 'onchat',
            data: {
                event: 'LOGOUT',
                data: {}
            }
        });
        this.disconnect();
    }

    // Message methods
    async sendMessage(messageData: any): Promise<void> {
        return this.send({
            action: 'onchat',
            data: {
                event: 'SEND_MESSAGE',
                data: messageData
            }
        });
    }

    // Typing indicators
    async sendTyping(conversationId: string): Promise<void> {
        return this.send({
            action: 'onchat',
            data: {
                event: 'TYPING_START',
                data: { conversationId }
            }
        });
    }

    async sendStopTyping(conversationId: string): Promise<void> {
        return this.send({
            action: 'onchat',
            data: {
                event: 'TYPING_STOP',
                data: { conversationId }
            }
        });
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;