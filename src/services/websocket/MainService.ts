import { SocketConnection } from './SocketConnection';
import { AuthService } from './AuthService';
import { ChatService } from './ChatService';
import { UserService } from './UserService';

const WS_URL = process.env.REACT_APP_SOCKET_URL || 'wss://chat.longapp.site/chat/chat';

// Tạo socket duy nhất
const connection = new SocketConnection(WS_URL, {
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
 *
 * @description
 * Điểm truy cập duy nhất (Single Point of Entry) cho toàn bộ giao thức truyền thông Real-time WebSocket.
 *
 * @responsibilities
 * 1. **Gửi Request**: Cung cấp các phương thức gửi yêu cầu tới server (Login, Chat, User...).
 * 2. **Nhận Response**: Xử lý 2 loại response từ server:
 *    - **Request-Response (1-to-1)**: Response chỉ gửi cho client đã gửi request
 *      - Ví dụ: login(), getUserList(), getRoomMessages()
 *      - Nhận qua: Promise-based `sendAndWaitForResponse()`
 *    - **Broadcast Response (1-to-Many)**: Response server gửi cho nhiều clients
 *      - Ví dụ: SEND_CHAT, USER_ONLINE, JOIN_ROOM
 *      - Nhận qua: Event listeners trong `useWebSocketSetup`
 * 3. **Quản lý kết nối**: Duy trì trạng thái kết nối thông qua SocketConnection.
 * 4. **Facade Pattern**: Tập hợp các service chuyên biệt (Auth, Chat, User) để dễ sử dụng.
 *
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
    waitForConnection = (timeout: number) => connection.waitForConnection(timeout);

    // Auth methods
    login = (data: any) => authService.login(data);
    reLogin = (data: any) => authService.reLogin(data);
    register = (data: any) => authService.register(data);
    logout = () => authService.logout();

    // Chat methods
    sendChat = (data: any) => chatService.sendChat(data);
    getRoomChatMessages = (data: any) => chatService.getRoomChatMessages(data);
    getPeopleChatMessages = (data: any) => chatService.getPeopleChatMessages(data);
    createRoom = (data: any) => chatService.createRoom(data);
    joinRoom = (data: any) => chatService.joinRoom(data);
    onChatReceived = (callback: any) => chatService.onChatReceived(callback);
    offChatReceived = (callback?: any) => chatService.offChatReceived(callback);

    // User methods
    checkUserExist = (username: string) => userService.checkUserExist(username);
    checkUserOnline = (username: string) => userService.checkUserOnline(username);
    getUserList = () => userService.getUserList();
}

const websocketService = new WebSocketService();
export default websocketService;

// Export types
export * from './SocketConnection';
export * from './AuthService';
export * from './ChatService';
export * from './UserService';