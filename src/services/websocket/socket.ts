import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(token?: string): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        const options: any = {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: this.maxReconnectAttempts,
        };

        if (token) {
            options.auth = { token };
            options.query = { token };
        }

        this.socket = io(SOCKET_URL, options);

        this.setupEventListeners();

        return this.socket;
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.disconnect();
            }
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Auth events
    emit(event: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            this.socket.emit(event, data, (response: any) => {
                if (response?.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }

    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (data: any) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    // Auth methods
    async login(credentials: { email: string; password: string }) {
        return this.emit('auth:login', credentials);
    }

    async register(userData: { 
        username: string; 
        email: string; 
        password: string; 
        displayName?: string 
    }) {
        return this.emit('auth:register', userData);
    }

    async logout() {
        return this.emit('auth:logout');
    }

    async getCurrentUser() {
        return this.emit('auth:me');
    }

    // Chat events
    sendMessage(messageData: any) {
        return this.emit('message:send', messageData);
    }

    onMessageReceived(callback: (message: any) => void) {
        this.on('message:received', callback);
    }

    offMessageReceived(callback?: (message: any) => void) {
        this.off('message:received', callback);
    }

    // Typing events
    sendTyping(conversationId: string) {
        this.emit('typing:start', { conversationId });
    }

    sendStopTyping(conversationId: string) {
        this.emit('typing:stop', { conversationId });
    }

    onTyping(callback: (data: any) => void) {
        this.on('typing:start', callback);
    }

    onStopTyping(callback: (data: any) => void) {
        this.on('typing:stop', callback);
    }

    // User status events
    onUserOnline(callback: (data: any) => void) {
        this.on('user:online', callback);
    }

    onUserOffline(callback: (data: any) => void) {
        this.on('user:offline', callback);
    }

    // Conversation events
    onConversationCreated(callback: (data: any) => void) {
        this.on('conversation:created', callback);
    }

    onConversationUpdated(callback: (data: any) => void) {
        this.on('conversation:updated', callback);
    }
}

export default new SocketService();