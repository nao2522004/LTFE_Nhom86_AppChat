import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from './hooks';
import {
    setConnected,
    setDisconnected,
    setReconnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setConnectionError,
} from '../features/socket/connectionSlice';
import {
    addMessage,
    addConversation,
    getUserList,
    updateConversation,
    incrementUnreadCount, addUser
} from '../features/chat/chatSlice';
import websocketService from "../services/websocket/MainService";
import {RawServerMessage, TransformContext, transformServerMessage} from "../shared/types/chat";

/**
 * Hook quản lý vòng đời và lắng nghe các Broadcast Responses từ WebSocket Server.
 *
 * @description
 * Hook này đóng vai trò là **Trạm thu phát Broadcast Responses** (không phải gửi request):
 *
 * 1. **Lắng nghe Broadcast Responses**:
 *    - Server gửi response tới NHIỀU clients cùng lúc (broadcast)
 *    - Ví dụ: SEND_CHAT, USER_ONLINE, JOIN_ROOM, USER_OFFLINE
 *    - Khác với Request-Response (1-to-1), đây là response dạng 1-to-Many
 *
 * 2. **Transform Data (Middleware)**:
 *    - Nhận response thô từ server: `{ event, status, data, mes }`
 *    - Chuẩn hóa về format của app (Message interface, Room interface...)
 *    - Validate data trước khi dispatch
 *
 * 3. **Cập nhật Redux Store**:
 *    - Dispatch actions để cập nhật state (addMessage, updateRoom...)
 *    - UI tự động re-render theo state mới
 *
 * @note
 * - Hook này **KHÔNG GỌI** các service methods (login, getRoomMessages...)
 * - Hook này **CHỈ LẮNG NGHE** broadcast responses từ server
 * - Request-Response (1-to-1) được xử lý bởi các service methods trong components/thunks
 *
 */

export const useWebSocketSetup = () => {
    const dispatch = useAppDispatch();
    const {isAuthenticated} = useAppSelector((state) => state.auth);

    const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);

    // Track if user list has been loaded
    const userListLoadedRef = useRef(false);
    const isSetupRef = useRef(false);
    const handlersRegisteredRef = useRef(false);
    const userListLoadingRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (isSetupRef.current) {
            return;
        }

        isSetupRef.current = true;

        const handleOpen = () => {

            dispatch(setConnected());
            dispatch(resetReconnectAttempts());

            // Load user list ONLY ONCE when connected
            if (!userListLoadedRef.current && !userListLoadingRef.current) {
                userListLoadedRef.current = true;
                dispatch(getUserList())
                    .finally(() => {
                        userListLoadedRef.current = true;
                        userListLoadingRef.current = false;
                    });
            } else {
                console.log('[useWebSocketSetup] User list already loaded/loading, skipping');
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
            console.log('SEND_CHAT broadcast received:', message);
            if (message.status === 'success' && message.data) {
                const state = (dispatch as any).getState();
                const context: TransformContext = {
                    conversations: state.chat.conversations.map((c: any) => ({
                        id: c.id,
                        name: c.name
                    })),
                    users: state.chat.userList.map((u: any) => ({
                        id: u.id || u.username,
                        username: u.username
                    }))
                };
                const rawMessage: RawServerMessage = {
                    id: message.data.id || Date.now(),
                    mes: message.data.mes || message.data.content,
                    name: message.data.from || message.data.sender || '',
                    to: message.data.to,
                    createAt: message.data.timestamp
                        ? new Date(message.data.timestamp).toISOString()
                        : new Date().toISOString(),
                    type: message.data.type || 0
                };

                const transformedMessage = transformServerMessage(rawMessage, context);

                dispatch(addMessage(transformedMessage));

                const sender = transformedMessage.sender.username;
                const receiver = transformedMessage.receiver.id;

                const conversationId = message.data.to;

                dispatch(updateConversation({
                    id: sender,
                    updates: {
                        lastMessage: transformedMessage,
                        updatedAt: transformedMessage.timestamp
                    }
                }));

                // Update conversation với receiver
                dispatch(updateConversation({
                    id: receiver,
                    updates: {
                        lastMessage: transformedMessage,
                        updatedAt: transformedMessage.timestamp
                    }
                }));

                if (sender !== activeConversationId) {
                    dispatch(incrementUnreadCount(sender));
                }
                if (receiver !== activeConversationId) {
                    dispatch(incrementUnreadCount(receiver));
                }

                dispatch(updateConversation({
                    id: conversationId,
                    updates: {
                        lastMessage: transformedMessage,
                        updatedAt: transformedMessage.timestamp
                    }
                }));

                if (conversationId !== activeConversationId) {
                    dispatch(incrementUnreadCount(conversationId));
                }

                dispatch(updateConversation({
                    id: conversationId,
                    updates: {
                        lastMessage: transformedMessage,
                        updatedAt: transformedMessage.timestamp
                    }
                }));

                if (conversationId !== activeConversationId) {
                    dispatch(incrementUnreadCount(conversationId));
                }

                dispatch(addUser({
                    id: transformedMessage.sender.username,
                    username: transformedMessage.sender.username,
                    displayName: transformedMessage.sender.displayName || transformedMessage.sender.username,
                    avatar: transformedMessage.sender.avatar,
                    isOnline: true,
                    type: 'user'
                }));

                console.log('Message processed and room updated:', {
                    messageId: transformedMessage.id,
                    conversationId: conversationId,
                    isActiveConversation: conversationId === activeConversationId,
                    unreadIncremented: conversationId !== activeConversationId
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
                // Will be handled by createGroupChat.fulfilled in chatSlice
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
        if (!handlersRegisteredRef.current) {
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

            handlersRegisteredRef.current = true;
        }

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
        };
    }, [dispatch, isAuthenticated, activeConversationId]);
};

export default useWebSocketSetup;