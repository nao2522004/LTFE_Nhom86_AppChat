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

class WebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isManualClose = false;

    connect(): WebSocket {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return this.ws;
        }

        this.isManualClose = false;
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
            console.log('WebSocket Connected');
            this.reconnectAttempts = 0;
            this.triggerHandlers('open', { connected: true });
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Server message:', message);

                // Server trả về event
                if (message.event) {
                    // Truyền toàn bộ message vào handler để lát nữa check "status"
                    this.triggerHandlers(message.event, message);
                } 
                
                // Fallback: nếu server đổi ý trả về kiểu lồng nhau (message.data.event)
                else if (message.data && message.data.event) {
                    this.triggerHandlers(message.data.event, message.data);
                }
                
            } catch (error) {
                console.error('Parse error:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.triggerHandlers('error', error);
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket Closed:', event.code, event.reason);
            this.triggerHandlers('close', { code: event.code, reason: event.reason });
            
            // Auto reconnect if not manual close
            if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
                console.log(`Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
                
                this.reconnectTimeout = setTimeout(() => {
                    this.connect();
                }, delay);
            }
        };

        return this.ws;
    }

    disconnect() {
        this.isManualClose = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
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

        // Nếu đang kết nối (CONNECTING) hoặc vừa gọi connect lại, thì chờ
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            try {
                await this.waitForConnection();
            } catch (err) {
                throw new Error('WebSocket is not connected (Timeout)');
            }
        }

        // Logic gửi như cũ (lúc này chắc chắn đã OPEN)
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
            // Setup Timeout
            const timeoutId = setTimeout(() => {
                this.off('LOGIN', handleResponse); // Hủy lắng nghe nếu timeout
                reject(new Error('Login timeout - Server did not respond'));
            }, 10000);

            // Hàm xử lý phản hồi chung
            const handleResponse = (response: any) => {
                // Server trả về: { event: "LOGIN", status: "success", data: {...} }
                
                // Xóa timeout và listener ngay khi nhận phản hồi
                clearTimeout(timeoutId);
                this.off('LOGIN', handleResponse);

                // Kiểm tra status để quyết định thành công hay thất bại
                if (response.status === 'success') {
                    console.log("Login Success logic trigger!");
                    resolve(response.data);
                } else {
                    // Trường hợp status = "error" hoặc khác
                    reject(new Error(response.message || 'Login failed with unknown error'));
                }
            };

            // Lắng nghe sự kiện "LOGIN"
            this.on('LOGIN', handleResponse);

            // Gửi request
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

    async register(userData: RegisterData): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.off('REGISTER_SUCCESS', handleSuccess);
                this.off('REGISTER_ERROR', handleError);
                reject(new Error('Register timeout'));
            }, 10000);

            const handleSuccess = (data: any) => {
                clearTimeout(timeoutId);
                this.off('REGISTER_SUCCESS', handleSuccess);
                this.off('REGISTER_ERROR', handleError);
                resolve({ success: true, ...data });
            };

            const handleError = (data: any) => {
                clearTimeout(timeoutId);
                this.off('REGISTER_SUCCESS', handleSuccess);
                this.off('REGISTER_ERROR', handleError);
                reject(new Error(data.message || 'Register failed'));
            };

            this.on('REGISTER_SUCCESS', handleSuccess);
            this.on('REGISTER_ERROR', handleError);

            this.send({
                action: 'onchat',
                data: {
                    event: 'REGISTER',
                    data: userData
                }
            }).catch(reject);
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

export default new WebSocketService();