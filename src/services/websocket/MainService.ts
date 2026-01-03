import { WebSocketConnection } from './WebSocketConnection';
import { AuthService } from './AuthService';
import { ChatService } from './ChatService';
import { UserService } from './UserService';

const WS_URL = process.env.REACT_APP_SOCKET_URL || 'wss://chat.longapp.site/chat/chat';

// Tạo socket duy nhất
const connection = new WebSocketConnection(WS_URL, {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2
});

// Tạo các service dùng chung socket
const authService = new AuthService(connection);
const chatService = new ChatService(connection);
const userService = new UserService(connection);

/**
 * WebSocketService Facade
 * * @description
 * Điểm truy cập duy nhất (Single Point of Entry) cho toàn bộ giao thức truyền thông Real-time.
 * * TRÁCH NHIỆM:
 * 1. Cung cấp các phương thức GỬI YÊU CẦU (Request) tới server (Login, Chat, User...).
 * 2. Quản lý trạng thái kết nối thông qua WebSocketConnection.
 * 3. Tập hợp các service chuyên biệt (Auth, Chat, User) để dễ quản lý.
 */

// ===== WEBSOCKET SERVICE FACADE =====
class WebSocketService {
    // Connection methods
    send = (data: any) => connection.send(data);
    connect = () => connection.connect();
    disconnect = () => connection.disconnect();
    isConnected = () => connection.isConnected();
    getState = () => connection.getState();
    on = (event: string, handler: (data: any) => void) => connection.on(event, handler);
    off = (event: string, handler?: (data: any) => void) => connection.off(event, handler);

    // Auth methods
    login = (data: any) => authService.login(data);
    reLogin = (data: any) => authService.reLogin(data);
    register = (data: any) => authService.register(data);
    logout = () => authService.logout();

    // Chat methods
    sendChat = (data: any) => chatService.sendChat(data);
    getRoomMessages = (data: any) => chatService.getRoomMessages(data);
    getPeopleMessages = (data: any) => chatService.getPeopleMessages(data);
    createRoom = (data: any) => chatService.createRoom(data);
    joinRoom = (data: any) => chatService.joinRoom(data);
    onChatReceived = (callback: any) => chatService.onChatReceived(callback);
    offChatReceived = (callback?: any) => chatService.offChatReceived(callback);

    // User methods
    checkUser = (data: any) => userService.checkUser(data);
    getUserList = () => userService.getUserList();
}

const websocketService = new WebSocketService();
export default websocketService;

// Export types
export * from './WebSocketConnection';
export * from './AuthService';
export * from './ChatService';
export * from './UserService';