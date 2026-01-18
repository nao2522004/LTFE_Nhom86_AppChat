import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from './hooks';
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
import {getUserList} from '../features/chat/chatThunks';
import websocketService from "../services/websocket/MainService";
import {Message, RawServerMessage, TransformContext, transformServerMessage} from "../shared/types/chat";
import store from "../app/store";
import { decodeEmoji } from '../shared/utils/emojiUtils';

/**
 * Hook quản lý WebSocket lifecycle và broadcast responses
 */
export const useWebSocketSetup = () => {
    const dispatch = useAppDispatch();
    const {isAuthenticated} = useAppSelector((state) => state.auth);

    const userListLoadedRef = useRef(false);
    const setupCompleteRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setupCompleteRef.current = false;
            userListLoadedRef.current = false;
            return;
        }

        if (setupCompleteRef.current) return;
        setupCompleteRef.current = true;

        // ===== HELPER FUNCTION =====
        function updateConversationWithMessage(
            dispatch: any,
            message: Message,
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

            const currentActiveId = store.getState().ui.activeConversationId;
            // Increment unread count if not active
            if (sender !== currentActiveId) {
                dispatch(incrementUnreadCount(sender));
            }
            if (receiver !== currentActiveId) {
                dispatch(incrementUnreadCount(receiver));
            }
        }

        // ===== CONNECTION HANDLERS =====
        const handleOpen = () => {
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
            console.log('WebSocket SendChat Received:', message);
            try {

                if (message.status !== 'success') {
                    console.error('SendChat not success:', message.status);
                    return;
                }

                if (message.status !== 'success') {
                    console.error('SendChat not success:', message.status);
                    return;
                }

                const state = store.getState();
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
                    name: message.data.name || message.data.sender || '',
                    to: message.data.to,
                    createAt: message.timestamp
                        ? message.timestamp
                        : new Date().toISOString(),
                    type: message.data.type || 0
                };

                let transformedMessage = transformServerMessage(rawMessage, context);
                
                // DECODE emoji
                transformedMessage = {
                    ...transformedMessage,
                    content: decodeEmoji(transformedMessage.content),
                    contentData: (transformedMessage.contentData?.type === 'text')
                        ? {
                            ...transformedMessage.contentData,
                            text: decodeEmoji(transformedMessage.contentData.text)
                        }
                        : transformedMessage.contentData
                };
                
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
                        dispatch(addMessage({...transformedMessage, status: 'sent'}));
                        updateConversationWithMessage(dispatch, transformedMessage);
                        return;
                    }
                }

                // Message from other user
                dispatch(addMessage(transformedMessage));
                updateConversationWithMessage(dispatch, transformedMessage);

                // Add sender to users if not exists
                if (!isSentByMe) {
                    const senderExists = state.chat.users.allIds.includes(transformedMessage.sender.username);
                    console.log('Sender exists?', senderExists);

                    if (!senderExists) {
                        console.log('Adding sender to users...');
                        dispatch(addUser({
                            id: transformedMessage.sender.username,
                            username: transformedMessage.sender.username,
                            displayName: transformedMessage.sender.username,
                            email: '',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            isOnline: true,
                        }));
                        console.log('Sender added');
                    }
                }

                console.log('HANDLER SEND CHAT COMPLETE!');
            } catch (error: any) {
                console.error('ERROR in handleSendChat:', error);
                console.error('Error message:', error?.message);
                console.error('Error stack:', error?.stack);
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
    }, [dispatch, isAuthenticated]);
};

export default useWebSocketSetup;