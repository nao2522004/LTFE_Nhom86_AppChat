import { WebSocketConnection } from './WebSocketConnection';
import { AuthService } from './AuthService';
import { ChatService } from './ChatService';
import { UserService } from './UserService';

const WS_URL = process.env.REACT_APP_SOCKET_URL || 'wss://chat.longapp.site/chat/chat';

// Tạo connection duy nhất
const connection = new WebSocketConnection(WS_URL, {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2
});

// Tạo các service dùng chung connection
const authService = new AuthService(connection);
const chatService = new ChatService(connection);
const userService = new UserService(connection);

// ===== WEBSOCKET SERVICE FACADE =====
// Đây là interface duy nhất mà app sẽ dùng
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