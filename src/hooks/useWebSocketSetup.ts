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
    incrementUnreadCount, addUser, removeMessage
} from '../features/chat/chatSlice';
import websocketService from "../services/websocket/MainService";
import {Message, RawServerMessage, TransformContext, transformServerMessage} from "../shared/types/chat";

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
                const currentUser = state.auth.user;
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

                const isSentByMe = currentUser &&
                    transformedMessage.sender.username === currentUser.username;

                if (isSentByMe) {
                    console.log('%c[SEND_CHAT] Own message - Finding temp to replace',
                        'background: #f39c12; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold'
                    );

                    // TÌM temp message matching
                    const tempMessages = state.chat.messages.filter(
                        (m: Message) =>
                            m.id.startsWith('temp_') &&
                            m.content === transformedMessage.content &&
                            m.receiver.id === transformedMessage.receiver.id &&
                            m.status !== 'failed'  // Chỉ replace message đang pending/sending
                    );

                    if (tempMessages.length > 0) {
                        const tempMessage = tempMessages[0];

                        console.log('%c[SEND_CHAT] Replacing temp message',
                            'background: #8e44ad; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold',
                            {
                                tempId: tempMessage.id,
                                serverId: transformedMessage.id,
                                content: transformedMessage.content
                            }
                        );

                        dispatch(removeMessage(tempMessage.id));

                        // DD server message với ID thật
                        dispatch(addMessage({
                            ...transformedMessage,
                            status: 'sent'  // Server confirmed
                        }));

                        // Update conversation
                        updateConversationWithMessage(dispatch, transformedMessage, state.chat.activeConversationId);

                        return;
                    } else {
                        console.log('%c[SEND_CHAT] Temp message not found, adding server message',
                            'background: #e67e22; color: white; padding: 2px 8px; border-radius: 3px;'
                        );
                    }
                }

                // Nếu là tin của NGƯỜI KHÁC → ADD bình thường
                console.log('%c[SEND_CHAT] Message from other user',
                    'background: #16a085; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold',
                    {
                        from: transformedMessage.sender.username,
                        content: transformedMessage.content
                    }
                );

                dispatch(addMessage(transformedMessage));

                updateConversationWithMessage(dispatch, transformedMessage, state.chat.activeConversationId);

                dispatch(addUser({
                    id: transformedMessage.sender.username,
                    username: transformedMessage.sender.username,
                    displayName: transformedMessage.sender.displayName || transformedMessage.sender.username,
                    avatar: transformedMessage.sender.avatar,
                    isOnline: true,
                    type: 'user'
                }));
            }
        };

        // Helper function để update conversation
        function updateConversationWithMessage(
            dispatch: any,
            message: Message,
            activeConversationId: string | null
        ) {
            const sender = message.sender.username;
            const receiver = message.receiver.id;

            // Update conversation của sender
            dispatch(updateConversation({
                id: sender,
                updates: {
                    lastMessage: message,
                    updatedAt: message.timestamp
                }
            }));

            // Update conversation của receiver
            dispatch(updateConversation({
                id: receiver,
                updates: {
                    lastMessage: message,
                    updatedAt: message.timestamp
                }
            }));

            // Increment unread count nếu không phải active conversation
            if (sender !== activeConversationId) {
                dispatch(incrementUnreadCount(sender));
            }
            if (receiver !== activeConversationId) {
                dispatch(incrementUnreadCount(receiver));
            }
        }

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