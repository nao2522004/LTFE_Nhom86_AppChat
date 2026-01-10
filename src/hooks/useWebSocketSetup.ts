import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import {
    setConnected,
    setDisconnected,
    setReconnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setSocketError,
} from '../features/socket/socketSlice';
import {
    addMessage,
    updateMessage,
    removeMessage,
    addUser,
    updateConversation, incrementUnreadCount, addConversation,
} from '../features/chat/chatSlice';
import { getUserList } from '../features/chat/chatThunks';
import websocketService from "../services/websocket/MainService";
import { Message, RawServerMessage, TransformContext, transformServerMessage } from "../shared/types/chat";

/**
 * Hook quản lý WebSocket lifecycle và broadcast responses
 */
export const useWebSocketSetup = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const activeConversationId = useAppSelector((state) => state.ui.activeConversationId);

    const userListLoadedRef = useRef(false);
    const isSetupRef = useRef(false);
    const handlersRegisteredRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (isSetupRef.current) return;

        isSetupRef.current = true;

        // ===== HELPER FUNCTION =====
        function updateConversationWithMessage(
            dispatch: any,
            message: Message,
            activeConversationId: string | null
        ) {
            const sender = message.sender.username;
            const receiver = message.receiver.id;

            // Update conversations
            dispatch(updateConversation({
                id: sender,
                updates: {
                    lastMessage: message,
                    updatedAt: message.timestamp
                }
            }));

            dispatch(updateConversation({
                id: receiver,
                updates: {
                    lastMessage: message,
                    updatedAt: message.timestamp
                }
            }));

            // Increment unread count if not active
            if (sender !== activeConversationId) {
                dispatch(incrementUnreadCount(sender));
            }
            if (receiver !== activeConversationId) {
                dispatch(incrementUnreadCount(receiver));
            }
        }

        // ===== CONNECTION HANDLERS =====
        const handleOpen = () => {
            console.log('WebSocket Connected');
            dispatch(setConnected());
            dispatch(resetReconnectAttempts());

            // Load user list ONLY ONCE when connected
            if (!userListLoadedRef.current) {
                userListLoadedRef.current = true;
                dispatch(getUserList());
            }
        };

        const handleClose = (data: any) => {
            console.log('WebSocket Closed:', data);
            dispatch(setDisconnected({
                isManual: false,
                error: data.reason
            }));
        };

        const handleError = (error: any) => {
            console.error('WebSocket Error:', error);
            dispatch(setSocketError(error.message || 'Connection error'));
        };

        const handleReconnecting = () => {
            console.log('WebSocket Reconnecting...');
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

        // ===== CHAT HANDLERS =====
        const handleSendChat = (message: any) => {
            console.log('SEND_CHAT broadcast received:', message);
            if (message.status === 'success' && message.data) {
                const state = (dispatch as any).getState();
                const currentUser = state.auth.user;

                const context: TransformContext = {
                    conversations: state.chat.conversations.allIds.map((id: string) => ({
                        id,
                        name: state.chat.conversations.byId[id].name
                    })),
                    users: state.chat.users.allIds.map((id: string) => ({
                        id,
                        username: state.chat.users.byId[id].username
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
                const isSentByMe = currentUser && transformedMessage.sender.username === currentUser.username;

                if (isSentByMe) {
                    // Find and replace temp message
                    const tempMessages = state.chat.messages.allIds
                        .map((id: string) => state.chat.messages.byId[id])
                        .filter((m: Message) =>
                            m.id.startsWith('temp_') &&
                            m.content === transformedMessage.content &&
                            m.receiver.id === transformedMessage.receiver.id &&
                            m.status !== 'failed'
                        );

                    if (tempMessages.length > 0) {
                        const tempMessage = tempMessages[0];
                        dispatch(removeMessage(tempMessage.id));
                        dispatch(addMessage({ ...transformedMessage, status: 'sent' }));
                        updateConversationWithMessage(dispatch, transformedMessage, activeConversationId);
                        return;
                    }
                }

                // Message from other user
                dispatch(addMessage(transformedMessage));
                updateConversationWithMessage(dispatch, transformedMessage, activeConversationId);

                // Add sender to users if not exists
                dispatch(addUser({
                    id: transformedMessage.sender.username,
                    username: transformedMessage.sender.username,
                    displayName: transformedMessage.sender.displayName || transformedMessage.sender.username,
                    avatar: transformedMessage.sender.avatar,
                    email: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isOnline: true,
                }));
            }
        };

        const handleJoinRoom = (data: any) => {
            console.log('User joined room:', data);
            // Handle user join notification
        };

        const handleLeaveRoom = (data: any) => {
            console.log('User left room:', data);
            // Handle user leave notification
        };

        const handleCreateRoom = (data: any) => {
            console.log('Room created:', data);
            if (data.status === 'success' && data.data?.room) {
                dispatch(addConversation(data.data.room));
            }
        };

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
        };
    }, [dispatch, isAuthenticated, activeConversationId]);
};

export default useWebSocketSetup;