import {useEffect, useRef} from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import {
    setConnected,
    setDisconnected,
    setReconnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setConnectionError,
} from '../features/socket/socketSlice';
import {addMessage, addRoom, getUserList, updateRoom, incrementUnreadCount } from '../features/chat/chatSlice';
import websocketService from "../services/websocket/MainService";

/**
 * Hook quản lý vòng đời và thiết lập các sự kiện WebSocket toàn cục.
 * * @description
 * Hook này đóng vai trò là "Trạm điều phối dữ liệu" giữa Server và Client:
 * 1. **Kết nối & Lắng nghe**: Đăng ký các sự kiện từ WebSocket Service (Open, Close, Message...).
 * 2. **Xử lý dữ liệu (Middleware)**: Nhận response thô từ Server, chuẩn hóa (transform) về định dạng của App.
 * 3. **Cập nhật Store**: Dispatch dữ liệu đã chuẩn hóa lên Redux Store để UI cập nhật thời gian thực.
 * * @example
 * // Sử dụng duy nhất một lần tại App.tsx
 * useWebSocketSetup();
 * * @notes
 * - **isSetupRef**: Sử dụng kỹ thuật "Ref Gate" để chặn việc đăng ký listener 2 lần trong React Strict Mode (Development).
 * - **userListLoadedRef**: Đảm bảo danh sách người dùng (`getUserList`) chỉ được tải một lần đầu tiên khi kết nối thành công, tránh spam API khi socket tự động reconnect.
 * - **Cleanup**: Tự động gỡ bỏ (off) tất cả listeners khi component unmount để tránh rò rỉ bộ nhớ (Memory Leak).
 * * @requires websocketService - Service điều khiển kết nối Socket.
 * @requires useAppDispatch - Hook để gửi hành động lên Redux Store.
 */

export const useWebSocketSetup = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const activeRoomId = useAppSelector((state) => state.chat.activeRoomId);

    // Track if user list has been loaded
    const userListLoadedRef = useRef(false);
    const isSetupRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (isSetupRef.current) {
            return;
        }

        isSetupRef.current = true;
        console.log('[useWebSocketSetup] Setting up WebSocket listeners...');

        const handleOpen = () => {

            dispatch(setConnected());
            dispatch(resetReconnectAttempts());

            // Load user list ONLY ONCE when connected
            if (!userListLoadedRef.current) {
                console.log('Loading user list on first socket...');
                dispatch(getUserList());
                userListLoadedRef.current = true;
            }
        };

        const handleClose = (data: any) => {
            console.log('WebSocket Closed:');
            dispatch(setDisconnected({
                isManual: false,
                error: data.reason
            }));
        };

        const handleError = (error: any) => {
            console.error('WebSocket Error:', error);
            dispatch(setConnectionError(error.message || 'Connection error'));
        };

        const handleReconnecting = (data: any) => {
            dispatch(setReconnecting());
            dispatch(incrementReconnectAttempts());
        };

        const handleReconnectionFailed = () => {
            console.error('Max reconnection attempts reached');
            dispatch(setDisconnected({
                isManual: false,
                error: 'Failed to reconnect after multiple attempts'
            }));
        };

        // ===== CHAT EVENTS =====

        // Nhận tin nhắn mới từ server
        const handleSendChat = (message: any) => {
            if (message.status === 'success' && message.data) {
                // Transform server message to app Message type
                const newMessage = {
                    id: message.data.id || `msg_${Date.now()}`,
                    content: message.data.mes || message.data.content,
                    sender: {
                        id: message.data.from?.id || message.data.from,
                        username: message.data.from?.username || message.data.from,
                        displayName: message.data.from?.displayName,
                        avatar: message.data.from?.avatar
                    },
                    roomId: message.data.to || message.data.roomId,
                    timestamp: message.data.timestamp
                        ? new Date(message.data.timestamp).toISOString()
                        : new Date().toISOString(),
                    status: 'sent' as const,
                    type: 'text' as const
                };

                dispatch(addMessage(newMessage));
                const roomId = message.data.to || message.data.roomId;

                dispatch(updateRoom({
                    id: roomId,
                    updates: {
                        lastMessage: newMessage,
                        updatedAt: newMessage.timestamp
                    }
                }));

                if (roomId !== activeRoomId) {
                    dispatch(incrementUnreadCount(roomId));
                }

                console.log('Message processed and room updated:', {
                    messageId: newMessage.id,
                    roomId: roomId,
                    isActiveRoom: roomId === activeRoomId,
                    unreadIncremented: roomId !== activeRoomId
                });
            }
        };

        // User join/leave room events
        const handleJoinRoom = (data: any) => {
            console.log('User joined room:', data);
            // Handle user join notification
        };

        const handleLeaveRoom = (data: any) => {
            console.log('User left room:', data);
            // Handle user leave notification
        };

        // Room created event
        const handleCreateRoom = (data: any) => {
            if (data.status === 'success' && data.data?.room) {
                dispatch(addRoom(data.data.room));
            }
        };

        // ===== USER EVENTS =====

        const handleUserOnline = (data: any) => {
            console.log('User online:', data);
            // Update user status in userList
        };

        const handleUserOffline = (data: any) => {
            console.log('User offline:', data);
            // Update user status in userList
        };

        // ===== REGISTER LISTENERS =====

        // Connection events
        websocketService.on('open', handleOpen);
        websocketService.on('close', handleClose);
        websocketService.on('error', handleError);
        websocketService.on('reconnecting', handleReconnecting);
        websocketService.on('reconnection_failed', handleReconnectionFailed);

        // Chat events
        websocketService.on('SEND_CHAT', handleSendChat);
        websocketService.on('JOIN_ROOM', handleJoinRoom);
        websocketService.on('LEAVE_ROOM', handleLeaveRoom);
        websocketService.on('CREATE_ROOM', handleCreateRoom);

        // User events
        websocketService.on('USER_ONLINE', handleUserOnline);
        websocketService.on('USER_OFFLINE', handleUserOffline);

        if (websocketService.isConnected()) {
            handleOpen();
        }

        // ===== CLEANUP =====
        return () => {
            // Remove all listeners
            websocketService.off('open', handleOpen);
            websocketService.off('close', handleClose);
            websocketService.off('error', handleError);
            websocketService.off('reconnecting', handleReconnecting);
            websocketService.off('reconnection_failed', handleReconnectionFailed);

            websocketService.off('SEND_CHAT', handleSendChat);
            websocketService.off('JOIN_ROOM', handleJoinRoom);
            websocketService.off('LEAVE_ROOM', handleLeaveRoom);
            websocketService.off('CREATE_ROOM', handleCreateRoom);

            websocketService.off('USER_ONLINE', handleUserOnline);
            websocketService.off('USER_OFFLINE', handleUserOffline);

            websocketService.off('message');

            userListLoadedRef.current = false;
            isSetupRef.current = false;
        };
    }, [dispatch, isAuthenticated]);
};

export default useWebSocketSetup;